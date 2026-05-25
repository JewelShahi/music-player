import React, { useRef } from "react";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import NowPlayingModal from "./components/NowPlayingModal";
import { HomeView, QueueView, LikedView, ThemesView } from "./components/Views";
import { initAPI } from "./services/api";
import toast, { Toaster } from "react-hot-toast";
import { Wifi, WifiOff, X } from "lucide-react";

function AppInner() {
  const { currentView, setApiSource } = usePlayer();
  const [initing, setIniting] = React.useState(true);
  const [initError, setInitError] = React.useState(null);

  // Track offline toast ID so we can dismiss it when coming back online
  const offlineToastId = useRef(null);

  React.useEffect(() => {
    initAPI()
      .then((src) => {
        setApiSource(src);
        setIniting(false);
      })
      .catch((err) => {
        console.error("API Init failed:", err);
        setInitError("Could not connect to music services.");
        setIniting(false);
      });
  }, [setApiSource]);

  // ── Network Status Toast Logic ──
  React.useEffect(() => {
    const showOfflineToast = () => {
      // Prevent duplicate toasts if already showing
      if (offlineToastId.current) return;

      offlineToastId.current = toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-[90vw] bg-error/20 backdrop-blur-xl border border-error/30 text-error-content shadow-2xl shadow-black/30 rounded-2xl pointer-events-auto flex items-center gap-3 p-4`}>
          <div className="bg-error/20 p-2 rounded-full">
            <WifiOff size={18} className="text-error" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-error">You're Offline</p>
            <p className="text-xs text-base-content/70">Check your internet connection</p>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="text-base-content/40 hover:text-base-content p-1">
            <X size={16} />
          </button>
        </div>
      ), {
        duration: Infinity, // Stays visible until online
      });
    };

    const showOnlineToast = () => {
      // Dismiss the offline toast if it exists
      if (offlineToastId.current) {
        toast.dismiss(offlineToastId.current);
        offlineToastId.current = null;
      }

      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"
          // Changed bg-primary/60 to bg-primary/20 for the transparent glass effect
          } max-w-md w-[90vw] bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary-content shadow-2xl shadow-black/30 rounded-2xl pointer-events-auto flex items-center gap-3 p-4`}>
          <div className="bg-primary-content/20 p-2 rounded-full">
            <Wifi size={18} className="text-primary-content" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Back Online</p>
            <p className="text-xs text-primary-content/80">Your connection has been restored</p>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="text-primary-content/40 hover:text-primary-content p-1">
            <X size={16} />
          </button>
        </div>
      ), {
        duration: 5000, // Auto-disappears after 5 seconds
      });
    };

    // Check initial status on load
    if (!navigator.onLine) showOfflineToast();

    window.addEventListener("offline", showOfflineToast);
    window.addEventListener("online", showOnlineToast);

    return () => {
      window.removeEventListener("offline", showOfflineToast);
      window.removeEventListener("online", showOnlineToast);
    };
  }, []);

  const views = { home: HomeView, queue: QueueView, liked: LikedView, themes: ThemesView };
  const View = views[currentView] || HomeView;

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
    <div className="h-screen flex flex-col overflow-hidden bg-base-200/70">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-36 lg:pb-24">
          {initing ? (
            <div className="flex items-center justify-center h-full">
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

      {/* ── Toaster Container ── */}
      <Toaster
        position="top-center"
        toastOptions={{
          // Remove default styles so our custom JSX can take over completely
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
          },
        }}
      />
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