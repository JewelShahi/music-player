import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);

const GENRES = ["All", "Electronic", "Phonk", "Pop", "Rock", "Hip-Hop/Rap", "R&B", "Jazz", "Classical", "Ambient", "Indie", "Metal", "Lo-Fi"];

function formatTime(s) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function toTrackSnapshot(track) {
  if (!track) return null;
  return {
    id: track.id ?? null,
    name: track.name ?? "",
    artist: track.artist ?? "",
    image: track.image || null,
    audio: track.audio || null,
    genre: track.genre || null,
    duration: track.duration || null,
  };
}

// ─── Read last track from localStorage (used by multiple initializers) ──────
function getSavedLastTrack() {
  try { return JSON.parse(localStorage.getItem("mp_last_track") || "null"); } catch { return null; }
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const seekDragging = useRef(false);
  const activeTrackIdRef = useRef(null);
  const skipErrorCount = useRef(0);

  const currentTrackRef = useRef(null);

  // ─── Initialize queue & index from last played track ────────────────────
  const [queue, setQueue] = useState(() => {
    const lt = getSavedLastTrack();
    return lt ? [lt] : [];
  });

  const [currentIndex, setCurrentIndex] = useState(() => {
    const lt = getSavedLastTrack();
    return lt ? 0 : -1;
  });

  const [isPlaying, setIsPlaying] = useState(false);            // always starts paused
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

  const [lastTrack, setLastTrack] = useState(() => getSavedLastTrack());

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

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  useEffect(() => {
    if (currentTrack) currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // ─── Persist preferences ──────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("mp_queue", JSON.stringify(userQueue)); }, [userQueue]);
  useEffect(() => { localStorage.setItem("mp_volume", volume.toString()); }, [volume]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  // ─── Request persistent storage ───────────────────────────────────────────
  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  }, []);

  // ─── FLUSH last track on pagehide / beforeunload / visibility hidden ──────
  useEffect(() => {
    const flush = () => {
      const t = currentTrackRef.current;
      if (t) {
        try {
          localStorage.setItem("mp_last_track", JSON.stringify(toTrackSnapshot(t)));
        } catch (_) {}
      }
    };

    const onPageHide     = () => flush();
    const onBeforeUnload = () => flush();
    const onVisibility   = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // ─── Restore last track on mount — NO autoplay ───────────────────────────
  //     Loads the audio src so metadata/duration appears, but stays paused.
  useEffect(() => {
    const a = audioRef.current;
    const lt = lastTrack;

    if (!a || !lt?.audio) return;

    // If something is already playing (user clicked very fast), don't override
    if (activeTrackIdRef.current) return;

    a.src = lt.audio;
    a.volume = volume;
    a.load();                          // fetch metadata so duration shows
    // deliberately NOT calling a.play()
  }, []); // mount-only — intentionally captures initial values

  // ─── Centralised Media Session position sync ──────────────────────────────
  const syncMediaPosition = useCallback((position = 0, forcedDuration) => {
    if (!("mediaSession" in navigator)) return;
    const a = audioRef.current;
    const d = forcedDuration ?? a?.duration ?? 0;
    try {
      if (!isFinite(d) || d <= 0) {
        navigator.mediaSession.setPositionState(null);
        return;
      }
      navigator.mediaSession.setPositionState({
        duration: d,
        position: Math.max(0, Math.min(position, d)),
        playbackRate: a?.playbackRate ?? 1,
      });
    } catch (_) { }
  }, []);

  // ─── Can next / can prev ──────────────────────────────────────────────────
  const canNext = queue.length > 0 && (
    shuffleOn ||
    repeatMode === "all" ||
    repeatMode === "one" ||
    currentIndex < queue.length - 1
  );

  const canPrev = queue.length > 0 && (
    repeatMode === "all" ||
    repeatMode === "one" ||
    currentIndex > 0 ||
    currentTime > 3
  );

  // ─── Shared internal load-and-play ────────────────────────────────────────
  const _loadAndPlay = useCallback((track, idx, resolvedQueue) => {
    if (!track?.audio) return;
    skipErrorCount.current = 0;
    activeTrackIdRef.current = track.id;
    currentTrackRef.current = track;

    setCurrentIndex(idx);
    setCurrentTime(0);
    setDuration(0);

    try {
      const snap = toTrackSnapshot(track);
      localStorage.setItem("mp_last_track", JSON.stringify(snap));
      setLastTrack(snap);
    } catch (_) { }

    if ("mediaSession" in navigator) {
      try { navigator.mediaSession.setPositionState(null); } catch (_) { }
    }

    const a = audioRef.current;
    if (!a) return;

    a.pause();
    a.src = track.audio;
    a.currentTime = 0;
    a.volume = volume;

    const onMeta = () => {
      if (activeTrackIdRef.current !== track.id) return;
      const d = a.duration;
      if (isFinite(d) && d > 0) {
        setDuration(d);
        syncMediaPosition(0, d);
      }
    };
    a.addEventListener("loadedmetadata", onMeta, { once: true });

    a.load();
    a.play()
      .then(() => {
        setIsPlaying(true);
        syncMediaPosition(0, a.duration);
      })
      .catch(() => setIsPlaying(false));
  }, [volume, syncMediaPosition]);

  // ─── Public playback API ──────────────────────────────────────────────────
  const playTrack = useCallback((track, newQueue, index) => {
    const resolvedQueue = newQueue || queue;
    setQueue(resolvedQueue);
    _loadAndPlay(track, index, resolvedQueue);
  }, [queue, _loadAndPlay]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a?.src) return;
    if (a.paused) a.play().then(() => setIsPlaying(true)).catch(() => { });
    else { a.pause(); setIsPlaying(false); }
  }, []);

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
    if (track) _loadAndPlay(track, nextIdx, queue);
  }, [queue, currentIndex, shuffleOn, repeatMode, _loadAndPlay]);

  const playPrev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      setCurrentTime(0);
      syncMediaPosition(0, a.duration);
      return;
    }
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = repeatMode === "all" ? queue.length - 1 : 0;
    const track = queue[prevIdx];
    if (track) _loadAndPlay(track, prevIdx, queue);
  }, [queue, currentIndex, repeatMode, _loadAndPlay, syncMediaPosition]);

  // ─── Seek ─────────────────────────────────────────────────────────────────
  const seek = useCallback((time) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = time;
    setCurrentTime(time);
    syncMediaPosition(time, a.duration);
  }, [syncMediaPosition]);

  // ─── Audio element events ─────────────────────────────────────────────────
  const lastSyncRef = useRef(0);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => {
      if (seekDragging.current) return;
      const ct = a.currentTime;
      setCurrentTime(ct);
      const now = Date.now();
      if (now - lastSyncRef.current > 1000) {
        syncMediaPosition(ct, a.duration);
        lastSyncRef.current = now;
      }
    };

    const onLoadedMetadata = () => {
      const d = a.duration;
      if (isFinite(d) && d > 0) {
        setDuration(d);
        syncMediaPosition(a.currentTime || 0, d);
      }
    };

    const onDurationChange = () => {
      const d = a.duration;
      if (isFinite(d) && d > 0) {
        setDuration(d);
        syncMediaPosition(a.currentTime || 0, d);
      }
    };

    const onSeeked = () => {
      syncMediaPosition(a.currentTime || 0, a.duration);
    };

    const onPlay = () => {
      setIsPlaying(true);
      syncMediaPosition(a.currentTime || 0, a.duration);
    };

    const onPause = () => {
      setIsPlaying(false);
      syncMediaPosition(a.currentTime || 0, a.duration);
    };

    const onWaiting = () => setStatus("Buffering...");
    const onCanPlay = () => { if (!a.paused) setStatus(""); };

    const onEnded = () => {
      if ("mediaSession" in navigator) {
        try { navigator.mediaSession.setPositionState(null); } catch (_) { }
      }
      if (repeatMode === "one") {
        a.currentTime = 0;
        setCurrentTime(0);
        syncMediaPosition(0, a.duration);
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
    a.addEventListener("loadedmetadata", onLoadedMetadata);
    a.addEventListener("durationchange", onDurationChange);
    a.addEventListener("seeked", onSeeked);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoadedMetadata);
      a.removeEventListener("durationchange", onDurationChange);
      a.removeEventListener("seeked", onSeeked);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, [repeatMode, queue, playNext, syncMediaPosition]);

  // ─── OS Media Session metadata + explicit play/pause handlers ─────────────
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name,
      artist: currentTrack.artist,
      artwork: currentTrack.image
        ? [{ src: currentTrack.image, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });

    navigator.mediaSession.setActionHandler("play", async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
        syncMediaPosition(audioRef.current?.currentTime || 0, audioRef.current?.duration);
      } catch (_) { }
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      syncMediaPosition(audioRef.current?.currentTime || 0, audioRef.current?.duration);
    });

    navigator.mediaSession.setActionHandler("previoustrack", canPrev ? () => playPrev() : null);
    navigator.mediaSession.setActionHandler("nexttrack", canNext ? () => playNext() : null);

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      seek(Math.min((audioRef.current?.currentTime ?? 0) + (details.seekOffset ?? 10), audioRef.current?.duration ?? 0));
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      seek(Math.max((audioRef.current?.currentTime ?? 0) - (details.seekOffset ?? 10), 0));
    });
  }, [currentTrack, canNext, canPrev, playPrev, playNext, seek, syncMediaPosition]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  // ─── Re-sync OS widget on foreground restore ──────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      const a = audioRef.current;
      if (document.visibilityState === "visible" && a) {
        const ct = a.currentTime;
        setCurrentTime(ct);
        syncMediaPosition(ct, a.duration);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [syncMediaPosition]);

  // ─── User Queue ───────────────────────────────────────────────────────────
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

  // ─── Liked Tracks ────────────────────────────────────────────────────────
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

  // ─── Volume ──────────────────────────────────────────────────────────────
  const setVolume = useCallback((v) => {
    setVolumeRaw(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  // ─── Repeat / Shuffle ────────────────────────────────────────────────────
  const toggleRepeat = useCallback(() => setRepeatMode((p) => (p === "off" ? "all" : p === "all" ? "one" : "off")), []);
  const toggleShuffle = useCallback(() => setShuffleOn((p) => !p), []);

  // ─── Spacebar shortcut ──────────────────────────────────────────────────
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
    lastTrack,
    canNext,
    canPrev,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" />
    </Ctx.Provider>
  );
}