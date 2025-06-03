import {
    recordView,
    kv
} from '../db';

// Helper function to serve the transparent 1x1 pixel
function servePixel(res) {
    const pixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64'
    );
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pixel);
}

// Helper function to get client IP address
function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        'unknown-ip';
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    try {
        const {
            image
        } = req.query;

        // Validate required image parameter
        if (!image || typeof image !== 'string') {
            console.warn('Invalid or missing image parameter');
            return servePixel(res);
        }

        // Get client IP address
        const ip = getClientIp(req);
        if (ip === 'unknown-ip') {
            console.warn('Could not determine client IP address');
        }

        // Rate limiting - check last request time
        const rateLimitKey = `rate_limit:${ip}:${image}`;
        const lastRequestTime = await kv.get(rateLimitKey);
        const currentTime = Date.now();

        // If request came too soon, serve pixel without recording
        if (lastRequestTime && (currentTime - parseInt(lastRequestTime)) < 1000) {
            return servePixel(res);
        }

        // Update rate limit and record view
        await kv.pipeline()
            .set(rateLimitKey, currentTime.toString())
            .expire(rateLimitKey, 2) // Expire after 2 seconds
            .exec();

        // Record the view
        await recordView(image);

        // Serve the tracking pixel
        return servePixel(res);

    } catch (error) {
        console.error('Error in tracking pixel handler:', error);
        // Always serve the pixel even if something fails
        return servePixel(res);
    }
}