import { recordView } from '../db';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { image } = req.query;

  // Validate image name format
  if (!image.startsWith('pcwstats-tracker-pixel-') || !image.endsWith('.png')) {
    return res.status(400).json({ error: 'Invalid tracking pixel name' });
  }

  try {
    // Record the view
    await recordView(image);

    // Serve the transparent pixel
    const pixelPath = path.join(process.cwd(), 'trackers', image);

    // Check if file exists
    try {
      await fs.promises.access(pixelPath);
    } catch {
      // If the specific pixel doesn't exist, use a default one
      const defaultPixelPath = path.join(process.cwd(), 'trackers', 'pcwstats-tracker-pixel-default.png');

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(fs.readFileSync(defaultPixelPath));
    }

    // Serve the requested pixel
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(fs.readFileSync(pixelPath));
  } catch (error) {
    console.error('Error serving tracking pixel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}