import React from "react";
import { usePlayer } from "../context/PlayerContext";
import TrackRow from "./TrackRow";
import { ListMusic, Heart, Play, Shuffle, X, Trash2, ListPlus } from "lucide-react";

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListMusic size={22} className="text-primary" />
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Queue</h2>
          <span className="text-sm text-base-content/50">{userQueue.length} tracks</span>
        </div>
        {userQueue.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => playAll(false)} className="btn btn-sm bg-primary hover:bg-primary-focus border-none text-primary-content gap-1.5">
              <Play size={14} fill="currentColor" /> Play
            </button>
            <button onClick={() => playAll(true)} className="btn btn-sm btn-ghost text-base-content/50 gap-1.5">
              <Shuffle size={14} />
            </button>
            <button onClick={clearUserQueue} className="btn btn-sm btn-ghost text-error/80 hover:text-error gap-1.5">
              <Trash2 size={14} /> Clear
            </button>
          </div>
        )}
      </div>

      {userQueue.length === 0 ? (
        <div className="text-center py-20 text-base-content/60">
          <ListMusic size={48} className="mx-auto mb-3 text-base-content/30" />
          <p className="text-lg font-medium text-base-content/40 mb-1">Your queue is empty</p>
          <p className="text-sm">Add songs to your queue using the <ListPlus size={14} className="inline" /> icon</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {userQueue.map((track, index) => {
            const isActive = currentTrack?.queueId === track.queueId;

            return (
              <div key={track.queueId} className="group flex items-center">
                <div className="flex-1 cursor-pointer" onClick={() => playFromQueue(index)}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-base-content/5 ${isActive ? 'bg-primary/10 ring-1 ring-primary/20' : ''}`}>
                    <span className={`w-6 text-center text-xs font-mono ${isActive ? "text-primary" : "text-base-content/60"}`}>
                      {isActive && isPlaying ? (
                        <span className="flex items-end justify-center gap-0.5 h-4">
                          <span className="w-[3px] rounded-full bg-primary animate-eq-1" />
                          <span className="w-[3px] rounded-full bg-primary animate-eq-2" />
                          <span className="w-[3px] rounded-full bg-primary animate-eq-3" />
                        </span>
                      ) : index + 1}
                    </span>
                    <img src={track.image || ""} alt="" className="w-10 h-10 rounded-lg object-cover bg-base-300 shrink-0" onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-primary-content" : ""}`}>{track.name}</p>
                      <p className="text-xs text-base-content/50 truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs text-base-content/60 font-mono">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromUserQueue(track.queueId)} 
                  className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-base-content/50 hover:text-error mr-1"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LikedView() {
  const { likedTracks, toggleLike, playTrack, isPlaying, currentTrack } = usePlayer();

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart size={22} className="text-error" />
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Liked Songs</h2>
          <span className="text-sm text-base-content/50">{likedTracks.length} tracks</span>
        </div>
        {likedTracks.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => playAll(false)} className="btn btn-sm bg-primary hover:bg-primary-focus border-none text-primary-content gap-1.5">
              <Play size={14} fill="currentColor" /> Play
            </button>
            <button onClick={() => playAll(true)} className="btn btn-sm btn-ghost text-base-content/50 gap-1.5">
              <Shuffle size={14} /> Shuffle
            </button>
          </div>
        )}
      </div>

      {likedTracks.length === 0 ? (
        <div className="text-center py-20 text-base-content/60">
          <Heart size={48} className="mx-auto mb-3 text-base-content/30" />
          <p className="text-lg font-medium text-base-content/40 mb-1">No liked songs yet</p>
          <p className="text-sm">Heart your favorite tracks to save them here</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {likedTracks.map((track, index) => {
            const isActive = currentTrack?.id === track.id;

            return (
              <div key={track.id} className="group flex items-center">
                <div className="flex-1 cursor-pointer" onClick={() => playFromLiked(index)}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-base-content/5 ${isActive ? 'bg-primary/10 ring-1 ring-primary/20' : ''}`}>
                    <span className={`w-6 text-center text-xs font-mono ${isActive ? "text-primary" : "text-base-content/60"}`}>
                      {isActive && isPlaying ? (
                        <span className="flex items-end justify-center gap-0.5 h-4">
                          <span className="w-[3px] rounded-full bg-primary animate-eq-1" />
                          <span className="w-[3px] rounded-full bg-primary animate-eq-2" />
                          <span className="w-[3px] rounded-full bg-primary animate-eq-3" />
                        </span>
                      ) : index + 1}
                    </span>
                    <img src={track.image || ""} alt="" className="w-10 h-10 rounded-lg object-cover bg-base-300 shrink-0" onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-primary-content" : ""}`}>{track.name}</p>
                      <p className="text-xs text-base-content/50 truncate">{track.artist}</p>
                    </div>
                    {track.source === "itunes" && (
                      <span className="hidden sm:inline text-[9px] text-error/70 bg-error/10 px-1.5 py-0.5 rounded-full">30s</span>
                    )}
                    <span className="text-xs text-base-content/60 font-mono">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleLike(track)} 
                  className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-base-content/50 hover:text-error mr-1"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}