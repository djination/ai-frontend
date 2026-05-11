import { Link, useNavigate } from 'react-router-dom';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { ThemeToggle } from '../components/ThemeToggle';
import { useSessionRole } from '../hooks/useSessionRole';

const highlights = [
  'Structured learning path untuk Beginner sampai Advanced.',
  'Chat tutor AI setelah login — daftar akun learner dari halaman pendaftaran.',
  'Panel pengelola konten terpisah untuk tim internal (bukan peserta).',
];

export function LandingPage() {
  const navigate = useNavigate();
  const { role, setRole } = useSessionRole();

  const enterAdminContentPortal = () => {
    setRole('admin');
    navigate('/app/admin');
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-12 md:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <div className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
          <ThemeToggle variant="onDark" />
        </div>
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
            {!role ? (
              <>
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
                  onClick={enterAdminContentPortal}
                  className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-white"
                >
                  Masuk sebagai pengurus konten
                </button>
              </>
            ) : role === 'learner' ? (
              <Link
                to="/app/learn"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50"
              >
                Masuk ruang belajar
              </Link>
            ) : (
              <Link
                to="/app/admin"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50"
              >
                Buka portal konten
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-3 p-6 md:grid-cols-3 md:p-10">
          {highlights.map((item) => (
            <article
              key={item}
              className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/80 dark:text-slate-200"
            >
              <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
            </article>
          ))}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 md:px-10">
          {!role ? (
            <>
              <Link
                to="/register"
                className="font-semibold text-brand-700 hover:underline dark:text-brand-400"
              >
                Daftar learner
              </Link>
              {' · '}
              <Link
                to="/login"
                className="font-semibold text-brand-700 hover:underline dark:text-brand-400"
              >
                Login peserta
              </Link>
              {' · '}
              <Link
                to="/app/learn"
                className="font-semibold text-brand-700 hover:underline dark:text-brand-400"
              >
                Ruang belajar
              </Link>
              {' · '}
              <Link
                to="/app/admin"
                className="font-semibold text-slate-500 hover:underline dark:text-slate-500"
              >
                Portal konten (internal)
              </Link>
            </>
          ) : role === 'learner' ? (
            <Link
              to="/app/learn"
              className="font-semibold text-brand-700 hover:underline dark:text-brand-400"
            >
              Lanjut ke ruang belajar →
            </Link>
          ) : (
            <Link
              to="/app/admin"
              className="font-semibold text-brand-700 hover:underline dark:text-brand-400"
            >
              Lanjut ke portal konten →
            </Link>
          )}
        </div>
      </section>
      <div className="mt-4">
        <ProgressDashboard />
      </div>
    </main>
  );
}
