const AUDIUS_APP = "MidnightPlayer";

let apiHost = null;
let apiSource = "none";

export function getApiSource() {
  return apiSource;
}

async function fetchTimeout(url, ms = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    return res;
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

/* ── Audius ─────────────────────────── */
async function discoverAudius() {
  try {
    const res = await fetchTimeout("https://api.audius.co", 6000);
    const { data: nodes } = await res.json();
    if (!nodes?.length) return false;
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    for (const node of shuffled.slice(0, 5)) {
      try {
        const r = await fetchTimeout(`${node}/v1/tracks/trending?limit=1&app_name=${AUDIUS_APP}`, 5000);
        if (r.ok) {
          const d = await r.json();
          if (d.data) { apiHost = node; apiSource = "audius"; return true; }
        }
      } catch { continue; }
    }
  } catch { }
  return false;
}

async function audiusFetch(path) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetchTimeout(`${apiHost}/v1${path}${sep}app_name=${AUDIUS_APP}`, 12000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function mapAudius(t) {
  return {
    id: "au_" + t.id,
    name: t.title || "Untitled",
    artist: t.user?.name || "Unknown",
    image: t.artwork?.["480x480"] || t.artwork?.["150x150"] || "",
    duration: Math.round(t.duration || 0),
    audio: `${apiHost}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP}`,
    genre: t.genre || "",
    source: "audius",
  };
}

/* ── iTunes fallback ────────────────── */
async function itunesSearch(query, limit = 20, offset = 0) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}&offset=${offset}`;
  const res = await fetchTimeout(url, 8000);
  const data = await res.json();
  return (data.results || []).filter((t) => t.previewUrl).map((t) => ({
    id: "it_" + t.trackId,
    name: t.trackName || "Untitled",
    artist: t.artistName || "Unknown",
    image: (t.artworkUrl100 || "").replace("100x100", "300x300"),
    duration: Math.round((t.trackTimeMillis || 0) / 1000),
    audio: t.previewUrl,
    genre: t.primaryGenreName || "",
    source: "itunes",
  }));
}

/* ── Init ───────────────────────────── */
export async function initAPI() {
  if (await discoverAudius()) return apiSource;
  try { await itunesSearch("music", 1); apiSource = "itunes"; return apiSource; } catch { }
  apiSource = "none";
  return apiSource;
}

/* ── Trending ───────────────────────── */
export async function fetchTrending(genre = "", page = 0, limit = 20) {
  const offset = page * limit;
  try {
    if (apiSource === "audius") {
      let path = `/tracks/trending?limit=${limit}&offset=${offset}`;
      if (genre) path += `&genre=${encodeURIComponent(genre)}`;
      const data = await audiusFetch(path);
      return { tracks: (data.data || []).map(mapAudius), total: null };
    }
    const term = genre ? `${genre} music` : "top hits";
    const tracks = await itunesSearch(term, limit, offset);
    return { tracks, total: null };
  } catch (err) {
    // Fallback
    if (apiSource === "audius") {
      try {
        const term = genre ? `${genre} music` : "top hits";
        const tracks = await itunesSearch(term, limit, offset);
        return { tracks, total: null };
      } catch { }
    }
    throw err;
  }
}

/* ── Search ─────────────────────────── */
export async function searchTracks(query, genre = "", page = 0, limit = 20) {
  const offset = page * limit;
  try {
    if (apiSource === "audius") {
      const data = await audiusFetch(`/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
      let tracks = (data.data || []).map(mapAudius);
      if (genre) tracks = tracks.filter((t) => t.genre.toLowerCase().includes(genre.toLowerCase()));
      return { tracks, total: null };
    }
    const q = genre ? `${query} ${genre}` : query;
    const tracks = await itunesSearch(q, limit, offset);
    return { tracks, total: null };
  } catch (err) { throw err; }
}