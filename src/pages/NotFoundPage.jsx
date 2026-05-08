import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">404</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">Halaman tidak ditemukan</h2>
      <p className="mt-2 text-sm text-slate-600">
        Link yang kamu buka tidak tersedia atau sudah berubah.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link to="/" className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
          Ke Landing
        </Link>
        <Link
          to="/app/learn"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Ke Learning
        </Link>
      </div>
    </section>
  );
}
