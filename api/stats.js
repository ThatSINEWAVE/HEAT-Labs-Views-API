import { getAllStats, getImageStats } from './db';

export default async function handler(req, res) {
  try {
    const { image } = req.query;

    if (image) {
      const stats = await getImageStats(image);
      if (!stats) {
        return res.status(404).json({ error: 'Image not found' });
      }
      return res.json(stats);
    }

    const stats = await getAllStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}