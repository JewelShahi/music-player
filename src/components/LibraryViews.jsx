import React from "react";
import { usePlayer } from "../context/PlayerContext";
import TrackRow from "./TrackRow";
import { ListMusic, Heart, Play, Shuffle, X, Trash2, ListPlus } from "lucide-react"; // Added ListPlus here

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
          <ListMusic size={22} className="text-accent" />
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Queue</h2>
          <span className="text-sm text-slate-500">{userQueue.length} tracks</span>
        </div>
        {userQueue.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => playAll(false)} className="btn btn-sm bg-accent hover:bg-accent-dark border-none text-white gap-1.5">
              <Play size={14} fill="currentColor" /> Play
            </button>
            <button onClick={() => playAll(true)} className="btn btn-sm btn-ghost text-slate-400 gap-1.5">
              <Shuffle size={14} />
            </button>
            <button onClick={clearUserQueue} className="btn btn-sm btn-ghost text-red-400/80 hover:text-red-400 gap-1.5">
              <Trash2 size={14} /> Clear
            </button>
          </div>
        )}
      </div>

      {userQueue.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <ListMusic size={48} className="mx-auto mb-3 text-slate-700" />
          <p className="text-lg font-medium text-slate-400 mb-1">Your queue is empty</p>
          <p className="text-sm">Add songs to your queue using the <ListPlus size={14} className="inline" /> icon</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {userQueue.map((track, index) => {
            const isActive = currentTrack?.queueId === track.queueId;

            return (
              <div key={track.queueId} className="group flex items-center">
                <div className="flex-1 cursor-pointer" onClick={() => playFromQueue(index)}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/5 ${isActive ? 'bg-accent/10 ring-1 ring-accent/20' : ''}`}>
                    <span className={`w-6 text-center text-xs font-mono ${isActive ? "text-accent" : "text-slate-600"}`}>
                      {isActive && isPlaying ? (
                        <span className="flex items-end justify-center gap-0.5 h-4">
                          <span className="w-[3px] rounded-full bg-accent animate-eq-1" />
                          <span className="w-[3px] rounded-full bg-accent animate-eq-2" />
                          <span className="w-[3px] rounded-full bg-accent animate-eq-3" />
                        </span>
                      ) : index + 1}
                    </span>
                    <img src={track.image || ""} alt="" className="w-10 h-10 rounded-lg object-cover bg-surface-3 shrink-0" onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-accent-light" : ""}`}>{track.name}</p>
                      <p className="text-xs text-slate-500 truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs text-slate-600 font-mono">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromUserQueue(track.queueId)} 
                  className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 mr-1"
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
  const { likedTracks, isLiked, toggleLike, playTrack } = usePlayer();

  const playAll = (shuffle = false) => {
    let list = [...likedTracks];
    if (shuffle) list.sort(() => Math.random() - 0.5);
    if (list.length) playTrack(list[0], list, 0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart size={22} className="text-pink-500" />
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Liked Songs</h2>
          <span className="text-sm text-slate-500">{likedTracks.length} tracks</span>
        </div>
        {likedTracks.length > 0 && (
          <button onClick={() => playAll(true)} className="btn btn-sm bg-accent hover:bg-accent-dark border-none text-white gap-1.5">
            <Shuffle size={14} /> Shuffle Play
          </button>
        )}
      </div>

      {likedTracks.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Heart size={48} className="mx-auto mb-3 text-slate-700" />
          <p className="text-lg font-medium text-slate-400 mb-1">No liked songs yet</p>
          <p className="text-sm">Heart your favorite tracks to save them here</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {likedTracks.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} tracks={likedTracks} />
          ))}
        </div>
      )}
    </div>
  );
}