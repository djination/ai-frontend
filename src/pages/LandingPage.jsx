import { Link, useNavigate } from 'react-router-dom';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { useSessionRole } from '../hooks/useSessionRole';
import { clearAuthSession } from '../services/authSession';

const highlights = [
  'Structured learning path untuk Beginner sampai Advanced.',
  'Content ingestion flow yang langsung terhubung ke backend.',
  'Admin panel untuk publish control dan monitoring konten.',
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
            Frontend untuk kursus Bahasa Inggris dengan experience learner dan
            admin content dalam satu sistem.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => enterAs('learner')}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700"
            >
              Masuk sebagai Learner
            </button>
            <button
              type="button"
              onClick={() => enterAs('admin')}
              className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-white"
            >
              Masuk sebagai Admin
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
          Butuh akses cepat?{' '}
          <Link to="/app/learn" className="font-semibold text-brand-700 hover:underline">
            Buka learning
          </Link>
          {' | '}
          <Link to="/app/admin" className="font-semibold text-brand-700 hover:underline">
            Buka admin
          </Link>
        </div>
      </section>
      <div className="mt-4">
        <ProgressDashboard />
      </div>
    </main>
  );
}
