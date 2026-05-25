import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { Home, Search, ListMusic, Heart, Music2, Wifi, WifiOff, Palette } from "lucide-react"; // Added Palette

export default function Sidebar({ initing }) {
  const { currentView, setCurrentView, apiSource, userQueue, likedTracks, currentTrack, isPlaying } = usePlayer();

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "queue", icon: ListMusic, label: "Queue", badge: userQueue.length || null }, 
    { id: "liked", icon: Heart, label: "Liked", badge: likedTracks.length || null },
  ];

  return (
    <aside className="hidden lg:flex w-60 flex-col bg-surface-2 border-r border-white/5 shrink-0">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center shadow-lg shadow-accent/20">
          <Music2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Midnight</h1>
          <p className="text-[10px] text-slate-500 font-medium">Music Player</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === item.id
                ? "bg-accent/15 text-accent-light"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[11px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded-full min-w-[24px] h-6 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Source status */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-surface-3 border border-white/5">
        <div className="flex items-center gap-2 text-xs">
          {apiSource === "none" ? (
            <WifiOff size={14} className="text-red-400" />
          ) : (
            <Wifi size={14} className="text-emerald-400" />
          )}
          <span className="text-slate-400">
            {apiSource === "audius" ? "Audius · Full tracks" : apiSource === "itunes" ? "iTunes · 30s previews" : "Offline"}
          </span>
        </div>
      </div>

      {/* Now playing mini */}
      {currentTrack && (
        <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-r from-accent/10 to-indigo-500/5 border border-accent/10">
          <div className="flex items-center gap-2.5">
            <img src={currentTrack.image || ""} alt="" className="w-10 h-10 rounded-lg object-cover bg-surface-3" onError={(e) => { e.target.src = ""; e.target.className = "w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center"; }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{currentTrack.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentTrack.artist}</p>
            </div>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-4">
                <div className="w-[3px] rounded-full bg-accent animate-eq-1" /><div className="w-[3px] rounded-full bg-accent animate-eq-2" /><div className="w-[3px] rounded-full bg-accent animate-eq-3" /><div className="w-[3px] rounded-full bg-accent animate-eq-4" />
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}