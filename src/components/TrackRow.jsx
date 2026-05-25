import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { Play, Heart, ListPlus } from "lucide-react";

export default function TrackRow({ track, index, tracks }) {
  const { playTrack, currentTrack, isPlaying, isLiked, toggleLike, isInUserQueue, toggleUserQueue } = usePlayer();
  const active = currentTrack?.id === track.id;
  const inQueue = isInUserQueue(track.id);
  const liked = isLiked(track.id);

  const handleClick = () => {
    if (track.audio) playTrack(track, tracks, index);
  };

  return (
    <div
      onClick={handleClick}
      className={`track-row group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all stagger-item ${
        active ? "bg-accent/10 ring-1 ring-accent/20" : "hover:bg-white/5"
      }`}
      style={{ animationDelay: `${Math.min(index * 0.03, 0.4)}s` }}
    >
      {/* Number / play overlay */}
      <div className="relative w-6 text-center shrink-0">
        <span className={`track-num text-xs font-mono transition-opacity ${active ? "text-accent" : "text-slate-600"}`}>
          {active && isPlaying ? (
            <span className="flex items-end justify-center gap-0.5 h-4">
              <span className="w-[3px] rounded-full bg-accent animate-eq-1" />
              <span className="w-[3px] rounded-full bg-accent animate-eq-2" />
              <span className="w-[3px] rounded-full bg-accent animate-eq-3" />
            </span>
          ) : index + 1}
        </span>
        <Play size={14} className="play-overlay absolute inset-0 m-auto text-white" fill="currentColor" />
      </div>

      {/* Art */}
      <img
        src={track.image || ""}
        alt=""
        className={`w-10 h-10 rounded-lg object-cover bg-surface-3 shrink-0 ${active ? "ring-1 ring-accent/30" : ""}`}
        onError={(e) => { e.target.src = ""; e.target.className = "w-10 h-10 rounded-lg bg-surface-3 shrink-0 flex items-center justify-center"; }}
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${active ? "text-accent-light" : ""}`}>{track.name}</p>
        <p className="text-xs text-slate-500 truncate">{track.artist}</p>
      </div>

      {/* Source badge */}
      {track.source === "itunes" && (
        <span className="hidden sm:inline text-[9px] text-pink-400/70 bg-pink-500/10 px-1.5 py-0.5 rounded-full">30s</span>
      )}

      {/* Add to Queue Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleUserQueue(track); }}
        className={`shrink-0 transition-opacity ${inQueue ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        title={inQueue ? "Remove from Queue" : "Add to Queue"}
      >
        <ListPlus size={16} className={inQueue ? "text-accent" : "text-slate-600 hover:text-accent"} />
      </button>

      {/* Like Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
        className={`shrink-0 transition-opacity ${liked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <Heart size={15} className={liked ? "fill-pink-500 text-pink-500" : "text-slate-600 hover:text-slate-400"} />
      </button>

      {/* Duration */}
      <span className="text-xs text-slate-600 font-mono shrink-0 w-10 text-right">
        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}
      </span>
    </div>
  );
}