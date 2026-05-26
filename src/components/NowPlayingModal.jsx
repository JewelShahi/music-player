import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import AlbumArt from "./AlbumArt";
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

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);

  const [isVolDragging, setIsVolDragging] = useState(false);
  const [volVal, setVolVal] = useState(volume);

  if (!showNP || !currentTrack) return null;

  const handleSeekStart = () => { seekDragging.current = true; setIsSeeking(true); };
  const handleSeekChange = (e) => {
    const val = e.target.value;
    setSeekVal(val);
    const pct = val / 1000;
    e.target.style.setProperty("--val", (pct * 100) + "%");
  };
  const handleSeekEnd = (e) => {
    seekDragging.current = false;
    setIsSeeking(false);
    if (duration > 0) seek((e.target.value / 1000) * duration);
  };

  const handleVolStart = () => setIsVolDragging(true);
  const handleVolChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolVal(val);
    setVolume(val);
    e.target.style.setProperty("--val", (val * 100) + "%");
  };
  const handleVolEnd = () => setIsVolDragging(false);

  const VolIcon = volume === 0 ? VolumeX : volume < 0.4 ? Volume1 : Volume2;
  const inQueue = isInUserQueue(currentTrack.id);

  const currentSliderVal = isSeeking ? seekVal : (duration > 0 ? (currentTime / duration) * 1000 : 0);
  const currentPct = isSeeking ? (seekVal / 1000) * 100 : (duration > 0 ? (currentTime / duration) * 100 : 0);

  // Check if the title is long enough to need scrolling
  const isLongTitle = currentTrack.name.length > 35;

  return (
    <div className="fixed inset-0 z-50 animate-slide-up">
      {/* Ambient Background Layer */}
      {currentTrack.image && (
        <div className="np-ambient" style={{ backgroundImage: `url('${currentTrack.image}')` }} />
      )}

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
        <button onClick={() => setShowNP(false)} className="absolute top-4 left-4 btn btn-ghost btn-circle btn-sm text-white/70 hover:text-white">
          <ChevronDown size={22} />
        </button>
        <button onClick={() => { setShowNP(false); setCurrentView("queue"); }} className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm text-white/70 hover:text-white">
          <ListMusic size={18} />
        </button>

        <div className={`w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.6)] mb-8 ${isPlaying ? "scale-100" : "scale-95"} transition-transform duration-500`}>
          <AlbumArt src={currentTrack.image} className="w-full h-full object-cover" />
        </div>

        {/* ── Conditional Marquee Title ── */}
        <div className="w-full text-center mb-6">
          {isLongTitle ? (
            <div className="marquee-container mb-1">
              <h3 className="text-xl font-bold text-white marquee-content">
                <span className="mx-8">{currentTrack.name}</span>
                <span className="mx-8">{currentTrack.name}</span>
              </h3>
            </div>
          ) : (
            <h3 className="text-xl font-bold text-white truncate mb-1">{currentTrack.name}</h3>
          )}
          
          <div>
            <p className="text-sm text-white/60">
              {currentTrack.artist}
            </p>
          </div>

          {currentTrack.source === "itunes" && (
            <span className="inline-block mt-1 text-[10px] text-error/70 bg-error/10 px-2 py-0.5 rounded-full">30-second preview</span>
          )}
        </div>

        <div className="w-full flex items-center gap-3 mb-4">
          <span className="text-[11px] text-white/50 font-mono w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range" min="0" max="1000"
            value={currentSliderVal}
            className="range seek-filled flex-1"
            style={{ "--val": `${currentPct}%` }}
            onMouseDown={handleSeekStart} onTouchStart={handleSeekStart}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd}
          />
          <span className="text-[11px] text-white/50 font-mono w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-5 mb-6">
          <button onClick={toggleShuffle} className={`btn btn-ghost btn-circle btn-sm ${shuffleOn ? "text-primary" : "text-white/40 hover:text-white/70"}`}><Shuffle size={18} /></button>
          <button onClick={playPrev} className="btn btn-ghost btn-circle text-white/80 hover:text-white"><SkipBack size={22} fill="currentColor" /></button>
          <button onClick={togglePlay} className="btn btn-circle bg-white text-black hover:bg-white/80 border-none w-14 h-14 shadow-xl shadow-black/20">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={playNext} className="btn btn-ghost btn-circle text-white/80 hover:text-white"><SkipForward size={22} fill="currentColor" /></button>
          <button onClick={toggleRepeat} className={`btn btn-ghost btn-circle btn-sm ${repeatMode !== "off" ? "text-primary" : "text-white/40 hover:text-white/70"}`}>
            {repeatMode === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        <div className="w-full flex items-center gap-4 max-w-xs">
          <button onClick={() => toggleUserQueue(currentTrack)} title={inQueue ? "Remove from Queue" : "Add to Queue"}>
            <ListPlus size={20} className={inQueue ? "text-primary" : "text-white/40"} />
          </button>
          <button onClick={() => toggleLike(currentTrack)}>
            <Heart size={20} className={isLiked(currentTrack.id) ? "fill-error text-error" : "text-white/40"} />
          </button>
          <button onClick={() => setVolume(volume === 0 ? 0.2 : 0)} className="text-white/40">
            <VolIcon size={18} />
          </button>
          <input
            type="range" min="0" max="1" step="0.01"
            value={isVolDragging ? volVal : volume}
            className="range vol-filled flex-1"
            style={{ "--val": `${(isVolDragging ? volVal : volume) * 100}%` }}
            onMouseDown={handleVolStart} onTouchStart={handleVolStart}
            onChange={handleVolChange}
            onMouseUp={handleVolEnd} onTouchEnd={handleVolEnd}
          />
        </div>
      </div>
    </div>
  );
}