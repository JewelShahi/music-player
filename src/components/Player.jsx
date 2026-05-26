import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle,
  Volume2, Volume1, VolumeX, Maximize2, Heart, ListPlus,
  Home, ListMusic, Palette,
} from "lucide-react";
import AlbumArt from "./AlbumArt";

// ── Moved outside — stable identity, no remount on tick ──

const SeekBar = ({ currentSliderVal, currentPct, onStart, onChange, onEnd, className }) => (
  <input
    id="seekSlider"
    type="range" min="0" max="1000"
    step={1}
    value={currentSliderVal}
    className={`range seek-filled w-full h-1 cursor-pointer rounded-none ${className || ""}`}
    style={{ "--val": `${currentPct}%` }}
    onMouseDown={onStart} onTouchStart={onStart}
    onChange={onChange}
    onMouseUp={onEnd} onTouchEnd={onEnd}
  />
);

const MiniTrackInfo = ({ track, isPlaying }) => (
  track ? (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <AlbumArt
        src={track.image}
        className={`w-10 h-10 rounded-lg object-cover shrink-0 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.3)] ${isPlaying ? "scale-105" : ""}`}
      />
      <div className="min-w-0 w-full">
        {/* Mobile Title: Marquee if >= 20 chars, else truncate */}
        {track.name.length >= 20 ? (
          <div className="marquee-container">
            <p className="text-xs font-semibold marquee-content">
              <span className="mx-2">{track.name}</span>
              <span className="mx-2">{track.name}</span>
            </p>
          </div>
        ) : (
          <p className="text-xs font-semibold truncate">{track.name}</p>
        )}

        {/* Mobile Artist: Marquee if >= 20 chars, else truncate */}
        {track.artist.length >= 20 ? (
          <div className="marquee-container">
            <p className="text-[10px] text-base-content/50 marquee-content marquee-content-artist">
              <span className="mx-2">{track.artist}</span>
              <span className="mx-2">{track.artist}</span>
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-base-content/50 truncate">{track.artist}</p>
        )}
      </div>
    </div>
  ) : (
    <div className="flex-1 text-xs text-base-content/60 text-center">Pick a song</div>
  )
);

