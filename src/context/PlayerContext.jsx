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
        a.src = track.audio; a.volume = volume;
        a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [queue, currentIndex, shuffleOn, repeatMode, volume]);

  const playPrev = useCallback(() => {
    const a = audioRef.current;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = repeatMode === "all" ? queue.length - 1 : 0;
    const track = queue[prevIdx];
    if (track?.audio) {
      setCurrentIndex(prevIdx);
      const aa = audioRef.current;
      if (aa) {
        aa.src = track.audio; aa.volume = volume;
        aa.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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

  /* ── Audio events ──────────────── */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => { if (!seekDragging.current) setCurrentTime(a.currentTime); };
    const onDur = () => setDuration(a.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWait = () => setStatus("Buffering...");
    const onCanPlay = () => { if (!a.paused) setStatus(""); };
    const onEnded = () => {
      if (repeatMode === "one") { a.currentTime = 0; a.play(); }
      else playNext();
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
  }, [repeatMode, queue, playNext]);

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