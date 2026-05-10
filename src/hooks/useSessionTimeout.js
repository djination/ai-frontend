import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { clearAuthSession } from '../services/authSession';

const DEFAULT_TIMEOUT_MS = Number(
  import.meta.env.VITE_SESSION_TIMEOUT_MS ?? 30 * 60 * 1000,
);

export function useSessionTimeout() {
  const navigate = useNavigate();

  useEffect(() => {
    let timerId;

    const hasSession = () =>
      Boolean(
        localStorage.getItem(STORAGE_KEYS.ROLE) ||
          localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) ||
          localStorage.getItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN) ||
          localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN),
      );

    const resetTimer = () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
      if (!hasSession()) {
        return;
      }
      timerId = window.setTimeout(() => {
        localStorage.removeItem(STORAGE_KEYS.ROLE);
        clearAuthSession();
        navigate('/', { replace: true });
      }, DEFAULT_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [navigate]);
}
