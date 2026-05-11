import { useTheme } from '../context/ThemeContext';

/**
 * @param {{ variant?: 'default' | 'onDark' }} props
 */
export function ThemeToggle({ variant = 'default' }) {
  const { isDark, toggleTheme } = useTheme();
  const onDark = variant === 'onDark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
      className={
        onDark
          ? 'rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20'
          : 'rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
      }
    >
      {isDark ? '☀ Terang' : '🌙 Gelap'}
    </button>
  );
}
