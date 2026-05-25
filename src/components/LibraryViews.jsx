import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";
import AlbumArt from "./AlbumArt"; // <-- ADDED IMPORT
import { ListMusic, Heart, Play, Shuffle, X, Trash2, ListPlus } from "lucide-react";

// ── Custom Hook: Checks if text is actually truncating ──
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

// ── Queue Item Sub-component ──
function QueueItem({ track, index, isActive, isPlaying, playFromQueue, removeFromUserQueue }) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldScroll = isActive || isHovered;
  
  const titleLen = track.name.length;
  const artistLen = track.artist.length;

  const desktopTitleRef = useRef(null);
  const desktopArtistRef = useRef(null);
  const isDesktopTitleTruncated = useIsTruncated(desktopTitleRef, [track.name, isActive]);
  const isDesktopArtistTruncated = useIsTruncated(desktopArtistRef, [track.artist, isActive]);

  return (
    <div 
      className={`group flex items-center rounded-xl transition-all ${isActive ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 cursor-pointer min-w-0" onClick={() => playFromQueue(index)}>
        <div className="flex items-center gap-3 px-2 sm:px-3 py-2.5">
          <span className={`hidden sm:flex w-6 justify-center text-xs font-mono ${isActive ? "text-primary" : "text-base-content/40"}`}>
            {isActive && isPlaying ? (
              <span className="flex items-end justify-center gap-0.5 h-4">
                <span className="w-[3px] rounded-full bg-primary animate-eq-1" />
                <span className="w-[3px] rounded-full bg-primary animate-eq-2" />
                <span className="w-[3px] rounded-full bg-primary animate-eq-3" />
              </span>
            ) : index + 1}
          </span>
          
          {/* REPLACED IMG WITH ALBUMART */}
          <AlbumArt 
            src={track.image} 
            className="w-11 h-11 rounded-lg object-cover bg-base-300 shrink-0 shadow-md shadow-black/20" 
          />
          
          <div className="min-w-0 flex-1">
            {shouldScroll ? (
              <>
                {titleLen >= 20 ? (
                  <div className="marquee-container sm:hidden"><p className={`text-sm font-medium marquee-content ${isActive ? "text-primary" : ""}`}><span className="mx-4">{track.name}</span><span className="mx-4">{track.name}</span></p></div>
                ) : (
                  <p className={`text-sm font-medium truncate sm:hidden ${isActive ? "text-primary" : ""}`}>{track.name}</p>
                )}
                {isDesktopTitleTruncated ? (
                  <div className="marquee-container hidden sm:block"><p className={`text-sm font-medium marquee-content ${isActive ? "text-primary" : ""}`}><span className="mx-4">{track.name}</span><span className="mx-4">{track.name}</span></p></div>
                ) : (
                  <p ref={desktopTitleRef} className={`text-sm font-medium truncate hidden sm:block ${isActive ? "text-primary" : ""}`}>{track.name}</p>
                )}
              </>
            ) : (
              <p ref={desktopTitleRef} className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>{track.name}</p>
            )}

            {shouldScroll ? (
              <>
                {artistLen >= 20 ? (
                  <div className="marquee-container sm:hidden"><p className="text-xs text-base-content/50 marquee-content marquee-content-artist"><span className="mx-4">{track.artist}</span><span className="mx-4">{track.artist}</span></p></div>
                ) : (
                  <p className="text-xs text-base-content/50 truncate sm:hidden">{track.artist}</p>
                )}
                {isDesktopArtistTruncated ? (
                  <div className="marquee-container hidden sm:block"><p className="text-xs text-base-content/50 marquee-content marquee-content-artist"><span className="mx-4">{track.artist}</span><span className="mx-4">{track.artist}</span></p></div>
                ) : (
                  <p ref={desktopArtistRef} className="text-xs text-base-content/50 truncate hidden sm:block">{track.artist}</p>
                )}
              </>
            ) : (
              <p ref={desktopArtistRef} className="text-xs text-base-content/50 truncate">{track.artist}</p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-base-content/40 font-mono w-10 text-right">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
      <button onClick={() => removeFromUserQueue(track.queueId)} className="btn btn-ghost btn-xs sm:opacity-0 group-hover:sm:opacity-100 text-base-content/40 hover:text-error mr-1 transition-all" title="Remove from Queue"><X size={16} /></button>
    </div>
  );
}

// ── Liked Item Sub-component ──
function LikedItem({ track, index, isActive, isPlaying, playFromLiked, toggleLike }) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldScroll = isActive || isHovered;
  
  const titleLen = track.name.length;
  const artistLen = track.artist.length;

  const desktopTitleRef = useRef(null);
  const desktopArtistRef = useRef(null);
  const isDesktopTitleTruncated = useIsTruncated(desktopTitleRef, [track.name, isActive]);
  const isDesktopArtistTruncated = useIsTruncated(desktopArtistRef, [track.artist, isActive]);

  return (
    <div 
      className={`group flex items-center rounded-xl transition-all ${isActive ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 cursor-pointer min-w-0" onClick={() => playFromLiked(index)}>
        <div className="flex items-center gap-3 px-2 sm:px-3 py-2.5">
          <span className={`hidden sm:flex w-6 justify-center text-xs font-mono ${isActive ? "text-primary" : "text-base-content/40"}`}>
            {isActive && isPlaying ? (
              <span className="flex items-end justify-center gap-0.5 h-4">
                <span className="w-[3px] rounded-full bg-primary animate-eq-1" />
                <span className="w-[3px] rounded-full bg-primary animate-eq-2" />
                <span className="w-[3px] rounded-full bg-primary animate-eq-3" />
              </span>
            ) : index + 1}
          </span>
          
          {/* REPLACED IMG WITH ALBUMART */}
          <AlbumArt 
            src={track.image} 
            className="w-11 h-11 rounded-lg object-cover bg-base-300 shrink-0 shadow-md shadow-black/20" 
          />
          
          <div className="min-w-0 flex-1">
            {shouldScroll ? (
              <>
                {titleLen >= 20 ? (
                  <div className="marquee-container sm:hidden"><p className={`text-sm font-medium marquee-content ${isActive ? "text-primary" : ""}`}><span className="mx-4">{track.name}</span><span className="mx-4">{track.name}</span></p></div>
                ) : (
                  <p className={`text-sm font-medium truncate sm:hidden ${isActive ? "text-primary" : ""}`}>{track.name}</p>
                )}
                {isDesktopTitleTruncated ? (
                  <div className="marquee-container hidden sm:block"><p className={`text-sm font-medium marquee-content ${isActive ? "text-primary" : ""}`}><span className="mx-4">{track.name}</span><span className="mx-4">{track.name}</span></p></div>
                ) : (
                  <p ref={desktopTitleRef} className={`text-sm font-medium truncate hidden sm:block ${isActive ? "text-primary" : ""}`}>{track.name}</p>
                )}
              </>
            ) : (
              <p ref={desktopTitleRef} className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>{track.name}</p>
            )}

            {shouldScroll ? (
              <>
                {artistLen >= 20 ? (
                  <div className="marquee-container sm:hidden"><p className="text-xs text-base-content/50 marquee-content marquee-content-artist"><span className="mx-4">{track.artist}</span><span className="mx-4">{track.artist}</span></p></div>
                ) : (
                  <p className="text-xs text-base-content/50 truncate sm:hidden">{track.artist}</p>
                )}
                {isDesktopArtistTruncated ? (
                  <div className="marquee-container hidden sm:block"><p className="text-xs text-base-content/50 marquee-content marquee-content-artist"><span className="mx-4">{track.artist}</span><span className="mx-4">{track.artist}</span></p></div>
                ) : (
                  <p ref={desktopArtistRef} className="text-xs text-base-content/50 truncate hidden sm:block">{track.artist}</p>
                )}
              </>
            ) : (
              <p ref={desktopArtistRef} className="text-xs text-base-content/50 truncate">{track.artist}</p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {track.source === "itunes" && (<span className="text-[9px] text-error/70 bg-error/10 px-1.5 py-0.5 rounded-full">30s</span>)}
            <span className="text-xs text-base-content/40 font-mono w-10 text-right">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
      <button onClick={() => toggleLike(track)} className="btn btn-ghost btn-xs sm:opacity-0 group-hover:sm:opacity-100 text-error hover:text-error mr-1 transition-all" title="Remove from Liked">
        <Heart size={16} className="fill-current" />
      </button>
    </div>
  );
}


// ── Main Views ──

export function QueueView() {
  const { userQueue, removeFromUserQueue, clearUserQueue, playTrack, isPlaying, currentTrack } = usePlayer();

  const playFromQueue = (index) => {
    if (userQueue[index]?.audio) playTrack(userQueue[index], userQueue, index);
  };

  const playAll = (shuffle = false) => {
    let list = [...userQueue];
    if (shuffle) list.sort(() => Math.random() - 0.5);
    if (list.length) playTrack(list[0], list, 0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <ListMusic size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Queue</h2>
            <p className="text-xs text-base-content/50">{userQueue.length} tracks</p>
          </div>
        </div>
        {userQueue.length > 0 && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => playAll(false)} className="btn btn-sm bg-primary hover:bg-primary/30 border-none text-primary-content gap-1.5 flex-1 sm:flex-none"><Play size={14} fill="currentColor" /> Play</button>
            <button onClick={() => playAll(true)} className="btn btn-sm btn-ghost text-base-content/50 gap-1.5 flex-1 sm:flex-none"><Shuffle size={14} /> Shuffle</button>
            <button onClick={clearUserQueue} className="btn btn-sm btn-ghost text-error/70 hover:text-error gap-1.5"><Trash2 size={14} /> Clear</button>
          </div>
        )}
      </div>

      {userQueue.length === 0 ? (
        <div className="text-center py-20 text-base-content/60">
          <ListMusic size={48} className="mx-auto mb-3 text-base-content/20" />
          <p className="text-lg font-medium text-base-content/40 mb-1">Your queue is empty</p>
          <p className="text-sm">Add songs to your queue using the <ListPlus size={14} className="inline" /> icon</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {userQueue.map((track, index) => (
            <QueueItem 
              key={track.queueId}
              track={track}
              index={index}
              isActive={currentTrack?.queueId === track.queueId}
              isPlaying={isPlaying}
              playFromQueue={playFromQueue}
              removeFromUserQueue={removeFromUserQueue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LikedView() {
  const { likedTracks, toggleLike, clearLiked, playTrack, isPlaying, currentTrack } = usePlayer();

  const playFromLiked = (index) => {
    if (likedTracks[index]?.audio) playTrack(likedTracks[index], likedTracks, index);
  };

  const playAll = (shuffle = false) => {
    let list = [...likedTracks];
    if (shuffle) list.sort(() => Math.random() - 0.5);
    if (list.length) playTrack(list[0], list, 0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center">
             <Heart size={20} className="text-error fill-error" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Liked Songs</h2>
            <p className="text-xs text-base-content/50">{likedTracks.length} tracks</p>
          </div>
        </div>
        {likedTracks.length > 0 && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => playAll(false)} className="btn btn-sm bg-primary hover:bg-primary/30 border-none text-primary-content gap-1.5 flex-1 sm:flex-none"><Play size={14} fill="currentColor" /> Play</button>
            <button onClick={() => playAll(true)} className="btn btn-sm btn-ghost text-base-content/50 gap-1.5 flex-1 sm:flex-none"><Shuffle size={14} /> Shuffle</button>
            <button onClick={clearLiked} className="btn btn-sm btn-ghost text-error/70 hover:text-error gap-1.5"><Trash2 size={14} /> Clear</button>
          </div>
        )}
      </div>

      {likedTracks.length === 0 ? (
        <div className="text-center py-20 text-base-content/60">
          <Heart size={48} className="mx-auto mb-3 text-base-content/20" />
          <p className="text-lg font-medium text-base-content/40 mb-1">No liked songs yet</p>
          <p className="text-sm">Heart your favorite tracks to save them here</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {likedTracks.map((track, index) => (
            <LikedItem 
              key={track.id}
              track={track}
              index={index}
              isActive={currentTrack?.id === track.id}
              isPlaying={isPlaying}
              playFromLiked={playFromLiked}
              toggleLike={toggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}