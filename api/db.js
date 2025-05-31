import { kv } from '@vercel/kv';

// Record a view for a specific image
export async function recordView(imageName) {
  const today = new Date().toISOString().split('T')[0];

  // Using pipeline for atomic operations
  await kv.pipeline()
    .hincrby(`image:${imageName}`, 'totalViews', 1)
    .hincrby(`image:${imageName}:days`, today, 1)
    .sadd('images', imageName)
    .exec();
}

// Get statistics for all images
export async function getAllStats() {
  const images = await kv.smembers('images');
  const stats = {};

  for (const image of images) {
    stats[image] = await getImageStats(image);
  }

  return stats;
}

// Get statistics for a specific image
export async function getImageStats(imageName) {
  const [totalViews, dailyViews] = await kv
    .pipeline()
    .hget(`image:${imageName}`, 'totalViews')
    .hgetall(`image:${imageName}:days`)
    .exec();

  return {
    totalViews: parseInt(totalViews || '0'),
    dailyViews: dailyViews || {}
  };
}

// Get daily statistics for all images
export async function getDailyStats() {
  const images = await kv.smembers('images');
  const dailyStats = {};

  for (const image of images) {
    const stats = await getImageStats(image);
    for (const [date, count] of Object.entries(stats.dailyViews)) {
      if (!dailyStats[date]) dailyStats[date] = {};
      dailyStats[date][image] = parseInt(count);
    }
  }

  return dailyStats;
}