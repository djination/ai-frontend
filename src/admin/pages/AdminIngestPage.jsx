import { useAdminData } from '../AdminDataContext';
import { InputField } from '../components/adminUi';

export function AdminIngestPage() {
  const {
    loading,
    formData,
    handleInputChange,
    handleSubmitIngest,
    DIFFICULTY_OPTIONS,
    LEARNING_PATH_OPTIONS,
  } = useAdminData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Tambah materi manual</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Isi formulir berikut jika Anda sudah punya teks atau ringkasan materi. Sistem akan
          menyimpannya sebagai draf modul agar bisa ditinjau di halaman Antrian tayang.
        </p>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 md:p-6">
        <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmitIngest}>
          <InputField
            label="Judul materi"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Tautan sumber (URL)"
            name="source_url"
            type="url"
            value={formData.source_url}
            onChange={handleInputChange}
            required
          />
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Jalur belajar
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {LEARNING_PATH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tingkat kesulitan untuk peserta
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              required
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Isi teks pelajaran
            <textarea
              className="mt-1 min-h-36 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500"
              name="raw_text"
              value={formData.raw_text}
              onChange={handleInputChange}
              required
            />
          </label>
          <button
            type="submit"
            className="w-fit rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Menyimpan…' : 'Simpan sebagai draf'}
          </button>
        </form>

        <details className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
          <summary className="cursor-pointer font-semibold text-slate-800 select-none dark:text-slate-200">
            Untuk tim teknis
          </summary>
          <p className="mt-2 leading-relaxed">
            Pengiriman memakai endpoint backend{' '}
            <code className="rounded bg-slate-200 px-1 dark:bg-slate-900 dark:text-slate-200">ingest</code>{' '}
            dengan kunci{' '}
            <code className="rounded bg-slate-200 px-1 dark:bg-slate-900 dark:text-slate-200">
              VITE_INGEST_API_KEY
            </code>{' '}
            di frontend yang harus cocok dengan pengaturan API key di server.
          </p>
        </details>
      </article>
    </div>
  );
}
