import React, { useEffect, useState, useCallback } from "react";
import { usePlayer } from "../context/PlayerContext";
import { fetchTrending, searchTracks } from "../services/api";
import TrackRow from "./TrackRow";
import Pagination from "./Pagination";
import { TrendingUp, Shuffle, Play, Search, Music2 } from "lucide-react";

export function HomeView() {
  const { GENRES, playTrack, apiSource } = usePlayer();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(""); // The delayed version
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const PER_PAGE = 20;

  // ── Debounce Logic: Wait 0.5 sec after user stops typing ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset page when the actual search term or genre changes
  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, genre]);

  const isSearching = debouncedQuery.trim().length > 0;
  const isDebouncing = query !== debouncedQuery; // True while user is typing and 1s hasn't passed

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;

      // ── Phonk Mapping Logic ──
      let apiGenre = genre;
      let apiQuery = debouncedQuery.trim();

      // If the genre is Phonk, we must search for it as a keyword, not a genre filter
      if (genre === "Phonk") {
        apiGenre = ""; // Clear the genre filter
        apiQuery = apiQuery ? `Phonk ${apiQuery}` : "Phonk"; // Add Phonk to the search query
      }

      if (genre === "R&B") {
        apiGenre = ""; // Clear the genre filter
        apiQuery = apiQuery ? `R&B ${apiQuery}` : "R&B"; // Add R&B to the search query
      }

      if (genre === "Indie") {
        apiGenre = ""; // Clear the genre filter
        apiQuery = apiQuery ? `Indie ${apiQuery}` : "Indie"; // Add Indie to the search query
      }

      const isSearching = apiQuery.length > 0; // Use the modified apiQuery

      if (isSearching) {
        result = await searchTracks(apiQuery, apiGenre, page, PER_PAGE);
      } else {
        result = await fetchTrending(apiGenre, page, PER_PAGE);
      }
      setTracks(result.tracks);
    } catch (e) {
      setError("Failed to load tracks");
    }
    setLoading(false);
  }, [debouncedQuery, genre, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenre = (g) => {
    setGenre(g === "All" ? "" : g);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value); // Update UI instantly, debounce effect handles the rest
  };

  const playAll = (shuffle = false) => {
    let list = [...tracks];
    if (shuffle) list.sort(() => Math.random() - 0.5);
    if (list.length) playTrack(list[0], list, 0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">

      {/* ── Mobile-only header (hidden on lg where sidebar shows) ── */}
      <div className="flex lg:hidden flex-col items-center justify-center gap-3 mb-8 px-5 py-4 rounded-2xl bg-base-200/60 border border-base-300/40 shadow-sm">

        {/* Top row: icon + app name */}
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Music2 size={22} className="text-primary-content" />
          </div>

          <h1 className="text-lg font-bold tracking-tight text-base-content">
            Audify
          </h1>

        </div>

        {/* Bottom row: type + author */}
        <div className="flex flex-wrap items-center gap-1">

          <p className="text-[11px] text-base-content/60">
            Music Player
          </p>

          <span className="text-base-content/30 text-[9px]">•</span>

          <p className="text-[11px] text-base-content/60 break-words">
            Jewel Shahi
          </p>

        </div>

      </div>

      {/* ── Hero ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          {isSearching ? (
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Search size={22} className="text-primary" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp size={22} className="text-primary" />
            </div>
          )}
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {isSearching ? "Search Results" : "Trending"}
          </h2>
        </div>
        <p className="text-sm text-base-content/50 ml-[34px]">
          {isSearching
            ? `Showing results for "${debouncedQuery.trim()}"`
            : apiSource === "audius"
              ? "Full tracks from independent artists"
              : "30-second previews from iTunes"}
        </p>
      </div>

      {/* ── Search Input ── */}
      <div className="relative mb-4 group">
        {/* Show spinner while debouncing, Search icon when idle */}
        {isDebouncing ? (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs text-primary" />
        ) : (
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-primary opacity-80 transition-all duration-300 group-focus-within:opacity-100 group-focus-within:scale-110 pointer-events-none"
          />
        )}
        <input
          id="search-input"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search artists, tracks, albums..."
          className="
            w-full h-12
            pl-11 pr-4
            rounded-2xl
            text-sm text-base-content
            placeholder:text-base-content/40
            bg-primary/20
            backdrop-blur-xl
            outline-none
            border-none
            [box-shadow:inset_0_0_0_1px_hsl(var(--bc)/0.1),inset_0_1px_0_0_hsl(var(--bc)/0.05)]
            hover:bg-base-content/8
            hover:[box-shadow:inset_0_0_0_1px_hsl(var(--bc)/0.2),inset_0_1px_0_0_hsl(var(--bc)/0.05)]
            focus:bg-primary/40
            focus:[box-shadow:inset_0_0_0_1.5px_hsl(var(--p)/0.8),0_0_0_3px_hsl(var(--p)/0.15),inset_0_1px_0_0_hsl(var(--bc)/0.05)]
            transition-[box-shadow,background-color] duration-200 ease-out
          "
        />
      </div>

      {/* ── Genre chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-4">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => handleGenre(g)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${(g === "All" && !genre) || g === genre
              ? "bg-primary/20 text-primary-content border border-primary/30"
              : "bg-base-content/5 text-base-content/50 border border-base-content/5 hover:bg-base-content/10 hover:text-base-content/70"
              }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ── Action buttons ── */}
      {tracks.length > 0 && !loading && (
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => playAll(false)}
            className="btn btn-sm bg-primary hover:bg-primary/30 border-none text-primary-content gap-1.5"
          >
            <Play size={14} fill="currentColor" /> Play All
          </button>
          <button
            onClick={() => playAll(true)}
            className="btn btn-sm btn-ghost text-base-content/50 gap-1.5"
          >
            <Shuffle size={14} /> Shuffle
          </button>
        </div>
      )}

      {/* ── Tracks & States ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-base-content/50 mb-3">{error}</p>
          <button onClick={load} className="btn btn-sm btn-ghost text-primary">
            Retry
          </button>
        </div>
      ) : tracks.length > 0 ? (
        <>
          <div className="space-y-0.5">
            {tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} tracks={tracks} />
            ))}
          </div>
          <Pagination
            page={page}
            setPage={setPage}
            hasMore={tracks.length === PER_PAGE}
            total={null}
            perPage={PER_PAGE}
          />
        </>
      ) : (
        <div className="text-center py-20 text-base-content/50">
          {isSearching
            ? "No results found. Try different keywords."
            : "No trending tracks found for this genre."}
        </div>
      )}
    </div>
  );
}