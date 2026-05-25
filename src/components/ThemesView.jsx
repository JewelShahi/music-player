import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { Palette, Check } from "lucide-react";

const themeData = [
  { id: "midnight", name: "Midnight", desc: "Deep purple & indigo", colors: ["#8b5cf6", "#6366f1", "#0c0c16"] },
  { id: "crimson", name: "Crimson", desc: "Dark rose & red", colors: ["#e11d48", "#be123c", "#0e0608"] },
  { id: "forest", name: "Forest", desc: "Emerald & dark green", colors: ["#10b981", "#059669", "#060e0a"] },
  { id: "ocean", name: "Ocean", desc: "Mixed blue & teal", colors: ["#14b8a6", "#06b6d4", "#060e11"] },
  { id: "sunset", name: "Sunset", desc: "Warm amber & orange", colors: ["#f97316", "#ea580c", "#0f0800"] },
  { id: "nord", name: "Nord", desc: "Cool slate & steel blue", colors: ["#60a5fa", "#3b82f6", "#070c12"] },
  { id: "sakura", name: "Sakura", desc: "Soft pink & rose", colors: ["#f472b6", "#ec4899", "#0f060b"] },
  { id: "fuchsia", name: "Fuchsia", desc: "Electric magenta & violet", colors: ["#d946ef", "#c026d3", "#0e020f"] },
  { id: "aurora", name: "Aurora", desc: "Cyan & indigo split", colors: ["#06b6d4", "#818cf8", "#030708"] },
  { id: "wine", name: "Wine", desc: "Deep burgundy & plum", colors: ["#9f1239", "#7f1d1d", "#080205"] },
  { id: "cobalt", name: "Cobalt", desc: "Rich cobalt & electric blue", colors: ["#1740cf", "#1e3a8a", "#02040f"] },
  { id: "infrared", name: "Infrared", desc: "Deep red & hot pink", colors: ["#ff2d55", "#c0152a", "#0f0105"] },
];

export default function ThemesView() {
  const { theme, setTheme } = usePlayer();

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8 min-h-screen overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <Palette size={22} className="text-primary" />
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Themes</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themeData.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                backgroundColor: isActive
                  ? `${t.colors[0]}80`
                  : `${t.colors[0]}4d`,
                borderColor: isActive
                  ? `${t.colors[0]}99`
                  : "rgba(255,255,255,0.05)",
              }}
              className={`relative group p-4 rounded-2xl border transition-all duration-200 text-left ${isActive
                ? "shadow-lg scale-[1.02]"
                : "hover:brightness-125"
                }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                {t.colors.map((color, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black/20 shadow-inner" style={{ backgroundColor: color }} />
                ))}
              </div>

              <h3 className={`text-sm font-semibold ${isActive ? "text-accent-light" : "text-slate-200"}`}>
                {t.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}