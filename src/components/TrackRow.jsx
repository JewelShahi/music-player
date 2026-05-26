import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";
import AlbumArt from "./AlbumArt";
import { Play, Heart, ListPlus } from "lucide-react";

// ── Custom Hook: Checks if the text is actually showing "..." ──
function useIsTruncated(ref, deps = []) {
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (ref.current) {
        const { scrollWidth, clientWidth } = ref.current;
        setIsTruncated(scrollWidth > clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [ref, ...deps]);

  return isTruncated;
}

function TrackRow({ track, index, tracks }) {
  const { playTrack, currentTrack, isPlaying, isLiked, toggleLike, isInUserQueue, toggleUserQueue } = usePlayer();
  const active = currentTrack?.id === track.id;
  const inQueue = isInUserQueue(track.id);
  const liked = isLiked(track.id);
  
  // Track hover state to enable marquee
  const [isHovered, setIsHovered] = useState(false);
  const shouldScroll = active || isHovered;
  
  // Mobile character length checks
  const titleLen = track.name.length;
  const artistLen = track.artist.length;

  // Desktop DOM measurement checks
  const desktopTitleRef = useRef(null);
  const desktopArtistRef = useRef(null);
  const isDesktopTitleTruncated = useIsTruncated(desktopTitleRef, [track.name, active]);
  const isDesktopArtistTruncated = useIsTruncated(desktopArtistRef, [track.artist, active]);

  const handleClick = () => {
    if (track.audio) playTrack(track, tracks, index);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`track-row group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
        active ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-primary/5"
      }`}
    >
      {/* ── Number / Equalizer / Play Button Logic ── */}
      <div className="relative w-6 h-4 text-center shrink-0 flex items-center justify-center">
        {active ? (
          // If the track is active (playing or paused), show equalizer or play icon.
          // Hover does nothing here.
          <span className={`flex items-center justify-center ${active ? "text-primary" : "text-base-content/60"}`}>
            {isPlaying ? (
              <span className="flex items-end justify-center gap-0.5 h-4">
                <span className="w-[3px] rounded-full bg-primary animate-eq-1" />
                <span className="w-[3px] rounded-full bg-primary animate-eq-2" />
                <span className="w-[3px] rounded-full bg-primary animate-eq-3" />
              </span>
            ) : (
              <Play size={14} fill="currentColor" />
            )}
          </span>
        ) : (
          // If the track is NOT active, show the number, 
          // and on hover, fade out the number and fade in the Play icon.
          <>
            <span className="text-xs font-mono text-base-content/60 absolute inset-0 flex items-center justify-center transition-opacity group-hover:opacity-0">
              {index + 1}
            </span>
            <Play size={14} className="absolute inset-0 m-auto text-base-content opacity-0 transition-opacity group-hover:opacity-100" fill="currentColor" />
          </>
        )}
      </div>

      <AlbumArt
        src={track.image}
        className={`w-11 h-11 rounded-lg object-cover bg-base-300 shadow-[0_0_15px_rgba(0,0,0,0.3)] shrink-0  ${active ? "ring-1 ring-primary/30" : ""}`}
      />

      <div className="min-w-0 flex-1">
        {shouldScroll ? (
          <>
            {/* ── Mobile Title: Marquee if >= 15 chars ── */}
            {titleLen >= 15 ? (
              <div className="marquee-container sm:hidden">
                <p className={`text-sm font-medium marquee-content ${active ? "text-primary-content" : ""}`}>
                  <span className="mx-4">{track.name}</span>
                  <span className="mx-4">{track.name}</span>
                </p>
              </div>
            ) : (
              <p className={`text-sm font-medium truncate sm:hidden ${active ? "text-primary-content" : ""}`}>{track.name}</p>
            )}
            
            {/* ── Desktop Title: Marquee ONLY if truncated by browser ── */}
            {isDesktopTitleTruncated ? (
              <div className="marquee-container hidden sm:block">
                <p className={`text-sm font-medium marquee-content ${active ? "text-primary-content" : ""}`}>
                  <span className="mx-4">{track.name}</span>
                  <span className="mx-4">{track.name}</span>
                </p>
              </div>
            ) : (
              <p ref={desktopTitleRef} className={`text-sm font-medium truncate hidden sm:block ${active ? "text-primary-content" : ""}`}>{track.name}</p>
            )}
          </>
        ) : (
          // Default state (not hovered/active)
          <>
            <p ref={desktopTitleRef} className={`text-sm font-medium truncate ${active ? "text-primary-content" : ""}`}>{track.name}</p>
          </>
        )}
        
        {shouldScroll ? (
          <>
            {/* ── Mobile Artist: Marquee if >= 15 chars ── */}
            {artistLen >= 15 ? (
              <div className="marquee-container sm:hidden">
                <p className="text-xs text-base-content/50 marquee-content marquee-content-artist">
                  <span className="mx-4">{track.artist}</span>
                  <span className="mx-4">{track.artist}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-base-content/50 truncate sm:hidden">{track.artist}</p>
            )}

            {/* ── Desktop Artist: Marquee ONLY if truncated by browser ── */}
            {isDesktopArtistTruncated ? (
              <div className="marquee-container hidden sm:block">
                <p className="text-xs text-base-content/50 marquee-content marquee-content-artist">
                  <span className="mx-4">{track.artist}</span>
                  <span className="mx-4">{track.artist}</span>
                </p>
              </div>
            ) : (
              <p ref={desktopArtistRef} className="text-xs text-base-content/50 truncate hidden sm:block">{track.artist}</p>
            )}
          </>
        ) : (
           // Default state (not hovered/active)
           <>
             <p ref={desktopArtistRef} className="text-xs text-base-content/50 truncate">{track.artist}</p>
           </>
        )}
      </div>

      {track.source === "itunes" && (
        <span className="hidden sm:inline text-[9px] text-error/70 bg-error/10 px-1.5 py-0.5 rounded-full">30s</span>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); toggleUserQueue(track); }}
        className={`shrink-0 transition-opacity ${inQueue ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        title={inQueue ? "Remove from Queue" : "Add to Queue"}
      >
        <ListPlus size={16} className={inQueue ? "text-primary" : "text-base-content/60 hover:text-primary"} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
        className={`shrink-0 transition-opacity ${liked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <Heart size={15} className={liked ? "fill-error text-error" : "text-base-content/60 hover:text-base-content/40"} />
      </button>

      <span className="text-xs text-base-content/60 font-mono shrink-0 w-10 text-right">
        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}
      </span>
    </div>
  );
}

export default React.memo(TrackRow, (prev, next) =>
  prev.track.id === next.track.id &&
  prev.index === next.index &&
  prev.tracks === next.tracks
);