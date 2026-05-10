import { NavLink, Outlet } from 'react-router-dom';
import { AdminDataProvider, useAdminData } from './AdminDataContext';
import { StatusMessage } from '../components/StatusMessage';

const NAV_ITEMS = [
  {
    to: '/app/admin',
    end: true,
    title: 'Beranda',
    caption: 'Ringkasan singkat & panduan',
  },
  {
    to: '/app/admin/temukan',
    title: 'Cari & impor',
    caption: 'Ambil artikel dari web',
  },
  {
    to: '/app/admin/tambah',
    title: 'Tambah manual',
    caption: 'Tempel teks atau materi Anda',
  },
  {
    to: '/app/admin/antrian',
    title: 'Antrian tayang',
    caption: 'Setujui atau tolak modul',
  },
  {
    to: '/app/admin/mentah',
    title: 'Konten mentah',
    caption: 'Edit sebelum jadi modul',
  },
];

function AdminShell() {
  const { feedback, error } = useAdminData();

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-60 xl:w-64">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-md">
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Panel konten
            </p>
            <p className="mt-1 text-lg font-semibold leading-snug">Kelola materi kursus</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Tiap langkah dipisah agar tidak menumpuk di satu layar panjang.
            </p>
          </div>
          <nav className="flex flex-row gap-1 overflow-x-auto px-2 py-3 lg:flex-col lg:overflow-visible">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block min-w-[10.5rem] shrink-0 rounded-xl px-3 py-2.5 transition lg:min-w-0 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span
                      className={`mt-0.5 block text-[11px] leading-snug ${
                        isActive ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {item.caption}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('admin-logout'))}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              Keluar dari panel admin
            </button>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              Atau gunakan tombol keluar di bilah atas portal admin.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        <div className="space-y-2">
          <StatusMessage type="success" message={feedback} />
          <StatusMessage type="error" message={error} />
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export function AdminWorkspace() {
  return (
    <AdminDataProvider>
      <AdminShell />
    </AdminDataProvider>
  );
}
