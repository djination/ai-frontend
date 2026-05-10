import { NavLink } from 'react-router-dom';
import { useAdminData } from '../AdminDataContext';
import { StatCard } from '../components/adminUi';

const STEPS = [
  {
    to: '/app/admin/temukan',
    title: 'Cari & impor dari web',
    body: 'Cocok untuk mengumpulkan artikel dari mesin pencari secara otomatis.',
    badge: 'Otomatis',
  },
  {
    to: '/app/admin/tambah',
    title: 'Tambah materi sendiri',
    body: 'Tempel teks atau materi yang sudah Anda siapkan — sistem menyimpan sebagai draf.',
    badge: 'Manual',
  },
  {
    to: '/app/admin/mentah',
    title: 'Periksa konten mentah',
    body: 'Perbaiki judul atau teks sebelum diubah menjadi modul pelajaran.',
    badge: 'Langkah 1',
  },
  {
    to: '/app/admin/antrian',
    title: 'Antrian tayang',
    body: 'Setujui atau tolak modul sebelum terlihat oleh peserta.',
    badge: 'Langkah 2',
  },
];

export function AdminDashboardPage() {
  const { stats, loading } = useAdminData();

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Selamat datang
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
          Panel kelola konten
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Di sini Anda mengatur alur materi: dari pengumpulan teks, penyuntingan, hingga persetujuan
          sebelum tayang. Gunakan menu di kiri untuk berpindah langkah — tidak perlu menggulir satu
          halaman panjang lagi.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Ringkasan data saat ini</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Konten mentah"
            value={loading ? '…' : stats.rawCount}
            hint="Belum atau baru diekstrak dari sumber"
          />
          <StatCard
            label="Modul olahan"
            value={loading ? '…' : stats.moduleCount}
            hint="Termasuk draf dan yang sudah tayang"
          />
          <StatCard
            label="Sudah tayang"
            value={loading ? '…' : stats.publishedCount}
            hint="Terlihat oleh peserta (sesuai filter bahasa)"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Alur kerja yang disarankan</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {STEPS.map((step) => (
            <NavLink
              key={step.to}
              to={step.to}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
                {step.badge}
              </span>
              <p className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-brand-800">
                {step.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              <p className="mt-4 text-xs font-semibold text-brand-700">Buka halaman →</p>
            </NavLink>
          ))}
        </div>
      </section>
    </div>
  );
}
