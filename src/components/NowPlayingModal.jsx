import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle,
  Volume2, Volume1, VolumeX, ChevronDown, Heart, ListMusic, ListPlus,
} from "lucide-react";

export default function NowPlayingModal() {
  const {
    showNP, setShowNP, currentTrack, isPlaying, currentTime, duration,
    volume, repeatMode, shuffleOn, isLiked, toggleLike, isInUserQueue, toggleUserQueue,
    togglePlay, playNext, playPrev, seek, setVolume,
    toggleRepeat, toggleShuffle, seekDragging, formatTime, setCurrentView,
  } = usePlayer();

  const [seekVal, setSeekVal] = useState(0);

  if (!showNP || !currentTrack) return null;

  const handleSeekStart = () => { seekDragging.current = true; };
  const handleSeekChange = (e) => {
    setSeekVal(e.target.value);
    const pct = e.target.value / 1000;
    e.target.style.setProperty("--val", (pct * 100) + "%");
  };
  const handleSeekEnd = (e) => {
    seekDragging.current = false;
    if (duration > 0) seek((e.target.value / 1000) * duration);
  };

  const handleVol = (e) => {
    setVolume(parseFloat(e.target.value));
    e.target.style.setProperty("--val", (parseFloat(e.target.value) * 100) + "%");
  };

  const VolIcon = volume === 0 ? VolumeX : volume < 0.4 ? Volume1 : Volume2;
  const inQueue = isInUserQueue(currentTrack.id);

  return (
    <div className="fixed inset-0 z-50 animate-slide-up">
      {/* Ambient background */}
      {currentTrack.image && (
        <div className="np-ambient" style={{ backgroundImage: `url(${currentTrack.image})` }} />
      )}
      <div className="absolute inset-0 bg-surface-1/85 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
        {/* Close */}
        <button onClick={() => setShowNP(false)} className="absolute top-4 left-4 btn btn-ghost btn-circle btn-sm text-slate-400">
          <ChevronDown size={22} />
        </button>
        <button onClick={() => { setShowNP(false); setCurrentView("queue"); }} className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm text-slate-400">
          <ListMusic size={18} />
        </button>

        {/* Album art */}
        <div className={`w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mb-8 ${isPlaying ? "scale-100" : "scale-95"} transition-transform duration-500`}>
          {currentTrack.image ? (
            <img src={currentTrack.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-3 flex items-center justify-center text-5xl text-slate-700">♪</div>
          )}
        </div>

        {/* Track info */}
        <div className="w-full text-center mb-6">
          <h3 className="text-xl font-bold truncate">{currentTrack.name}</h3>
          <p className="text-sm text-slate-400 truncate">{currentTrack.artist}</p>
          {currentTrack.source === "itunes" && (
            <span className="inline-block mt-1 text-[10px] text-pink-400/70 bg-pink-500/10 px-2 py-0.5 rounded-full">30-second preview</span>
          )}
        </div>

        {/* Seek */}
        <div className="w-full flex items-center gap-3 mb-4">
          <span className="text-[11px] text-slate-500 font-mono w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range" min="0" max="1000"
            value={duration > 0 ? (currentTime / duration) * 1000 : 0}
            className="seek-filled flex-1"
            style={{ "--val": duration > 0 ? (currentTime / duration) * 100 + "%" : "0%" }}
            onMouseDown={handleSeekStart} onTouchStart={handleSeekStart}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd}
          />
          <span className="text-[11px] text-slate-500 font-mono w-10">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5 mb-6">
          <button onClick={toggleShuffle} className={`btn btn-ghost btn-circle btn-sm ${shuffleOn ? "text-accent" : "text-slate-500"}`}>
            <Shuffle size={18} />
          </button>
          <button onClick={playPrev} className="btn btn-ghost btn-circle text-slate-200 hover:text-white">
            <SkipBack size={22} fill="currentColor" />
          </button>
          <button onClick={togglePlay} className="btn btn-circle bg-white text-surface-1 hover:bg-slate-200 border-none w-14 h-14 shadow-xl shadow-white/10">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={playNext} className="btn btn-ghost btn-circle text-slate-200 hover:text-white">
            <SkipForward size={22} fill="currentColor" />
          </button>
          <button onClick={toggleRepeat} className={`btn btn-ghost btn-circle btn-sm ${repeatMode !== "off" ? "text-accent" : "text-slate-500"}`}>
            {repeatMode === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Volume + Like + Queue */}
        <div className="w-full flex items-center gap-4 max-w-xs">
          <button onClick={() => toggleUserQueue(currentTrack)} title={inQueue ? "Remove from Queue" : "Add to Queue"}>
            <ListPlus size={20} className={inQueue ? "text-accent" : "text-slate-500"} />
          </button>
          <button onClick={() => toggleLike(currentTrack)}>
            <Heart size={20} className={isLiked(currentTrack.id) ? "fill-pink-500 text-pink-500" : "text-slate-500"} />
          </button>
          <button onClick={() => setVolume(volume === 0 ? 0.2 : 0)} className="text-slate-500">
            <VolIcon size={18} />
          </button>
          <input
            type="range" min="0" max="1" step="0.01" value={volume}
            className="vol-range vol-filled flex-1"
            style={{ "--val": volume * 100 + "%" }}
            onChange={handleVol}
          />
        </div>
      </div>
    </div>
  );
}