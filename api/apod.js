const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 jam

let cachedData = null;
let cacheTimestamp = null;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const now = Date.now();
        let source = '';

        if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
            source = 'cache';
            console.log('Serving from cache');
        } else {
            source = 'NASA API';
            console.log('Fetching from NASA API');

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

            cacheTimestamp = now;
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