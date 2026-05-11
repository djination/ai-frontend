import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
        404
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Halaman tidak ditemukan
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Link yang kamu buka tidak tersedia atau sudah berubah.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link to="/" className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
          Ke Landing
        </Link>
        <Link
          to="/app/learn"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          Ke Learning
        </Link>
      </div>
    </section>
  );
}
