
import React, { createContext, useContext, useState } from "react";

export const THEMES = {
  dark: {
    id: "dark",
    name: "Dark",
    dotColor: "#06b6d4",
    mode: "dark",
    bg: "bg-[#07090e]",
    headerBg: "bg-[#07090e]/95",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-400",
    cardBg: "bg-slate-900/80",
    border: "border-slate-700",
    accentGlow: "#06b6d4",
    accentBtn:
      "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20",
    badgeBorder:
      "border-cyan-500/50 bg-cyan-500/15 text-cyan-300",
    taglineGradient: "from-cyan-400 via-teal-300 to-emerald-400",
  },

  light: {
    id: "light",
    name: "Light",
    dotColor: "#2563eb",
    mode: "light",
    bg: "bg-white",
    headerBg: "bg-white/95",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-600",
    cardBg: "bg-slate-50",
    border: "border-slate-300",
    accentGlow: "#2563eb",
    accentBtn:
      "bg-blue-700 hover:bg-blue-800 text-white shadow-blue-500/20",
    badgeBorder:
      "border-blue-300 bg-blue-50 text-blue-800",
    taglineGradient: "from-blue-700 via-indigo-700 to-cyan-700",
  },
};

const LEGACY_THEME_MAP = {
  cyan: "dark",
  amber: "dark",
  emerald: "dark",
  siliconWhite: "light",
  blueprint: "light",
  dark: "dark",
  light: "light",
};

const THEME_STORAGE_KEY = "hardwarehub_theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

      if (!savedTheme) {
        return "dark";
      }

      const mappedTheme = LEGACY_THEME_MAP[savedTheme] || "dark";

      // Keep the saved preference compatible with the two-theme system.
      localStorage.setItem(THEME_STORAGE_KEY, mappedTheme);

      return mappedTheme;
    } catch {
      return "dark";
    }
  });

  const setTheme = (themeKey) => {
    // Support old theme keys in case another component still uses them.
    const mappedTheme = LEGACY_THEME_MAP[themeKey];

    if (!mappedTheme || !THEMES[mappedTheme]) {
      return;
    }

    setCurrentTheme(mappedTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, mappedTheme);
    } catch {
      // The selected theme still works if browser storage is unavailable.
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: THEMES[currentTheme],
        setTheme,
        allThemes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/* -------------------------------------------------------------------------
   Navbar Theme Switcher (Supports Dark and Light Themes)
   ------------------------------------------------------------------------- */

export function ThemeToggle() {
  const { theme, setTheme, allThemes } = useTheme();

  return (
    <div
      className={`flex items-center gap-1 p-1 rounded-xl border transition-colors ${
        theme.mode === "light"
          ? "bg-slate-100 border-slate-300"
          : "bg-slate-900 border-slate-700"
      }`}
      role="group"
      aria-label="Choose appearance"
    >
      {Object.values(allThemes).map((t) => {
        const isActive = t.id === theme.id;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            title={`${t.name} theme`}
            aria-label={`${t.name} theme`}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
              isActive
                ? theme.mode === "light"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-300 font-semibold"
                  : "bg-slate-800 text-white shadow-sm border border-slate-600 font-semibold"
                : theme.mode === "light"
                  ? "text-slate-600 hover:text-slate-950 hover:bg-white/70"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full border border-black/20 shrink-0"
              style={{ backgroundColor: t.dotColor }}
              aria-hidden="true"
            />

            <span>{t.name}</span>
          </button>
        );
      })}
    </div>
  );
}
