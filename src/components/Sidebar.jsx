import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";
import AlbumArt from "./AlbumArt";
import { Home, ListMusic, Heart, Music2, Wifi, WifiOff, Palette } from "lucide-react";

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

// ── Mini Now Playing Sub-component ──
function MiniNowPlaying({ currentTrack, isPlaying }) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldScroll = isPlaying || isHovered;

  const titleRef = useRef(null);
  const artistRef = useRef(null);
  const isTitleTruncated = useIsTruncated(titleRef, [currentTrack?.name]);
  const isArtistTruncated = useIsTruncated(artistRef, [currentTrack?.artist]);

  if (!currentTrack) return null;

  return (
    <div 
      className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/5 border border-primary/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2.5">
        <AlbumArt src={currentTrack.image} className="w-10 h-10 rounded-lg object-cover bg-base-300 shrink-0" />
        <div className="min-w-0 flex-1">
          
          {/* Title Logic */}
          {shouldScroll && isTitleTruncated ? (
            <div className="marquee-container">
              <p className="text-xs font-semibold marquee-content">
                <span className="mx-2">{currentTrack.name}</span>
                <span className="mx-2">{currentTrack.name}</span>
              </p>
            </div>
          ) : (
            <p ref={titleRef} className="text-xs font-semibold truncate">{currentTrack.name}</p>
          )}

          {/* Artist Logic */}
          {shouldScroll && isArtistTruncated ? (
            <div className="marquee-container">
              <p className="text-[10px] text-base-content/50 marquee-content marquee-content-artist">
                <span className="mx-2">{currentTrack.artist}</span>
                <span className="mx-2">{currentTrack.artist}</span>
              </p>
            </div>
          ) : (
            <p ref={artistRef} className="text-[10px] text-base-content/50 truncate">{currentTrack.artist}</p>
          )}
          
        </div>
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4 shrink-0">
            <div className="w-[3px] rounded-full bg-primary animate-eq-1" />
            <div className="w-[3px] rounded-full bg-primary animate-eq-2" />
            <div className="w-[3px] rounded-full bg-primary animate-eq-3" />
            <div className="w-[3px] rounded-full bg-primary animate-eq-4" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Sidebar Component ──
export default function Sidebar({ initing }) {
  const { currentView, setCurrentView, apiSource, userQueue, likedTracks, currentTrack, isPlaying } = usePlayer();

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "queue", icon: ListMusic, label: "Queue", badge: userQueue?.length || null },
    { id: "liked", icon: Heart, label: "Liked", badge: likedTracks?.length || null },
    { id: "themes", icon: Palette, label: "Themes" },
  ];

  return (
    <aside className="hidden lg:flex w-60 flex-col bg-primary/10 border-r border-base-content/5 shrink-0">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Music2 size={18} className="text-primary-content" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Audify</h1>
          <p className="text-[10px] text-base-content/50 font-medium">Music Player • Jewel Shahi</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${currentView === item.id
                ? "bg-primary/15 text-primary-content"
                : "text-base-content/50 hover:text-base-content/70 hover:bg-base-content/5"
              }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[11px] bg-base-content/10 text-base-content/50 px-1.5 py-0.5 rounded-full min-w-[24px] h-6 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Source status */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-base-300 border border-base-content/5">
        <div className="flex items-center gap-2 text-xs">
          {apiSource === "none" ? (
            <WifiOff size={14} className="text-error" />
          ) : (
            <Wifi size={14} className="text-success" />
          )}
          <span className="text-base-content/50">
            {apiSource === "audius" ? "Audius · Full tracks" : apiSource === "itunes" ? "iTunes · 30s previews" : "Offline"}
          </span>
        </div>
      </div>

      {/* Now playing mini*/}
      <MiniNowPlaying currentTrack={currentTrack} isPlaying={isPlaying} />
    </aside>
  );
}