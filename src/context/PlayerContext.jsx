import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);

const GENRES = ["All", "Electronic", "Phonk", "Pop", "Rock", "Hip-Hop/Rap", "R&B", "Jazz", "Classical", "Ambient", "Indie", "Metal", "Lo-Fi"];

function formatTime(s) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const seekDragging = useRef(false);
  const activeTrackIdRef = useRef(null);
  const skipErrorCount = useRef(0);

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

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  // ─── Persist preferences ─────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("mp_queue", JSON.stringify(userQueue)); }, [userQueue]);
  useEffect(() => { localStorage.setItem("mp_volume", volume.toString()); }, [volume]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  // ─── FIX 1: Centralised Media Session position sync ─────────────────────────
  // Always call this instead of writing setPositionState inline.
  // Passing null (or an invalid duration) resets the OS widget to a blank state.
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

  // ─── FIX 2: Shared internal load-and-play helper ─────────────────────────────
  // Every track change goes through here so the reset logic is never duplicated.
  const _loadAndPlay = useCallback((track, idx, resolvedQueue) => {
    if (!track?.audio) return;
    skipErrorCount.current = 0;
    activeTrackIdRef.current = track.id;

    setCurrentIndex(idx);
    setCurrentTime(0);
    setDuration(0);

    // Immediately wipe the OS widget so it won't show the previous track's position
    if ("mediaSession" in navigator) {
      try { navigator.mediaSession.setPositionState(null); } catch (_) { }
    }

    const a = audioRef.current;
    if (!a) return;

    a.pause();
    a.src = track.audio;
    a.currentTime = 0;
    a.volume = volume;

    // Once metadata is loaded, push 0:00 to the OS widget with the real duration
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
        // Belt-and-suspenders: also sync right after play() resolves
        syncMediaPosition(0, a.duration);
      })
      .catch(() => setIsPlaying(false));
  }, [volume, syncMediaPosition]);

  // ─── Public playback API ─────────────────────────────────────────────────────
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
    // If more than 3 s into the track, restart instead of going back
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

  // ─── Seek ─────────────────────────────────────────────────────────────────────
  const seek = useCallback((time) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = time;
    setCurrentTime(time);
    syncMediaPosition(time, a.duration);
  }, [syncMediaPosition]);

  // ─── FIX 3: Audio element events — all sync through syncMediaPosition ─────────
  const lastSyncRef = useRef(0);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => {
      if (seekDragging.current) return;
      const ct = a.currentTime;
      setCurrentTime(ct);
      // Throttle to once per second (was 3 s) to keep the OS bar accurate
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

    // FIX: also sync after any seek operation completes
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

  // ─── FIX 4: OS Media Session metadata + explicit play/pause handlers ──────────
  // Using togglePlay for both "play" and "pause" actions caused weird OS behaviour.
  // Now each action is explicit.
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

    navigator.mediaSession.setActionHandler("previoustrack", () => playPrev());
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      seek(Math.min((audioRef.current?.currentTime ?? 0) + (details.seekOffset ?? 10), audioRef.current?.duration ?? 0));
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      seek(Math.max((audioRef.current?.currentTime ?? 0) - (details.seekOffset ?? 10), 0));
    });
  }, [currentTrack, playPrev, playNext, seek, syncMediaPosition]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  // ─── Re-sync OS widget on foreground restore ─────────────────────────────────
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

  // ─── User Queue ───────────────────────────────────────────────────────────────
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

  // ─── Liked Tracks ─────────────────────────────────────────────────────────────
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

  // ─── Volume ───────────────────────────────────────────────────────────────────
  const setVolume = useCallback((v) => {
    setVolumeRaw(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  // ─── Repeat / Shuffle ─────────────────────────────────────────────────────────
  const toggleRepeat = useCallback(() => setRepeatMode((p) => (p === "off" ? "all" : p === "all" ? "one" : "off")), []);
  const toggleShuffle = useCallback(() => setShuffleOn((p) => !p), []);

  // ─── Spacebar shortcut ────────────────────────────────────────────────────────
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