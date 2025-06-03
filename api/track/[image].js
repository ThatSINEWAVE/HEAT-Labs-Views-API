import {
    recordView,
    kv
} from '../db';

export default async function handler(req, res) {
    const {
        image
    } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    try {
        // Rate limiting - check last request time
        const lastRequestKey = `rate_limit:${ip}:${image}`;
        const lastRequest = await kv.get(lastRequestKey);
        const now = Date.now();

        if (lastRequest && (now - parseInt(lastRequest)) < 1000) {
            // Too soon since last request - serve pixel but don't record view
            const pixel = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                'base64'
            );
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.send(pixel);
        }

        // Record the view and update rate limit
        await kv.pipeline()
            .set(lastRequestKey, now.toString())
            .expire(lastRequestKey, 2) // Keep for 2 seconds to prevent spam
            .exec();

        await recordView(image);

        // Serve a transparent 1x1 pixel
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            'base64'
        );

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(pixel);
    } catch (error) {
        console.error('Error serving tracking pixel:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}