import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

/** Same key as legacy `frontend` App for continuity. */
export const THEME_STORAGE_KEY = 'english-ai-theme';

const ThemeContext = createContext(null);

function readInitialDark() {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(readInitialDark);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [isDark]);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme: () => setIsDark((d) => !d),
      setDark: (next) => setIsDark(Boolean(next)),
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
