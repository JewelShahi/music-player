import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle,
  Volume2, Volume1, VolumeX, Maximize2, Heart, ListPlus,
  Home, Search, ListMusic, Palette,
} from "lucide-react";

export default function Player() {
  const {
    currentTrack, isPlaying, currentTime, duration, volume,
    repeatMode, shuffleOn, isLiked, toggleLike, isInUserQueue, toggleUserQueue,
    currentView, setCurrentView,
    togglePlay, playNext, playPrev, seek, setVolume,
    toggleRepeat, toggleShuffle, setShowNP, seekDragging, formatTime,
  } = usePlayer();

  const [seekVal, setSeekVal] = useState(0);

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

  const handleVolChange = (e) => {
    setVolume(parseFloat(e.target.value));
    e.target.style.setProperty("--val", (parseFloat(e.target.value) * 100) + "%");
  };

  const VolIcon = volume === 0 ? VolumeX : volume < 0.4 ? Volume1 : Volume2;

  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "queue", icon: ListMusic, label: "Queue" },
    { id: "liked", icon: Heart, label: "Liked" },
    { id: "themes", icon: Palette, label: "Themes" },
  ];

  const SeekBar = ({ className }) => (
    <input
      id="seekSlider"
      type="range" min="0" max="1000" value={duration > 0 ? (currentTime / duration) * 1000 : 0}
      className={`seek-filled w-full h-1 cursor-pointer rounded-none ${className || ""}`}
      style={{ "--val": duration > 0 ? (currentTime / duration) * 100 + "%" : "0%" }}
      onMouseDown={handleSeekStart} onTouchStart={handleSeekStart}
      onChange={handleSeekChange}
      onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd}
    />
  );

  const MiniTrackInfo = () => (
    currentTrack ? (
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <img
          src={currentTrack.image || ""}
          alt=""
          className={`w-10 h-10 rounded-lg object-cover bg-surface-3 shrink-0 transition-transform ${isPlaying ? "scale-105" : ""}`}
          onError={(e) => { e.target.src = ""; }}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate">{currentTrack.name}</p>
          <p className="text-[10px] text-slate-500 truncate">{currentTrack.artist}</p>
        </div>
      </div>
    ) : (
      <div className="flex-1 text-xs text-slate-600 text-center">Pick a song</div>
    )
  );

  return (
    <>
      {/* ── Desktop Player ─────────────── */}
      <div className="hidden lg:block fixed bottom-0 left-60 right-0 z-40 bg-surface-2/95 backdrop-blur-lg border-t border-white/5">
        <SeekBar />
        <div className="h-[80px] flex items-center px-5 gap-5">
          {/* Track info */}
          <div className="flex items-center gap-3 w-1/4 min-w-0 cursor-pointer" onClick={() => setShowNP(true)}>
            {currentTrack ? (
              <>
                <img src={currentTrack.image || ""} alt="" className="w-14 h-14 rounded-lg object-cover bg-surface-3 shrink-0" onError={(e) => { e.target.src = ""; }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{currentTrack.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentTrack.artist}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button onClick={(e) => { e.stopPropagation(); toggleUserQueue(currentTrack); }} title="Add to Queue">
                    <ListPlus size={16} className={isInUserQueue(currentTrack.id) ? "text-accent" : "text-slate-600 hover:text-accent"} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}>
                    <Heart size={16} className={isLiked(currentTrack.id) ? "fill-pink-500 text-pink-500" : "text-slate-600 hover:text-slate-400"} />
                  </button>
                </div>
              </>
            ) : <p className="text-sm text-slate-600">No track selected</p>}
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-4">
              <button onClick={toggleShuffle} className={`btn btn-ghost btn-circle btn-xs ${shuffleOn ? "text-accent" : "text-slate-500"}`}><Shuffle size={15} /></button>
              <button onClick={playPrev} className="btn btn-ghost btn-circle btn-sm text-slate-300 hover:text-white"><SkipBack size={18} fill="currentColor" /></button>
              <button onClick={togglePlay} className="btn btn-circle btn-md bg-white text-surface-1 hover:bg-slate-200 border-none shadow-lg shadow-white/10">
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>
              <button onClick={playNext} className="btn btn-ghost btn-circle btn-sm text-slate-300 hover:text-white"><SkipForward size={18} fill="currentColor" /></button>
              <button onClick={toggleRepeat} className={`btn btn-ghost btn-circle btn-xs ${repeatMode !== "off" ? "text-accent" : "text-slate-500"}`}>
                {repeatMode === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            </div>
            <div className="flex items-center gap-3 w-full max-w-md text-[10px] text-slate-500 font-mono">
              <span className="w-8 text-right">{formatTime(currentTime)}</span>
              <span className="flex-1"></span>
              <span className="w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume + extras */}
          <div className="flex items-center gap-2 w-1/4 justify-end">
            <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)} className="btn btn-ghost btn-xs text-slate-500"><VolIcon size={16} /></button>
            <input type="range" min="0" max="1" step="0.01" value={volume} className="vol-filled w-24" style={{ "--val": volume * 100 + "%" }} onChange={handleVolChange} />
            <button onClick={() => setShowNP(true)} className="btn btn-ghost btn-xs text-slate-500 ml-1"><Maximize2 size={15} /></button>
          </div>
        </div>
      </div>

      {/* ── Mobile Player + Tabs ──────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col">
        {/* Mini Player */}
        <div className="bg-surface-2/95 backdrop-blur-lg border-t border-white/5">
          <SeekBar />
          <div className="flex items-center h-16 px-3 gap-1.5">
            <MiniTrackInfo />
            {currentTrack && (
              <>
                <button onClick={() => toggleUserQueue(currentTrack)} className="btn btn-ghost btn-xs shrink-0 px-1">
                  <ListPlus size={15} className={isInUserQueue(currentTrack.id) ? "text-accent" : "text-slate-500"} />
                </button>
                <button onClick={() => toggleLike(currentTrack)} className="btn btn-ghost btn-xs shrink-0 px-1">
                  <Heart size={15} className={isLiked(currentTrack.id) ? "fill-pink-500 text-pink-500" : "text-slate-500"} />
                </button>
              </>
            )}
            <button onClick={playPrev} className="btn btn-ghost btn-xs text-slate-300 shrink-0 px-1"><SkipBack size={18} fill="currentColor" /></button>
            <button onClick={togglePlay} className="btn btn-circle btn-sm bg-white text-surface-1 border-none shrink-0 shadow-md">
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="btn btn-ghost btn-xs text-slate-300 shrink-0 px-1"><SkipForward size={18} fill="currentColor" /></button>
            <button onClick={() => setShowNP(true)} className="btn btn-ghost btn-xs text-slate-500 shrink-0 px-1"><Maximize2 size={16} /></button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-surface-1 border-t border-white/5">
          <div className="flex justify-around py-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setCurrentView(t.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  currentView === t.id ? "text-accent" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <t.icon size={18} />
                <span className="text-[9px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}