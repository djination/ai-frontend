import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useSessionRole } from '../hooks/useSessionRole';
import { clearAuthSession } from '../services/authSession';

export function AdminPortalLayout() {
  const navigate = useNavigate();
  const { clearRole } = useSessionRole();

  return (
    <div className="mx-auto max-w-[88rem]">
      <header className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 text-white shadow-sm md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Portal internal
          </p>
          <h1 className="mt-1 text-lg font-semibold md:text-xl">Pengelolaan konten kursus</h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-400">
            Area ini terpisah dari tampilan peserta. Gunakan menu di kiri halaman untuk alur kerja
            konten.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/app/learn"
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            Lihat sisi peserta
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
          >
            Beranda portal
          </Link>
          <button
            type="button"
            onClick={() => {
              clearRole();
              clearAuthSession();
              window.dispatchEvent(new Event('admin-logout'));
              navigate('/', { replace: true });
            }}
            className="rounded-lg bg-rose-600/90 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
          >
            Keluar & tutup sesi
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
