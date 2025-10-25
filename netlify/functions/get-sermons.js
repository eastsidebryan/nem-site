// netlify/functions/get-sermons.js
const fetch = require('node-fetch');

// ⛔️ Keep this server-side only
const API_KEY = 'AIzaSyDfQYnnMacN4mdHij1_YdnHHJAjJzueLPI'; 
// Uploads playlist ID (looks like 'UU...' and corresponds to channel uploads)
const PLAYLIST_ID = 'UU9RmaPmtfVYWJuYig1Q_k3Q';
const CHANNEL_ID = 'UC9RmaPmtfVYWJuYig1Q_k3Q';

// ---- Simple in-memory cache (persists on warm lambda containers) ----
const cache = {
  live: { data: null, ts: 0 },
  sermons: { data: null, ts: 0 },
};

// Tune these to taste:
const LIVE_TTL_MS = 5 * 1000;      // 5s => near-immediate live updates
const SERMONS_TTL_MS = 10 * 60 * 1000; // 10 min => big quota saver

async function fetchLiveNow() {
  const liveUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&maxResults=1&key=${API_KEY}`;
  const res = await fetch(liveUrl);
  if (!res.ok) throw new Error(`Live check failed: ${res.status}`);
  const data = await res.json();

  if (data.items && data.items.length > 0) {
    return {
      videoId: data.items[0].id.videoId,
      videoTitle: data.items[0].snippet.title,
    };
  }
  return null; // not live
}

async function fetchSermons() {
  const sermonsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=10&key=${API_KEY}`;
  const res = await fetch(sermonsUrl);
  if (!res.ok) throw new Error(`Playlist fetch failed: ${res.status}`);
  const data = await res.json();

  const displayed = new Set();
  const sermonsToDisplay = [];

  for (const item of data.items || []) {
    const s = item.snippet;
    const vid = s?.resourceId?.videoId;
    if (!vid) continue;
    // Ignore live placeholders in the playlist
    if (s.liveBroadcastContent === 'live') continue;
    if (displayed.has(vid)) continue;

    displayed.add(vid);
    sermonsToDisplay.push({
      title: s.title,
      videoId: vid,
      thumbnailUrl: s.thumbnails?.high?.url || null,
    });

    if (sermonsToDisplay.length >= 6) break;
  }

  // Also expose the very latest upload for fallback
  const latestUpload = sermonsToDisplay[0] || null;

  return { sermonsToDisplay, latestUpload };
}

exports.handler = async () => {
  try {
    const now = Date.now();

    // --- LIVE: short TTL for near-instant updates ---
    let liveData = cache.live.data;
    const liveFresh = now - cache.live.ts < LIVE_TTL_MS;
    if (!liveFresh) {
      liveData = await fetchLiveNow();
      cache.live = { data: liveData, ts: now };
    }

    // --- SERMONS: longer TTL to save quota ---
    let sermonsData = cache.sermons.data;
    const sermonsFresh = now - cache.sermons.ts < SERMONS_TTL_MS;
    if (!sermonsFresh) {
      const fetched = await fetchSermons();
      sermonsData = fetched;
      cache.sermons = { data: sermonsData, ts: now };
    }

    // If not live, fall back to latest upload from the playlist (no extra API call)
    let videoId = liveData?.videoId || sermonsData.latestUpload?.videoId || null;
    let videoTitle = liveData?.videoTitle || sermonsData.latestUpload?.title || null;

    const body = JSON.stringify({
      liveVideo: {
        videoId,
        videoTitle,
        isLive: Boolean(liveData),
        // For debugging/UX you can return remaining TTLs (optional)
        liveStatusAgeMs: now - cache.live.ts,
        sermonsAgeMs: now - cache.sermons.ts,
      },
      sermons: sermonsData.sermonsToDisplay || [],
    });

    // Caching headers:
    // - Keep responses very short-lived so the browser will recheck often.
    // - You can increase s-maxage if you want CDN caching; keep it tiny for live responsiveness.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Browser/CDN cache: tiny max-age so clients refetch frequently
        'Cache-Control': 'public, max-age=5, s-maxage=5',
      },
      body,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data.' }),
    };
  }
};