export default function Player() {
  const {
    currentTrack, isPlaying, currentTime, duration, volume,
    repeatMode, shuffleOn, isLiked, toggleLike, isInUserQueue, toggleUserQueue,
    currentView, setCurrentView,
    togglePlay, playNext, playPrev, seek, setVolume,
    toggleRepeat, toggleShuffle, setShowNP, seekDragging, formatTime,
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);
  const [isVolDragging, setIsVolDragging] = useState(false);
  const [volVal, setVolVal] = useState(volume);

  const handleSeekStart = () => { seekDragging.current = true; setIsSeeking(true); };
  const handleSeekChange = (e) => {
    const val = e.target.value;
    setSeekVal(val);
    e.target.style.setProperty("--val", (val / 10) + "%");
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

  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "queue", icon: ListMusic, label: "Queue" },
    { id: "liked", icon: Heart, label: "Liked" },
    { id: "themes", icon: Palette, label: "Themes" },
  ];

  const currentSliderVal = isSeeking ? seekVal : (duration > 0 ? (currentTime / duration) * 1000 : 0);
  const currentPct = isSeeking ? (seekVal / 1000) * 100 : (duration > 0 ? (currentTime / duration) * 100 : 0);

  return (
    <>
      {/* ── Desktop Player ─────────────── */}
      <div className="hidden lg:block fixed bottom-0 left-60 right-0 z-40 border-t border-base-content/5 overflow-hidden">
        {currentTrack?.image && (
          <div className="np-ambient" style={{ backgroundImage: `url('${currentTrack.image}')` }} />
        )}

        {/* Primary Color Tint Layer */}
        <div className="absolute inset-0 bg-primary/30" />

        {/* Dark Overlay Layer */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="relative z-10">
          <SeekBar
            currentSliderVal={currentSliderVal}
            currentPct={currentPct}
            onStart={handleSeekStart}
            onChange={handleSeekChange}
            onEnd={handleSeekEnd}
          />
          <div className="h-[80px] flex items-center px-5 gap-5">
            <div className="flex items-center gap-3 w-1/4 min-w-0 cursor-pointer" onClick={() => setShowNP(true)}>
              {currentTrack ? (
                <>
                  <AlbumArt src={currentTrack.image} className="w-14 h-14 rounded-lg object-cover shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.3)]" />
                  <div className="min-w-0 w-full">
                    {/* Desktop Title: Marquee if >= 20 chars, else truncate */}
                    {currentTrack.name.length >= 20 ? (
                      <div className="marquee-container">
                        <p className="text-sm font-semibold marquee-content">
                          <span className="mx-4">{currentTrack.name}</span>
                          <span className="mx-4">{currentTrack.name}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold truncate">{currentTrack.name}</p>
                    )}
                    {/* Desktop Artist: Always static/truncated */}
                    <p className="text-xs text-base-content/50 truncate">{currentTrack.artist}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserQueue(currentTrack);
                      }}
                      title="Add to Queue"
                      className={`btn btn-ghost btn-circle btn-xs ${isInUserQueue(currentTrack.id)
                        ? "text-primary"
                        : "text-base-content/60 hover:text-primary"
                        }`}
                    >
                      <ListPlus size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(currentTrack);
                      }}
                      className={`btn btn-ghost btn-circle btn-xs ${isLiked(currentTrack.id)
                        ? "text-error"
                        : "text-base-content/60 hover:text-error"
                        }`}
                    >
                      <Heart
                        size={16}
                        className={isLiked(currentTrack.id) ? "fill-error" : ""}
                      />
                    </button>
                  </div>
                </>
              ) : <p className="text-sm text-base-content/60">No track selected</p>}
            </div>

            <div className="flex-1 flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-4">
                <button onClick={toggleShuffle} className={`btn btn-ghost btn-circle btn-xs ${shuffleOn ? "text-primary" : "text-base-content/50"}`}><Shuffle size={15} /></button>
                <button onClick={playPrev} className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-base-content"><SkipBack size={18} fill="currentColor" /></button>
                <button
                  onClick={togglePlay}
                  className="btn btn-circle btn-md bg-primary-content text-primary hover:bg-primary hover:text-white border-none shadow-lg shadow-black/20"
                >
                  {isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <button onClick={playNext} className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-base-content"><SkipForward size={18} fill="currentColor" /></button>
                <button onClick={toggleRepeat} className={`btn btn-ghost btn-circle btn-xs ${repeatMode !== "off" ? "text-primary" : "text-base-content/50"}`}>
                  {repeatMode === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
                </button>
              </div>
              <div className="flex items-center gap-3 w-full max-w-md text-[10px] text-base-content/50 font-mono">
                <span className="font-black w-8 text-right">{formatTime(currentTime)}</span>
                <span className="flex-1" />
                <span className="font-black w-8">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-1/4 justify-end">
              <button
                onClick={() => setVolume(volume === 0 ? 0.2 : 0)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content/70"
              >
                <VolIcon size={16} />
              </button>
              <input
                type="range" min="0" max="1" step="0.01"
                value={isVolDragging ? volVal : volume}
                className="range vol-filled w-24"
                style={{ "--val": `${(isVolDragging ? volVal : volume) * 100}%` }}
                onMouseDown={handleVolStart} onTouchStart={handleVolStart}
                onChange={handleVolChange}
                onMouseUp={handleVolEnd} onTouchEnd={handleVolEnd}
              />
              <button
                onClick={() => setShowNP(true)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content/70 ml-1"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Player + Tabs ──────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col">
        <div className="border-t border-base-content/5 overflow-hidden relative">
          {currentTrack?.image && (
            <div className="np-ambient" style={{ backgroundImage: `url('${currentTrack.image}')` }} />
          )}

          {/* Primary Color Tint Layer */}
          <div className="absolute inset-0 bg-primary/30" />

          {/* Dark Overlay Layer */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative z-10">
            <SeekBar
              currentSliderVal={currentSliderVal}
              currentPct={currentPct}
              onStart={handleSeekStart}
              onChange={handleSeekChange}
              onEnd={handleSeekEnd}
            />
            <div className="flex items-center h-16 px-3 gap-1.5">
              <MiniTrackInfo track={currentTrack} isPlaying={isPlaying} />
              {currentTrack && (
                <>
                  <button
                    onClick={() => toggleUserQueue(currentTrack)}
                    className={`btn btn-ghost btn-circle btn-xs shrink-0 px-1 ${isInUserQueue(currentTrack.id)
                      ? "text-primary"
                      : "text-base-content/50 hover:text-primary"
                      }`}
                  >
                    <ListPlus size={15} />
                  </button>

                  <button
                    onClick={() => toggleLike(currentTrack)}
                    className={`btn btn-ghost btn-circle btn-xs shrink-0 px-1 ${isLiked(currentTrack.id)
                        ? "text-error"
                        : "text-base-content/50 hover:text-error"
                      }`}
                  >
                    <Heart
                      size={15}
                      className={isLiked(currentTrack.id) ? "fill-error" : ""}
                    />
                  </button>
                </>
              )}
              <button
                onClick={playPrev}
                className="btn btn-ghost btn-circle btn-xs text-base-content/80 hover:text-base-content shrink-0 px-1"
              >
                <SkipBack size={18} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="btn btn-circle btn-sm bg-primary-content text-primary border-none shrink-0 shadow-md hover:bg-primary hover:text-white"
              >
                {isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                )}
              </button>
              <button
                onClick={playNext}
                className="btn btn-ghost btn-circle btn-xs text-base-content/80 hover:text-base-content shrink-0 px-1"
              >
                <SkipForward size={18} fill="currentColor" />
              </button>

              <button
                onClick={() => setShowNP(true)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content/70 shrink-0 px-1"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-base-100 border-t border-base-content/5">
          <div className="flex justify-around py-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setCurrentView(t.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${currentView === t.id ? "text-primary" : "text-base-content/50 hover:text-base-content/70"
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