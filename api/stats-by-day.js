import {
    getDailyStats,
    getImageStats
} from './db';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    try {
        const {
            image,
            date,
            nocache
        } = req.query;
        const stats = await getDailyStats(nocache !== 'true');

        if (image) {
            const imageStats = await getImageStats(image);
            if (!imageStats) {
                return res.status(404).json({
                    error: 'Image not found'
                });
            }

            if (date) {
                const dailyCount = imageStats.dailyViews[date] || 0;
                return res.json({
                    image,
                    date,
                    views: dailyCount
                });
            }

            return res.json({
                image,
                totalViews: imageStats.totalViews,
                dailyViews: imageStats.dailyViews
            });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error fetching daily statistics:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}