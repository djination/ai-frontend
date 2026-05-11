import { useAdminData } from '../AdminDataContext';
import { DiscoverySummary } from '../components/adminUi';

export function AdminDiscoveryPage() {
  const {
    loading,
    discoverQuery,
    setDiscoverQuery,
    discoverCategory,
    setDiscoverCategory,
    discoverDifficulty,
    setDiscoverDifficulty,
    discoverMax,
    setDiscoverMax,
    discoverLang,
    setDiscoverLang,
    discoverBackend,
    setDiscoverBackend,
    discoverSkipEnrichment,
    setDiscoverSkipEnrichment,
    discoverReport,
    handleDiscoverSubmit,
    LEARNING_PATH_OPTIONS,
    DIFFICULTY_OPTIONS,
  } = useAdminData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Cari & impor konten</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Sistem akan mencari halaman web sesuai kata kunci, mengambil teks utama, lalu menyimpannya
          sebagai <span className="font-medium">konten mentah</span>. Setelah itu, buka halaman Konten
          mentah untuk menyunting dan membuat modul draf.
        </p>
        <details className="mt-4 max-w-2xl rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800/60">
          <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
            Cara menggunakan menu ini
          </summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400">
            <li>
              Tulis <span className="font-medium text-slate-800 dark:text-slate-200">kata kunci atau topik</span> yang
              ingin dicari (minimal 3 huruf), misalnya tema grammar atau frasa bisnis.
            </li>
            <li>
              Pilih <span className="font-medium text-slate-800 dark:text-slate-200">Jalur belajar</span> dan{' '}
              <span className="font-medium text-slate-800 dark:text-slate-200">Level</span> (Pemula / Menengah /
              Lanjutan). Level disimpan pada setiap konten mentah agar bisa disaring di halaman Konten mentah dan
              dipakai sebagai default saat Anda membuat modul draf.
            </li>
            <li>
              Atur jumlah artikel (1–15) dan kode bahasa sumber bila perlu. Opsi lanjutan mengatur mesin pencari dan
              penyempurnaan otomatis.
            </li>
            <li>
              Klik <span className="font-medium text-slate-800 dark:text-slate-200">Mulai pencarian</span>. Artikel
              baru muncul di <span className="font-medium">Konten mentah</span>; jika ada hasil, filter level di halaman
              itu otomatis mengikuti level yang Anda pilih di sini.
            </li>
          </ol>
        </details>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 md:p-6">
        <form onSubmit={handleDiscoverSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Kata kunci atau topik
            <textarea
              value={discoverQuery}
              onChange={(ev) => setDiscoverQuery(ev.target.value)}
              rows={3}
              placeholder="Contoh: frasa negosiasi bahasa Inggris untuk rapat bisnis"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500"
            />
          </label>

          <div className="flex flex-wrap gap-4">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="discover-category"
            >
              Jalur belajar
              <select
                id="discover-category"
                value={discoverCategory}
                onChange={(ev) => setDiscoverCategory(ev.target.value)}
                className="mt-1 block min-w-[16rem] rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {LEARNING_PATH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="discover-difficulty"
            >
              Level (sama seperti tambah materi manual)
              <select
                id="discover-difficulty"
                value={discoverDifficulty}
                onChange={(ev) => setDiscoverDifficulty(ev.target.value)}
                className="mt-1 block min-w-[12rem] rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-500">
                Disimpan di metadata konten mentah untuk filter &amp; default modul draf.
              </span>
            </label>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Jumlah artikel (maks. 15)
              <input
                type="number"
                min={1}
                max={15}
                value={discoverMax}
                onChange={(ev) => setDiscoverMax(ev.target.value)}
                className="mt-1 block w-24 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Bahasa sumber
              <input
                type="text"
                value={discoverLang}
                onChange={(ev) => setDiscoverLang(ev.target.value)}
                placeholder="en"
                className="mt-1 block w-24 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          </div>

          <details className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
            <summary className="cursor-pointer text-sm font-medium text-slate-800 select-none dark:text-slate-200">
              Pengaturan lanjutan
            </summary>
            <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-200 pt-3 dark:border-slate-600">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Mesin pencari
                <select
                  value={discoverBackend}
                  onChange={(ev) => setDiscoverBackend(ev.target.value)}
                  className="mt-1 block max-w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="duckduckgo">DuckDuckGo (tanpa API key)</option>
                  <option value="google">Google Custom Search</option>
                  <option value="serpapi">SerpAPI</option>
                </select>
              </label>
              <label className="flex items-center gap-2 pt-6 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={discoverSkipEnrichment}
                  onChange={(ev) => setDiscoverSkipEnrichment(ev.target.checked)}
                />
                Proses lebih cepat (lewati antrian penyempurnaan otomatis)
              </label>
            </div>
          </details>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
          >
            {loading ? 'Memproses…' : 'Mulai pencarian'}
          </button>
        </form>

        <DiscoverySummary report={discoverReport} />
      </article>
    </div>
  );
}
