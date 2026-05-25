import React from "react";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import NowPlayingModal from "./components/NowPlayingModal";
import { HomeView, QueueView, LikedView, ThemesView } from "./components/Views";
import { initAPI } from "./services/api";

function AppInner() {
  const { currentView, setCurrentView, setApiSource } = usePlayer();
  const [initing, setIniting] = React.useState(true);

  React.useEffect(() => {
    initAPI().then((src) => { setApiSource(src); setIniting(false); });
  }, []);

  // Added themes
  const views = { home: HomeView, queue: QueueView, liked: LikedView, themes: ThemesView };
  const View = views[currentView] || HomeView;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-1">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar initing={initing} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-36 lg:pb-24">
          {initing ? (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg text-accent"></span>
            </div>
          ) : (
            <View />
          )}
        </main>
      </div>

      {/* Player bar */}
      <Player />

      {/* Now playing overlay */}
      <NowPlayingModal />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppInner />
    </PlayerProvider>
  );
}