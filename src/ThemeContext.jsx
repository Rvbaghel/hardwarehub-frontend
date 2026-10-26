import React, { createContext, useContext, useState } from "react";

export const THEMES = {
  cyan: {
    id: "cyan",
    name: "Cyber Cyan",
    dotColor: "#06b6d4",
    mode: "dark",
    bg: "bg-[#07090e]",
    headerBg: "bg-[#07090e]/85",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-400",
    cardBg: "bg-slate-900/60",
    border: "border-slate-800/80",
    accentGlow: "#06b6d4",
    accentBtn: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20",
    badgeBorder: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
    taglineGradient: "from-cyan-400 via-teal-300 to-emerald-400",
  },
  amber: {
    id: "amber",
    name: "Silicon Amber",
    dotColor: "#f59e0b",
    mode: "dark",
    bg: "bg-[#0c0906]",
    headerBg: "bg-[#0c0906]/85",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-400",
    cardBg: "bg-slate-900/60",
    border: "border-amber-950/60",
    accentGlow: "#f59e0b",
    accentBtn: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20",
    badgeBorder: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    taglineGradient: "from-amber-400 via-orange-300 to-yellow-400",
  },
  emerald: {
    id: "emerald",
    name: "Matrix Emerald",
    dotColor: "#10b981",
    mode: "dark",
    bg: "bg-[#050c08]",
    headerBg: "bg-[#050c08]/85",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-400",
    cardBg: "bg-slate-900/60",
    border: "border-emerald-950/60",
    accentGlow: "#10b981",
    accentBtn: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20",
    badgeBorder: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    taglineGradient: "from-emerald-400 via-teal-300 to-green-400",
  },
  // --- NEW LIGHT THEMES ---
  siliconWhite: {
    id: "siliconWhite",
    name: "Clean Silicon",
    dotColor: "#2563eb",
    mode: "light",
    bg: "bg-[#ffffff]",
    headerBg: "bg-white/90",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-600",
    cardBg: "bg-slate-50/90",
    border: "border-slate-200",
    accentGlow: "#2563eb",
    accentBtn: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25",
    badgeBorder: "border-blue-300 bg-blue-50 text-blue-700",
    taglineGradient: "from-blue-600 via-indigo-600 to-cyan-600",
  },
  blueprint: {
    id: "blueprint",
    name: "Blueprint White",
    dotColor: "#0284c7",
    mode: "light",
    bg: "bg-[#f8fafc]",
    headerBg: "bg-slate-50/90",
    textPrimary: "text-slate-950",
    textSecondary: "text-slate-600",
    cardBg: "bg-white",
    border: "border-slate-300",
    accentGlow: "#0284c7",
    accentBtn: "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/25",
    badgeBorder: "border-sky-300 bg-sky-50 text-sky-800",
    taglineGradient: "from-sky-700 via-blue-700 to-teal-700",
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("hardwarehub_theme") || "cyan";
  });

  const setTheme = (themeKey) => {
    if (THEMES[themeKey]) {
      setCurrentTheme(themeKey);
      localStorage.setItem("hardwarehub_theme", themeKey);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[currentTheme], setTheme, allThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/* -------------------------------------------------------------------------
   Navbar Theme Switcher (Supports All 5 Themes)
   ------------------------------------------------------------------------- */
export function ThemeToggle() {
  const { theme, setTheme, allThemes } = useTheme();

  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors ${
      theme.mode === "light" 
        ? "bg-slate-100 border-slate-200" 
        : "bg-slate-900/80 border-slate-800"
    }`}>
      {Object.values(allThemes).map((t) => {
        const isActive = t.id === theme.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.name}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              isActive
                ? theme.mode === "light"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-300 font-semibold"
                  : "bg-slate-800 text-white shadow-sm border border-slate-700"
                : theme.mode === "light"
                  ? "text-slate-500 hover:text-slate-900"
                  : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full border border-black/10"
              style={{ backgroundColor: t.dotColor }}
            />
            <span className="hidden md:inline text-[11px]">{t.name.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
  );
}