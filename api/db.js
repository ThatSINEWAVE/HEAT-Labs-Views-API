import {
    kv
} from '@vercel/kv';

// Export the kv instance for rate limiting
export {
    kv
};

// Record a view for a specific image
export async function recordView(imageName) {
    const today = new Date().toISOString().split('T')[0];

    await kv.pipeline()
        .hincrby(`image:${imageName}`, 'totalViews', 1)
        .hincrby(`image:${imageName}:days`, today, 1)
        .sadd('images', imageName)
        .exec();
}

// Get statistics for all images with optional caching
let cachedStats = null;
let lastCacheTime = 0;
const CACHE_TTL = 75000; // 30 minute cache

export async function getAllStats(useCache = true) {
    // Return cached version if available and not expired
    if (useCache && cachedStats && Date.now() - lastCacheTime < CACHE_TTL) {
        return cachedStats;
    }

    const images = await kv.smembers('images');
    const stats = {};

    // Use pipeline for all image stats
    const pipeline = kv.pipeline();
    images.forEach(image => {
        pipeline.hget(`image:${image}`, 'totalViews');
        pipeline.hgetall(`image:${image}:days`);
    });

    const results = await pipeline.exec();

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const totalViews = results[i * 2];
        const dailyViews = results[i * 2 + 1];

        stats[image] = {
            totalViews: parseInt(totalViews || '0'),
            dailyViews: dailyViews || {}
        };
    }

    cachedStats = stats;
    lastCacheTime = Date.now();
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

// Get daily statistics for all images with caching
let cachedDailyStats = null;
let lastDailyCacheTime = 0;

export async function getDailyStats(useCache = true) {
    if (useCache && cachedDailyStats && Date.now() - lastDailyCacheTime < CACHE_TTL) {
        return cachedDailyStats;
    }

    const stats = await getAllStats(useCache);
    const dailyStats = {};

    for (const [image, imageStats] of Object.entries(stats)) {
        for (const [date, count] of Object.entries(imageStats.dailyViews)) {
            if (!dailyStats[date]) dailyStats[date] = {};
            dailyStats[date][image] = parseInt(count);
        }
    }

    cachedDailyStats = dailyStats;
    lastDailyCacheTime = Date.now();
    return dailyStats;
}