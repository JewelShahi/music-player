import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { Palette, Check } from "lucide-react";

const themeData = [
  { id: "midnight", name: "Midnight", desc: "Deep purple & indigo", colors: ["#8b5cf6", "#6366f1", "#0c0c16"] },
  { id: "crimson", name: "Crimson", desc: "Dark rose & red", colors: ["#e11d48", "#be123c", "#0e0608"] },
  { id: "forest", name: "Forest", desc: "Emerald & dark green", colors: ["#10b981", "#059669", "#060e0a"] },
  { id: "ocean", name: "Ocean", desc: "Mixed blue & teal", colors: ["#14b8a6", "#06b6d4", "#060e11"] },
];

export default function ThemesView() {
  const { theme, setTheme } = usePlayer();

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Palette size={22} className="text-accent" />
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Themes</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themeData.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative group p-4 rounded-2xl border transition-all duration-200 text-left ${
                isActive 
                  ? "bg-accent-10 border-accent-40 shadow-lg shadow-accent-10 scale-[1.02]" 
                  : "bg-surface-3 border-white/5 hover:border-white/15 hover:bg-surface-4"
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