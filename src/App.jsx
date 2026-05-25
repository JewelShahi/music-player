import React from "react";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import NowPlayingModal from "./components/NowPlayingModal";
import { HomeView, QueueView, LikedView, ThemesView } from "./components/Views";
import { initAPI } from "./services/api";

function AppInner() {
  const { currentView, setApiSource } = usePlayer(); // Removed unused setCurrentView
  const [initing, setIniting] = React.useState(true);
  const [initError, setInitError] = React.useState(null);

  React.useEffect(() => {
    initAPI()
      .then((src) => {
        setApiSource(src);
        setIniting(false);
      })
      .catch((err) => {
        console.error("API Init failed:", err);
        setInitError("Could not connect to music services.");
        setIniting(false); // Crucial: Stop the loading spinner even if it fails!
      });
  }, [setApiSource]);

  const views = { home: HomeView, queue: QueueView, liked: LikedView, themes: ThemesView };
  const View = views[currentView] || HomeView;

  // Show error state if API fails to initialize
  if (initError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-base-100 text-error gap-4">
        <p className="text-lg font-semibold">{initError}</p>
        <button onClick={() => window.location.reload()} className="btn btn-sm btn-ghost text-base-content/50">
          Retry
        </button>
      </div>
    );
  }

  return (
    // Changed bg-surface-1 to bg-base-100 for guaranteed DaisyUI dark mode compatibility
    <div className="h-screen flex flex-col overflow-hidden bg-base-200/70">
      <div className="flex flex-1 overflow-hidden">
        {/* Removed the unused initing prop from Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-36 lg:pb-24">
          {initing ? (
            <div className="flex items-center justify-center h-full">
              {/* Changed text-accent to text-primary for consistency */}
              <span className="loading loading-spinner loading-lg text-primary"></span>
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