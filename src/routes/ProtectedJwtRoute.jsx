import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  refreshAccessToken,
} from '../services/authSession';

/**
 * Ensures a valid JWT exists (chat and other authenticated APIs).
 * Tanpa JWT: redirect ke /login dengan ?next= path saat ini (aman, hanya path /app/*).
 */
export function ProtectedJwtRoute({ children }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolveSession = async () => {
      const access = getAccessToken();
      if (access && !isAccessTokenExpired()) {
        if (!cancelled) {
          setAuthed(true);
          setReady(true);
        }
        return;
      }

      if (getRefreshToken()) {
        try {
          await refreshAccessToken();
          if (!cancelled) setAuthed(true);
        } catch {
          if (!cancelled) setAuthed(false);
        }
      } else if (!cancelled) {
        setAuthed(false);
      }

      if (!cancelled) setReady(true);
    };

    resolveSession();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Memuat sesi…
      </p>
    );
  }

  if (authed) {
    return children;
  }

  const nextPath = `${location.pathname}${location.search}`;
  const nextParam = encodeURIComponent(nextPath);

  return <Navigate to={`/login?next=${nextParam}`} replace />;
}
