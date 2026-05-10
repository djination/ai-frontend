import { getLearningPathLabel } from '../../constants/learningPaths';
import { useAdminData } from '../AdminDataContext';
import { AdminFiltersBar } from '../components/AdminFiltersBar';
import { InputField } from '../components/adminUi';

export function AdminRawFeedPage() {
  const {
    loading,
    rawContents,
    editingRawId,
    editRawForm,
    setEditRawForm,
    openEditRaw,
    cancelEditRaw,
    saveEditRaw,
    promoteRawToDraft,
    promoteDifficultyByRaw,
    setPromoteDifficultyByRaw,
    DIFFICULTY_OPTIONS,
    LEARNING_PATH_OPTIONS,
  } = useAdminData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Konten mentah</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Ini adalah bahan bacaan yang sudah diimpor tetapi belum menjadi modul pelajaran. Sunting
          bila perlu, lalu buat <span className="font-medium">modul draf</span> untuk melanjutkan ke
          antrian tayang.
        </p>
      </header>

      <AdminFiltersBar />

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          {rawContents.length === 0 ? (
            <p className="text-sm text-slate-600">
              Belum ada konten mentah untuk filter ini. Coba longgarkan filter atau impor dari halaman
              Cari &amp; impor.
            </p>
          ) : (
            rawContents.map((item) => {
              const hasModule = (item.processed_module_count ?? 0) > 0;
              const isEditing = editingRawId === item.id;
              const promoteDiff = promoteDifficultyByRaw[item.id] ?? 'beginner';
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 text-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-slate-600">
                        Jalur: {getLearningPathLabel(item.category)}
                      </p>
                      {(item.language_code || item.locale) && (
                        <p className="mt-1 text-xs text-slate-600">
                          {item.language_code ? (
                            <span className="mr-2">
                              Bahasa: <span className="font-medium">{item.language_code}</span>
                            </span>
                          ) : null}
                          {item.locale ? (
                            <span>
                              Lokal: <span className="font-medium">{item.locale}</span>
                            </span>
                          ) : null}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        Jumlah modul dari konten ini: {item.processed_module_count ?? 0}
                        {hasModule
                          ? ' — satu modul per konten; hubungi tim IT jika perlu membuat ulang.'
                          : ''}
                      </p>
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block break-all text-sm font-medium text-brand-700 hover:underline"
                      >
                        {item.source_url}
                      </a>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => openEditRaw(item)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:border-brand-400 disabled:opacity-50"
                      >
                        Sunting
                      </button>
                      <select
                        aria-label={`Tingkat kesulitan untuk konten ${item.id}`}
                        value={promoteDiff}
                        disabled={hasModule || loading}
                        onChange={(ev) =>
                          setPromoteDifficultyByRaw((prev) => ({
                            ...prev,
                            [item.id]: ev.target.value,
                          }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 disabled:opacity-50"
                      >
                        {DIFFICULTY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={hasModule || loading}
                        onClick={() => promoteRawToDraft(item.id)}
                        className="rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Jadikan modul draf
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      <InputField
                        label="Judul"
                        name="edit-title"
                        value={editRawForm.title}
                        onChange={(ev) =>
                          setEditRawForm((p) => ({ ...p, title: ev.target.value }))
                        }
                      />
                      <InputField
                        label="Tautan sumber"
                        name="edit-url"
                        type="url"
                        value={editRawForm.source_url}
                        onChange={(ev) =>
                          setEditRawForm((p) => ({ ...p, source_url: ev.target.value }))
                        }
                      />
                      <label className="text-sm font-medium text-slate-700">
                        Jalur belajar
                        <select
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                          value={editRawForm.category}
                          onChange={(ev) =>
                            setEditRawForm((p) => ({ ...p, category: ev.target.value }))
                          }
                        >
                          {LEARNING_PATH_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm font-medium text-slate-700">
                        Isi teks
                        <textarea
                          className="mt-1 min-h-40 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                          value={editRawForm.raw_text}
                          onChange={(ev) =>
                            setEditRawForm((p) => ({ ...p, raw_text: ev.target.value }))
                          }
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={saveEditRaw}
                          className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                          Simpan perubahan
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={cancelEditRaw}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </article>
    </div>
  );
}
