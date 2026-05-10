import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSessionRole } from '../hooks/useSessionRole';
import { loginWithCredentials, registerLearner } from '../services/authSession';
import { executeRecaptcha } from '../utils/recaptcha';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setRole } = useSessionRole();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Peserta baru
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Buat akun learner</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Daftar untuk mendapatkan username dan kata sandi guna masuk ke Chat AI dan fitur yang
          memerlukan login. Akun admin/pengurus konten tetap dibuat lewat Django, bukan dari form
          ini.
        </p>
        {RECAPTCHA_SITE_KEY ? (
          <p className="mt-2 text-xs text-slate-500">
            Dilindungi oleh reCAPTCHA; penggunaan tunduk pada kebijakan Google.
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
                recaptchaToken = await executeRecaptcha(RECAPTCHA_SITE_KEY, 'register');
              }
              await registerLearner({
                username,
                password,
                passwordConfirm,
                email,
                recaptchaToken,
              });
              await loginWithCredentials(username.trim(), password);
              setRole('learner');
              navigate('/app/learn', { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Pendaftaran gagal');
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
              placeholder="mis. budi_santoso"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Email (opsional)
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              placeholder="nama@email.com"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Kata sandi (minimal 8 karakter)
            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Ulangi kata sandi
            <input
              required
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {loading ? 'Memproses…' : 'Daftar & masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Masuk di halaman login
          </Link>
          {' · '}
          <Link to="/" className="font-semibold text-slate-700 hover:underline">
            Beranda
          </Link>
        </p>
      </section>
    </main>
  );
}
