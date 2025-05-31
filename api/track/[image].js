import { recordView } from '../db';

export default async function handler(req, res) {
  const { image } = req.query;

  try {
    // Record the view
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
    res.status(500).json({ error: 'Internal server error' });
  }
}