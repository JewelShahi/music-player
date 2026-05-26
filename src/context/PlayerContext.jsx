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

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load volume from localStorage (fallback to 0.2)
  const [volume, setVolumeRaw] = useState(() => {
    try {
      const v = localStorage.getItem("mp_volume");
      return v !== null ? parseFloat(v) : 0.2;
    } catch { return 0.2; }
  });

  const [repeatMode, setRepeatMode] = useState("off");
  const [shuffleOn, setShuffleOn] = useState(false);

  // Load userQueue from localStorage
  const [userQueue, setUserQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mp_queue") || "[]"); } catch { return []; }
  });

  // likedMap already loads from localStorage
  const [likedMap, setLikedMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mp_liked") || "{}"); } catch { return {}; }
  });

  // Theme State
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

  /* ── Restore from either last saved or current time ── */
  useEffect(() => {
    const lastTrackData = localStorage.getItem("mp_lastTrackData");
    const lastPos = parseFloat(localStorage.getItem("mp_lastPosition") || "0");
    // Also read the interval‑saved current time (more frequent)
    const currentPos = parseFloat(localStorage.getItem("mp_currentTime") || "0");
    const currentTrackId = localStorage.getItem("mp_currentTrackId");

    // Use the more recent position: if currentPos exists and is greater than lastPos, prefer it
    let restorePos = lastPos;
    let restoreTrackData = lastTrackData;

    // If we have a currentTrackId and currentPos, try to find its track data
    if (currentTrackId && currentPos > 0) {
      // We need the full track object for that ID. If it's not in mp_lastTrackData, we cannot restore fully.
      // For simplicity, if mp_lastTrackData matches the ID, use currentPos.
      try {
        const parsed = lastTrackData ? JSON.parse(lastTrackData) : null;
        if (parsed && parsed.id === currentTrackId) {
          restorePos = currentPos; // use the more frequent save
        }
      } catch (e) { }
    }

    if (restoreTrackData && restorePos > 0) {
      try {
        const track = JSON.parse(restoreTrackData);
        setQueue([track]);
        setCurrentIndex(0);
        const a = audioRef.current;
        if (a) {
          a.src = track.audio;
          a.volume = volume;
          a.addEventListener("canplay", function onCanPlay() {
            a.currentTime = restorePos;
            setCurrentTime(restorePos);
            a.removeEventListener("canplay", onCanPlay);
          }, { once: true });
        }
      } catch (e) { console.warn("Restore failed", e); }
    }
  }, []);

  /* ── Persist to localStorage ──── */
  useEffect(() => {
    localStorage.setItem("mp_queue", JSON.stringify(userQueue));
  }, [userQueue]);

  useEffect(() => {
    localStorage.setItem("mp_volume", volume.toString());
  }, [volume]);

  /* ── Core playback ─────────────── */
  const playTrack = useCallback((track, newQueue, index) => {
    if (!track?.audio) return;
    skipErrorCount.current = 0;
    setQueue(newQueue || queue);
    setCurrentIndex(index);
    const a = audioRef.current;
    if (a) {
      a.src = track.audio;
      a.volume = volume;
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [volume, queue]);

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
      if (nextIdx >= queue.length) { if (repeatMode === "all") nextIdx = 0; else { setIsPlaying(false); return; } }
    }
    const track = queue[nextIdx];
    if (track?.audio) {
      setCurrentIndex(nextIdx);
      skipErrorCount.current = 0;
      const a = audioRef.current;
      if (a) {
        a.src = track.audio;
        a.volume = volume;
        a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [queue, currentIndex, shuffleOn, repeatMode, volume]);

  const playPrev = useCallback(() => {
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = repeatMode === "all" ? queue.length - 1 : 0;
    const track = queue[prevIdx];
    if (track?.audio) {
      setCurrentIndex(prevIdx);
      const a = audioRef.current;
      if (a) {
        a.src = track.audio;
        a.volume = volume;
        a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [queue, currentIndex, repeatMode, volume]);

  /* ── User Queue Management ─────── */
  const isInUserQueue = useCallback((id) => userQueue.some(t => t.id === id), [userQueue]);

  const toggleUserQueue = useCallback((track) => {
    setUserQueue(prev => {
      const exists = prev.some(t => t.id === track.id);
      if (exists) return prev.filter(t => t.id !== track.id);
      return [...prev, { ...track, queueId: Date.now() + Math.random() }];
    });
  }, []);

  const removeFromUserQueue = useCallback((queueId) => {
    setUserQueue(prev => prev.filter(t => t.queueId !== queueId));
  }, []);

  const clearUserQueue = useCallback(() => setUserQueue([]), []);

  /* ── Audio events ── */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (!seekDragging.current) {
        const ct = a.currentTime;
        setCurrentTime(ct);
        // Update OS media widget position (lock screen / notification)
        if (duration && navigator.mediaSession) {
          navigator.mediaSession.setPositionState({
            duration: duration,
            position: ct,
            playbackRate: 1
          });
        }
      }
    };
    const onDur = () => setDuration(a.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWait = () => setStatus("Buffering...");
    const onCanPlay = () => { if (!a.paused) setStatus(""); };
    const onEnded = () => {
      if (repeatMode === "one") { a.currentTime = 0; a.play(); }
      else {
        playNext();
        // Clear OS widget position when track ends naturally
        if (navigator.mediaSession) navigator.mediaSession.setPositionState(null);
      }
    };
    const onError = () => {
      skipErrorCount.current++;
      setIsPlaying(false);
      if (skipErrorCount.current >= 3) { setStatus("Multiple tracks unavailable."); skipErrorCount.current = 0; return; }
      setStatus(`Track unavailable, skipping...`);
      if (queue.length > 1) setTimeout(() => playNext(), 600);
    };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("durationchange", onDur);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onWait);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("durationchange", onDur);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onWait);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, [repeatMode, queue, playNext, duration]); // added duration dependency

  // Sync initial volume from state to audio element
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, []);

  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name, artist: currentTrack.artist,
      artwork: currentTrack.image ? [{ src: currentTrack.image, sizes: "512x512", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("previoustrack", () => playPrev());
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
  }, [currentTrack, togglePlay, playPrev, playNext]);

  // Tell the phone widget when we are playing/paused so it updates immediately
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  // Saves current playback position every second for crash recovery
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        localStorage.setItem("mp_currentTime", audioRef.current.currentTime.toString());
        localStorage.setItem("mp_currentTrackId", currentTrack?.id || "");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTrack]);

  /* ── Save full state on pause & before unload (for process resurrection) ── */
  useEffect(() => {
    const saveFullState = () => {
      if (currentTrack && audioRef.current) {
        localStorage.setItem("mp_lastTrackId", currentTrack.id);
        localStorage.setItem("mp_lastTrackData", JSON.stringify(currentTrack));
        localStorage.setItem("mp_lastPosition", audioRef.current.currentTime.toString());
        localStorage.setItem("mp_wasPlaying", isPlaying ? "true" : "false");
      }
    };

    // Save on pause
    if (!isPlaying && currentTrack) saveFullState();

    // Save before page reload/close
    window.addEventListener("beforeunload", saveFullState);
    return () => window.removeEventListener("beforeunload", saveFullState);
  }, [currentTrack, isPlaying, audioRef.current?.currentTime]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentTrack) return;
    const savedId = localStorage.getItem("mp_currentTrackId");
    const savedTime = parseFloat(localStorage.getItem("mp_currentTime") || "0");
    if (savedId === currentTrack.id && savedTime > 0) {
      const onCanPlay = () => {
        a.currentTime = savedTime;
        a.removeEventListener("canplay", onCanPlay);
      };
      a.addEventListener("canplay", onCanPlay);
    }
  }, [currentTrack]);

  /* ── FIX 1 (continued): visibility change sync with OS widget update ── */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && audioRef.current) {
        const realTime = audioRef.current.currentTime;
        setCurrentTime(realTime);
        // Force OS widget to update with the real position
        if (duration && navigator.mediaSession) {
          navigator.mediaSession.setPositionState({
            duration: duration,
            position: realTime,
            playbackRate: 1
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [duration]);

  const seek = useCallback((time) => {
    if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeRaw(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const toggleRepeat = useCallback(() => setRepeatMode((p) => (p === "off" ? "all" : p === "all" ? "one" : "off")), []);
  const toggleShuffle = useCallback(() => setShuffleOn((p) => !p), []);

  const toggleLike = useCallback((track) => {
    setLikedMap((prev) => {
      const next = { ...prev };
      if (next[track.id]) delete next[track.id]; else next[track.id] = track;
      localStorage.setItem("mp_liked", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearLiked = useCallback(() => {
    setLikedMap({});
    localStorage.setItem("mp_liked", "{}");
  }, []);

  const isLiked = useCallback((id) => !!likedMap[id], [likedMap]);
  const likedTracks = Object.values(likedMap);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay]);

  const value = {
    audioRef, queue, setQueue, currentIndex, setCurrentIndex, currentTrack,
    isPlaying, currentTime, duration, volume, status, setStatus,
    repeatMode, shuffleOn, apiSource, setApiSource,
    currentView, setCurrentView, showNP, setShowNP,
    likedMap, likedTracks, isLiked, GENRES, formatTime,
    playTrack, togglePlay, playNext, playPrev, seek, setVolume,
    toggleRepeat, toggleShuffle, toggleLike, clearLiked,
    userQueue, isInUserQueue, toggleUserQueue, removeFromUserQueue, clearUserQueue,
    theme, setTheme, seekDragging,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" />
    </Ctx.Provider>
  );
}