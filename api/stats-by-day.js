import { getDailyStats } from './db';

export default async function handler(req, res) {
  try {
    const { image, date } = req.query;
    const stats = await getDailyStats();

    if (image) {
      // Filter for specific image
      const imageStats = stats[image];
      if (!imageStats) {
        return res.status(404).json({ error: 'Image not found' });
      }

      if (date) {
        // Filter for specific date
        const dailyCount = imageStats.dailyViews[date] || 0;
        return res.json({
          image,
          date,
          views: dailyCount
        });
      }

      // Return all daily stats for the image
      return res.json({
        image,
        totalViews: imageStats.totalViews,
        dailyViews: imageStats.dailyViews
      });
    }

    // Return all stats grouped by day
    const dailyStats = {};
    Object.keys(stats).forEach(img => {
      Object.keys(stats[img].dailyViews).forEach(day => {
        if (!dailyStats[day]) dailyStats[day] = {};
        dailyStats[day][img] = stats[img].dailyViews[day];
      });
    });

    res.json(dailyStats);
  } catch (error) {
    console.error('Error fetching daily statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}