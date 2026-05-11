import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants/storageKeys';
import {
  clearAuthSession,
  fetchCurrentUser,
  isAccessTokenExpired,
  loginWithCredentials,
  refreshAccessToken,
  setAdminPanelSession,
} from '../services/authSession';
import { executeRecaptcha } from '../utils/recaptcha';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';

function getInitialAuthState() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function ProtectedAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAccessTokenExpired()) {
      return;
    }

    refreshAccessToken().catch(() => {
      clearAuthSession();
      setIsAuthenticated(false);
    });
  }, [isAuthenticated]);

  useEffect(() => {
    const handleAdminLogout = () => {
      clearAuthSession();
      setIsAuthenticated(false);
    };
    window.addEventListener('admin-logout', handleAdminLogout);
    return () => window.removeEventListener('admin-logout', handleAdminLogout);
  }, []);

  if (isAuthenticated) {
    return children;
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Masuk ke panel konten</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Gunakan akun pengurus konten dari backend (login JWT). Ini berbeda dari memilih peran
        &quot;admin&quot; di halaman utama — kedua langkah diperlukan untuk mengamankan akses.
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError('');
          try {
            let recaptchaToken = '';
            if (RECAPTCHA_SITE_KEY) {
              recaptchaToken = await executeRecaptcha(RECAPTCHA_SITE_KEY, 'login');
            }
            await loginWithCredentials(username, password, { recaptchaToken });
            await fetchCurrentUser();
            setAdminPanelSession(true);
            setIsAuthenticated(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Login gagal');
          } finally {
            setLoading(false);
          }
        }}
      >
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500"
          placeholder="Username"
          autoComplete="username"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500"
          placeholder="Password"
          autoComplete="current-password"
        />
        {error ? <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
        Gunakan akun Django admin/superuser yang sudah dibuat di backend.
      </p>
      <Link to="/app/learn" className="mt-3 inline-block text-xs text-brand-700 hover:underline dark:text-brand-400">
        Kembali ke learning
      </Link>
    </section>
  );
}
