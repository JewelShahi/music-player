import React, { useEffect, useState, useCallback } from "react";
import { usePlayer } from "../context/PlayerContext";
import { fetchTrending } from "../services/api";
import TrackRow from "./TrackRow";
import Pagination from "./Pagination";
import { TrendingUp, Shuffle, Play } from "lucide-react";

export function HomeView() {
  const { GENRES, playTrack, queue, apiSource } = usePlayer();
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { tracks: t } = await fetchTrending(genre, page, PER_PAGE);
      setTracks(t);
    } catch (e) { setError("Failed to load tracks"); }
    setLoading(false);
  }, [genre, page]);

  useEffect(() => { load(); }, [load]);

  const handleGenre = (g) => { setGenre(g); setPage(0); };

  const playAll = (shuffle = false) => {
    let list = [...tracks];
    if (shuffle) list.sort(() => Math.random() - 0.5);
    if (list.length) playTrack(list[0], list, 0);
  };

  return (
    // Replaced bg-surface-1 with bg-base-100
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp size={22} className="text-primary" /> {/* Replaced text-accent */}
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Trending</h2>
        </div>
        <p className="text-sm text-base-content/50 ml-[34px]"> {/* Replaced text-slate-500 */}
          {apiSource === "audius" ? "Full tracks from independent artists" : "30-second previews from iTunes"}
        </p>
      </div>

      {/* Genre chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-4">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => handleGenre(g === "All" ? "" : g)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              (g === "All" && !genre) || g === genre
                ? "bg-primary/20 text-primary-content border border-primary/30" // Replaced accent
                : "bg-base-content/5 text-base-content/50 border border-base-content/5 hover:bg-base-content/10 hover:text-base-content/70" // Replaced slate/white
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => playAll(false)} className="btn btn-sm bg-primary hover:bg-primary-focus border-none text-primary-content gap-1.5">
          <Play size={14} fill="currentColor" /> Play All
        </button>
        <button onClick={() => playAll(true)} className="btn btn-sm btn-ghost text-base-content/50 gap-1.5">
          <Shuffle size={14} /> Shuffle
        </button>
      </div>

      {/* Tracks */}
      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-base-content/50 mb-3">{error}</p>
          <button onClick={load} className="btn btn-sm btn-ghost text-primary">Retry</button>
        </div>
      ) : (
        <>
          <div className="space-y-0.5">
            {tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} tracks={tracks} />
            ))}
          </div>
          <Pagination page={page} setPage={setPage} hasMore={tracks.length === PER_PAGE} total={null} perPage={PER_PAGE} />
        </>
      )}
    </div>
  );
}