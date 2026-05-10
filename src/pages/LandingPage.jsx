import { Link, useNavigate } from 'react-router-dom';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { useSessionRole } from '../hooks/useSessionRole';
import { clearAuthSession } from '../services/authSession';

const highlights = [
  'Structured learning path untuk Beginner sampai Advanced.',
  'Chat tutor AI setelah login — daftar akun learner dari halaman pendaftaran.',
  'Panel pengelola konten terpisah untuk tim internal (bukan peserta).',
];

export function LandingPage() {
  const navigate = useNavigate();
  const { role, setRole, clearRole } = useSessionRole();

  const enterAs = (selectedRole) => {
    setRole(selectedRole);
    navigate(selectedRole === 'admin' ? '/app/admin' : '/app/learn');
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-12 md:px-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 px-6 py-10 text-white md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            Educational Platform
          </p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            English Learning Hub
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-brand-100 md:text-base">
            Tampilan peserta dan area pengelola konten kini dipisah. Peserta baru bisa mendaftar
            sendiri; tim konten memakai jalur admin terpisah setelah login internal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm"
            >
              Daftar akun learner
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white"
            >
              Masuk peserta (login)
            </Link>
            <button
              type="button"
              onClick={() => enterAs('learner')}
              className="rounded-lg border border-white/25 px-4 py-2 text-xs font-semibold text-brand-100 hover:bg-white/10"
            >
              Demo cepat (tanpa login JWT)
            </button>
            <button
              type="button"
              onClick={() => enterAs('admin')}
              className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-white"
            >
              Masuk sebagai pengurus konten
            </button>
          </div>
          {role ? (
            <p className="mt-3 text-xs text-brand-100">
              Session aktif: <span className="font-semibold">{role}</span>.{' '}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  clearRole();
                  clearAuthSession();
                }}
              >
                Reset session
              </button>
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 p-6 md:grid-cols-3 md:p-10">
          {highlights.map((item) => (
            <article key={item} className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-700">{item}</p>
            </article>
          ))}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-600 md:px-10">
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Daftar learner
          </Link>
          {' · '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Login peserta
          </Link>
          {' · '}
          <Link to="/app/learn" className="font-semibold text-brand-700 hover:underline">
            Ruang belajar
          </Link>
          {' · '}
          <Link to="/app/admin" className="font-semibold text-slate-500 hover:underline">
            Portal konten (internal)
          </Link>
        </div>
      </section>
      <div className="mt-4">
        <ProgressDashboard />
      </div>
    </main>
  );
}
