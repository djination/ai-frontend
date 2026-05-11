import { useAdminData } from '../AdminDataContext';

export function AdminFiltersBar({ intro }) {
  const {
    loading,
    filterDraft,
    setFilterDraft,
    setAppliedFilters,
    LEARNING_PATH_OPTIONS,
    DIFFICULTY_OPTIONS,
  } = useAdminData();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Saring tampilan data</h2>
      {intro ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{intro}</p>
      ) : (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Filter ini mengatur apa yang Anda lihat di halaman antrian dan konten mentah. Tekan{' '}
          <span className="font-medium">Terapkan</span> setelah mengubah pilihan.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label
          className="text-xs font-medium text-slate-700 dark:text-slate-300"
          htmlFor="admin-filter-learning-path"
        >
          Jalur belajar (konten mentah)
          <select
            id="admin-filter-learning-path"
            value={filterDraft.category}
            onChange={(ev) =>
              setFilterDraft((p) => ({ ...p, category: ev.target.value }))
            }
            className="mt-1 block min-w-[14rem] max-w-[20rem] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Semua jalur</option>
            {LEARNING_PATH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300" htmlFor="admin-filter-lang">
          Bahasa (kode singkat)
          <input
            id="admin-filter-lang"
            type="text"
            value={filterDraft.language_code}
            onChange={(ev) =>
              setFilterDraft((p) => ({ ...p, language_code: ev.target.value }))
            }
            placeholder="contoh: en, id"
            className="mt-1 block w-36 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
        <label
          className="text-xs font-medium text-slate-700 dark:text-slate-300"
          htmlFor="admin-filter-suggested-level"
        >
          Level (dari impor / manual)
          <select
            id="admin-filter-suggested-level"
            value={filterDraft.suggested_difficulty}
            onChange={(ev) =>
              setFilterDraft((p) => ({ ...p, suggested_difficulty: ev.target.value }))
            }
            className="mt-1 block min-w-[10rem] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Semua level</option>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300" htmlFor="admin-filter-publish">
          Status tayang (modul saja)
          <select
            id="admin-filter-publish"
            value={filterDraft.is_published}
            onChange={(ev) =>
              setFilterDraft((p) => ({ ...p, is_published: ev.target.value }))
            }
            className="mt-1 block rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Semua</option>
            <option value="true">Sudah tayang</option>
            <option value="false">Belum tayang</option>
          </select>
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => setAppliedFilters({ ...filterDraft })}
          className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
        >
          Terapkan filter
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            const empty = {
              category: '',
              language_code: '',
              is_published: '',
              suggested_difficulty: '',
            };
            setFilterDraft(empty);
            setAppliedFilters(empty);
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          Hapus filter
        </button>
      </div>
    </article>
  );
}
