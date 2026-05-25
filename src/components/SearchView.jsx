import React, { useState, useCallback } from "react";
import { usePlayer } from "../context/PlayerContext";
import { searchTracks } from "../services/api";
import TrackRow from "./TrackRow";
import Pagination from "./Pagination";
import { Search, Play, Shuffle } from "lucide-react";

export function SearchView() {
  const { GENRES, playTrack } = usePlayer();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const PER_PAGE = 20;

  const doSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const { tracks: t } = await searchTracks(query.trim(), genre, page, PER_PAGE);
      setTracks(t);
    } catch { setTracks([]); }
    setLoading(false);
  }, [query, genre, page]);

  const handleGenre = (g) => { setGenre(g === "All" ? "" : g); setPage(0); if (searched) doSearch(); };

  const playAll = (shuffle = false) => {
    let list = [...tracks];
    if (shuffle) list.sort(() => Math.random() - 0.5);
    if (list.length) playTrack(list[0], list, 0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">
      <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">Search</h2>

      {/* Search input */}
      <form onSubmit={doSearch} className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none" />
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, tracks, albums..."
          className="input input-bordered w-full pl-11 bg-base-300 border-base-content/10 focus:border-primary/50 focus:outline-none placeholder:text-base-content/40"
        />
      </form>

      {/* Genre filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => handleGenre(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              (g === "All" && !genre) || g === genre
                ? "bg-primary/20 text-primary-content border border-primary/30"
                : "bg-base-content/5 text-base-content/50 border border-base-content/5 hover:bg-base-content/10 hover:text-base-content/70"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : searched ? (
        tracks.length > 0 ? (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={() => playAll(false)} className="btn btn-sm bg-primary hover:bg-primary-focus border-none text-primary-content gap-1.5">
                <Play size={14} fill="currentColor" /> Play All
              </button>
              <button onClick={() => playAll(true)} className="btn btn-sm btn-ghost text-base-content/50 gap-1.5">
                <Shuffle size={14} /> Shuffle
              </button>
            </div>
            <div className="space-y-0.5">
              {tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i} tracks={tracks} />)}
            </div>
            <Pagination page={page} setPage={setPage} hasMore={tracks.length === PER_PAGE} total={null} perPage={PER_PAGE} />
          </>
        ) : (
          <div className="text-center py-20 text-base-content/50">No results found. Try different keywords.</div>
        )
      ) : (
        <div className="text-center py-20 text-base-content/60">Type something to search for music</div>
      )}
    </div>
  );
}