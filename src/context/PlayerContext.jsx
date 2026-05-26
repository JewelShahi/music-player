import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);

const GENRES = ["All", "Electronic", "Phonk", "Pop", "Rock", "Hip-Hop/Rap", "R&B", "Jazz", "Classical", "Ambient", "Indie", "Metal", "Lo-Fi"];

function formatTime(s) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// ─── Single source of truth for persistence ───────────────────────────────────
// Keys: mp_volume, mp_liked, mp_theme, mp_queue
// Removed ALL position/track-restore keys — they caused cross-track bleed.
// The OS widget gets its position purely from live audio element events.
// ─────────────────────────────────────────────────────────────────────────────

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const seekDragging = useRef(false);          // toggled by SeekBar's pointer events
  const activeTrackIdRef = useRef(null);       // guards stale async callbacks
  const positionSaveInterval = useRef(null);

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolumeRaw] = useState(() => {
    try { const v = localStorage.getItem("mp_volume"); return v !== null ? parseFloat(v) : 0.2; }
    catch { return 0.2; }
  });

  const [repeatMode, setRepeatMode] = useState("off");
  const [shuffleOn, setShuffleOn] = useState(false);

  const [userQueue, setUserQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mp_queue") || "[]"); } catch { return []; }
  });

  const [likedMap, setLikedMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mp_liked") || "{}"); } catch { return {}; }
  });

  const [theme, setThemeRaw] = useState(() => {
    try { return localStorage.getItem("mp_theme") || "midnight"; } catch { return "midnight"; }
  });

  const setTheme = useCallback((t) => {
    setThemeRaw(t);
    localStorage.setItem("mp_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [apiSource, setApiSource] = useState("none");
  const [currentView, setCurrentView] = useState("home");
  const [showNP, setShowNP] = useState(false);
  const [status, setStatus] = useState("");
  const skipErrorCount = useRef(0);

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  // ─── Persist simple preferences ────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("mp_queue", JSON.stringify(userQueue)); }, [userQueue]);
  useEffect(() => { localStorage.setItem("mp_volume", volume.toString()); }, [volume]);

  // ─── Sync volume to audio element whenever it changes ──────────────────────
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  // ─── Core playback ─────────────────────────────────────────────────────────
  // Each call to playTrack tags the audio element with the track id so that
  // any stale async callback (canplay, loadedmetadata) can bail if a newer
  // track was already requested.
  const playTrack = useCallback((track, newQueue, index) => {
    if (!track?.audio) return;
    skipErrorCount.current = 0;
    const resolvedQueue = newQueue || queue;
    setQueue(resolvedQueue);
    setCurrentIndex(index);
    activeTrackIdRef.current = track.id;

    // Reset UI state immediately so seekbar shows 0
    setCurrentTime(0);
    setDuration(0);

    const a = audioRef.current;
    if (a) {
      a.pause();
      a.src = track.audio;
      a.currentTime = 0;
      a.volume = volume;
      a.load();
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [volume, queue]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a?.src) return;
    if (a.paused) a.play().then(() => setIsPlaying(true)).catch(() => {});
    else { a.pause(); setIsPlaying(false); }
  }, []);

  // playNext and playPrev also reset time immediately
  const playNext = useCallback(() => {
    if (!queue.length) return;
    let nextIdx;
    if (shuffleOn) {
      nextIdx = Math.floor(Math.random() * queue.length);
      if (queue.length > 1) while (nextIdx === currentIndex) nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = currentIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === "all") nextIdx = 0;
        else { setIsPlaying(false); return; }
      }
    }
    const track = queue[nextIdx];
    if (!track?.audio) return;
    skipErrorCount.current = 0;
    activeTrackIdRef.current = track.id;

    setCurrentIndex(nextIdx);
    setCurrentTime(0);
    setDuration(0);

    const a = audioRef.current;
    if (a) {
      a.pause();
      a.src = track.audio;
      a.currentTime = 0;
      a.volume = volume;
      a.load();
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [queue, currentIndex, shuffleOn, repeatMode, volume]);

  const playPrev = useCallback(() => {
    const a = audioRef.current;
    // If more than 3 s into the track, restart instead of going to prev
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = repeatMode === "all" ? queue.length - 1 : 0;
    const track = queue[prevIdx];
    if (!track?.audio) return;
    activeTrackIdRef.current = track.id;

    setCurrentIndex(prevIdx);
    setCurrentTime(0);
    setDuration(0);

    if (a) {
      a.pause();
      a.src = track.audio;
      a.currentTime = 0;
      a.volume = volume;
      a.load();
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [queue, currentIndex, repeatMode, volume]);

  // ─── Seek (called from SeekBar) ─────────────────────────────────────────────
  const seek = useCallback((time) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = time;
    setCurrentTime(time);
    // Immediately push the new position to the OS widget
    if (isFinite(a.duration) && a.duration > 0 && navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: a.duration,
        position: time,
        playbackRate: a.playbackRate ?? 1,
      });
    }
  }, []);

  // ─── Audio element events ────────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => {
      if (seekDragging.current) return;
      const ct = a.currentTime;
      setCurrentTime(ct);

      // Keep OS widget in sync — guard against NaN/Infinity
      if (isFinite(a.duration) && a.duration > 0 && navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: a.duration,
            position: ct,
            playbackRate: a.playbackRate ?? 1,
          });
        } catch (_) {}
      }
    };

    const onDurationChange = () => {
      const d = a.duration;
      if (isFinite(d) && d > 0) setDuration(d);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setStatus("Buffering...");
    const onCanPlay = () => { if (!a.paused) setStatus(""); };

    // When a track naturally ends, clear the OS widget position before advancing
    const onEnded = () => {
      if (navigator.mediaSession) {
        try { navigator.mediaSession.setPositionState(null); } catch (_) {}
      }
      if (repeatMode === "one") {
        a.currentTime = 0;
        setCurrentTime(0);
        a.play();
      } else {
        playNext();
      }
    };

    const onError = () => {
      skipErrorCount.current++;
      setIsPlaying(false);
      if (skipErrorCount.current >= 3) {
        setStatus("Multiple tracks unavailable.");
        skipErrorCount.current = 0;
        return;
      }
      setStatus("Track unavailable, skipping...");
      if (queue.length > 1) setTimeout(() => playNext(), 600);
    };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("durationchange", onDurationChange);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("durationchange", onDurationChange);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, [repeatMode, queue, playNext]);

  // ─── OS Media Session metadata ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name,
      artist: currentTrack.artist,
      artwork: currentTrack.image ? [{ src: currentTrack.image, sizes: "512x512", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("previoustrack", () => playPrev());
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
    // Allow the OS widget seek bar to work
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      seek(Math.min((audioRef.current?.currentTime ?? 0) + (details.seekOffset ?? 10), audioRef.current?.duration ?? 0));
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      seek(Math.max((audioRef.current?.currentTime ?? 0) - (details.seekOffset ?? 10), 0));
    });
  }, [currentTrack, togglePlay, playPrev, playNext, seek]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  // Re-sync OS widget when app comes back to foreground (phone background → foreground)
  useEffect(() => {
    const handleVisibility = () => {
      const a = audioRef.current;
      if (document.visibilityState === "visible" && a) {
        const ct = a.currentTime;
        setCurrentTime(ct);
        if (isFinite(a.duration) && a.duration > 0 && navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: a.duration,
              position: ct,
              playbackRate: a.playbackRate ?? 1,
            });
          } catch (_) {}
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ─── User Queue Management ───────────────────────────────────────────────────
  const isInUserQueue = useCallback((id) => userQueue.some((t) => t.id === id), [userQueue]);
  const toggleUserQueue = useCallback((track) => {
    setUserQueue((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) return prev.filter((t) => t.id !== track.id);
      return [...prev, { ...track, queueId: Date.now() + Math.random() }];
    });
  }, []);
  const removeFromUserQueue = useCallback((queueId) => setUserQueue((prev) => prev.filter((t) => t.queueId !== queueId)), []);
  const clearUserQueue = useCallback(() => setUserQueue([]), []);

  // ─── Liked Tracks ────────────────────────────────────────────────────────────
  const toggleLike = useCallback((track) => {
    setLikedMap((prev) => {
      const next = { ...prev };
      if (next[track.id]) delete next[track.id]; else next[track.id] = track;
      localStorage.setItem("mp_liked", JSON.stringify(next));
      return next;
    });
  }, []);
  const clearLiked = useCallback(() => { setLikedMap({}); localStorage.setItem("mp_liked", "{}"); }, []);
  const isLiked = useCallback((id) => !!likedMap[id], [likedMap]);
  const likedTracks = Object.values(likedMap);

  // ─── Volume ──────────────────────────────────────────────────────────────────
  const setVolume = useCallback((v) => {
    setVolumeRaw(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  // ─── Repeat / Shuffle ────────────────────────────────────────────────────────
  const toggleRepeat = useCallback(() => setRepeatMode((p) => (p === "off" ? "all" : p === "all" ? "one" : "off")), []);
  const toggleShuffle = useCallback(() => setShuffleOn((p) => !p), []);

  // ─── Spacebar shortcut ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay]);

  const value = {
    audioRef, seekDragging,
    queue, setQueue, currentIndex, setCurrentIndex, currentTrack,
    isPlaying, currentTime, duration, volume, status, setStatus,
    repeatMode, shuffleOn, apiSource, setApiSource,
    currentView, setCurrentView, showNP, setShowNP,
    likedMap, likedTracks, isLiked, GENRES, formatTime,
    playTrack, togglePlay, playNext, playPrev, seek, setVolume,
    toggleRepeat, toggleShuffle, toggleLike, clearLiked,
    userQueue, isInUserQueue, toggleUserQueue, removeFromUserQueue, clearUserQueue,
    theme, setTheme,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" />
    </Ctx.Provider>
  );
}