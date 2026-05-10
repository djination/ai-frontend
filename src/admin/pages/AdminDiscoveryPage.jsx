import { useAdminData } from '../AdminDataContext';
import { DiscoverySummary } from '../components/adminUi';

export function AdminDiscoveryPage() {
  const {
    loading,
    discoverQuery,
    setDiscoverQuery,
    discoverCategory,
    setDiscoverCategory,
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
  } = useAdminData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Cari & impor konten</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Sistem akan mencari halaman web sesuai kata kunci, mengambil teks utama, lalu menyimpannya
          sebagai <span className="font-medium">konten mentah</span>. Setelah itu, buka halaman Konten
          mentah untuk menyunting dan membuat modul draf.
        </p>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <form onSubmit={handleDiscoverSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-800">
            Kata kunci atau topik
            <textarea
              value={discoverQuery}
              onChange={(ev) => setDiscoverQuery(ev.target.value)}
              rows={3}
              placeholder="Contoh: frasa negosiasi bahasa Inggris untuk rapat bisnis"
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </label>

          <div className="flex flex-wrap gap-4">
            <label className="text-sm font-medium text-slate-700" htmlFor="discover-category">
              Jalur belajar
              <select
                id="discover-category"
                value={discoverCategory}
                onChange={(ev) => setDiscoverCategory(ev.target.value)}
                className="mt-1 block min-w-[16rem] rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
              >
                {LEARNING_PATH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Jumlah artikel (maks. 15)
              <input
                type="number"
                min={1}
                max={15}
                value={discoverMax}
                onChange={(ev) => setDiscoverMax(ev.target.value)}
                className="mt-1 block w-24 rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Bahasa sumber
              <input
                type="text"
                value={discoverLang}
                onChange={(ev) => setDiscoverLang(ev.target.value)}
                placeholder="en"
                className="mt-1 block w-24 rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900"
              />
            </label>
          </div>

          <details className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-800 select-none">
              Pengaturan lanjutan
            </summary>
            <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-200 pt-3">
              <label className="text-sm font-medium text-slate-700">
                Mesin pencari
                <select
                  value={discoverBackend}
                  onChange={(ev) => setDiscoverBackend(ev.target.value)}
                  className="mt-1 block max-w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                >
                  <option value="duckduckgo">DuckDuckGo (tanpa API key)</option>
                  <option value="google">Google Custom Search</option>
                  <option value="serpapi">SerpAPI</option>
                </select>
              </label>
              <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
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
