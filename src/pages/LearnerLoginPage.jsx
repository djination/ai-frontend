import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSessionRole } from '../hooks/useSessionRole';
import {
  clearAuthSession,
  fetchCurrentUser,
  loginWithCredentials,
} from '../services/authSession';
import { sanitizeAppInternalPath } from '../utils/safeReturnPath';
import { executeRecaptcha } from '../utils/recaptcha';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';

function pickReturnPath(searchParams, locationState) {
  const fromQuery = searchParams.get('next');
  const fromState = locationState?.from;
  const raw = fromQuery || fromState || '/app/learn';
  return sanitizeAppInternalPath(raw);
}

export function LearnerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setRole } = useSessionRole();

  const returnTo = useMemo(
    () => pickReturnPath(searchParams, location.state),
    [searchParams, location.state],
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Peserta
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Masuk ke akun learner</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Gunakan username dan kata sandi akun Anda. Setelah masuk Anda akan diarahkan ke halaman
          yang dituju (misalnya chat atau materi).
        </p>
        {RECAPTCHA_SITE_KEY ? (
          <p className="mt-2 text-xs text-slate-500">
            Dilindungi oleh reCAPTCHA saat server mengaktifkan verifikasi login.
          </p>
        ) : null}

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError('');
            try {
              let recaptchaToken = '';
              if (RECAPTCHA_SITE_KEY) {
                recaptchaToken = await executeRecaptcha(RECAPTCHA_SITE_KEY, 'login');
              }
              await loginWithCredentials(username.trim(), password, { recaptchaToken });
              const user = await fetchCurrentUser();
              const isStaff = Boolean(user?.is_staff || user?.is_superuser);
              setRole(isStaff ? 'admin' : 'learner');
              navigate(returnTo, { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Login gagal');
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block text-sm font-medium text-slate-800">
            Username
            <input
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Kata sandi
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <button
          type="button"
          className="mt-3 w-full text-center text-xs text-slate-500 underline hover:text-slate-700"
          onClick={() => clearAuthSession()}
        >
          Hapus token tersimpan di perangkat ini
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Daftar learner
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-slate-600">
          <Link to="/" className="font-semibold text-slate-700 hover:underline">
            Kembali ke beranda
          </Link>
        </p>
      </section>
    </main>
  );
}
