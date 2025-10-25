// Vercel supports the use of common dependencies like 'node-fetch'
const fetch = require('node-fetch');

// ⛔️ Keep this server-side only
const API_KEY = process.env.YOUTUBE_API_KEY; // USE ENVIRONMENT VARIABLE
// ... rest of your constants and caching logic ...
const PLAYLIST_ID = 'UU9RmaPmtfVYWJuYig1Q_k3Q';
const CHANNEL_ID = 'UC9RmaPmtfVYWJuYig1Q_k3Q';

// ---- Simple in-memory cache ...
const cache = {
  live: { data: null, ts: 0 },
  sermons: { data: null, ts: 0 },
};

// Tune these to taste:
const LIVE_TTL_MS = 5 * 1000;      // 5s => near-immediate live updates
const SERMONS_TTL_MS = 10 * 60 * 1000; // 10 min => big quota saver

// ... fetchLiveNow and fetchSermons functions remain the same ...

// 💡 NOTE: You must redefine/include your fetchLiveNow and fetchSermons functions here.
// I've omitted them for brevity but they must be in this file.

// Vercel Serverless Function format: (req, res)
module.exports = async (req, res) => {
    try {
        const now = Date.now();

        // --- LIVE: short TTL for near-instant updates ---
        let liveData = cache.live.data;
        const liveFresh = now - cache.live.ts < LIVE_TTL_MS;
        if (!liveFresh) {
            liveData = await fetchLiveNow(); // Must be defined
            cache.live = { data: liveData, ts: now };
        }

        // --- SERMONS: longer TTL to save quota ---
        let sermonsData = cache.sermons.data;
        const sermonsFresh = now - cache.sermons.ts < SERMONS_TTL_MS;
        if (!sermonsFresh) {
            const fetched = await fetchSermons(); // Must be defined
            sermonsData = fetched;
            cache.sermons = { data: sermonsData, ts: now };
        }

        let videoId = liveData?.videoId || sermonsData.latestUpload?.videoId || null;
        let videoTitle = liveData?.videoTitle || sermonsData.latestUpload?.title || null;

        const body = {
            liveVideo: {
                videoId,
                videoTitle,
                isLive: Boolean(liveData),
                liveStatusAgeMs: now - cache.live.ts,
                sermonsAgeMs: now - cache.sermons.ts,
            },
            sermons: sermonsData.sermonsToDisplay || [],
        };

        // Caching headers:
        // Use res.setHeader() and res.status().json() for Vercel
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=5');
        
        return res.status(200).json(body);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to fetch data.' });
    }
};