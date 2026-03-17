const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
// Refresh setiap jam 10 pagi WIB = 03:00 UTC
const CACHE_HOUR_UTC = 3;

let cachedData = null;
let cacheDate = null; // format YYYY-MM-DD

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const now = new Date();
        const nowUtc = new Date(now.toISOString());
        const todayStr = nowUtc.toISOString().split('T')[0];

        const currentHourUtc = nowUtc.getUTCHours();
        let targetDate;
        if (currentHourUtc >= CACHE_HOUR_UTC) {
            targetDate = todayStr;
        } else {
            const yesterday = new Date(nowUtc);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            targetDate = yesterday.toISOString().split('T')[0];
        }

        let source = '';

        if (cachedData && cacheDate === targetDate) {
            source = 'cache';
            console.log(`Serving from cache for date ${targetDate}`);
        } else {
            source = 'NASA API';
            console.log(`Fetching from NASA API for target date ${targetDate}`);

            const apiKey = process.env.NASA_API_KEY;
            if (!apiKey) {
                throw new Error('NASA_API_KEY environment variable not set');
            }

            const url = `${NASA_API_URL}?api_key=${apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`NASA API responded with status ${response.status}`);
            }

            const nasaData = await response.json();

            if (nasaData.media_type !== 'image') {
                nasaData.url = 'https://via.placeholder.com/800x400?text=Not+an+Image';
            }

            cachedData = {
                title: nasaData.title,
                url: nasaData.url,
                explanation: nasaData.explanation,
                credit: nasaData.copyright || 'NASA',
                date: nasaData.date,
            };

            cacheDate = targetDate;
        }

        const responseData = {
            ...cachedData,
            source,
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({ error: 'Failed to fetch APOD' });
    }
}