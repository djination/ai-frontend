import { useAdminData } from '../AdminDataContext';
import { AdminFiltersBar } from '../components/AdminFiltersBar';
import { QueueActions, QueueColumn } from '../components/adminUi';

export function AdminQueuePage() {
  const {
    loading,
    queueBuckets,
    reviewNotesMap,
    handleReviewNotesChange,
    handleReviewAction,
  } = useAdminData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Antrian tayang</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Modul mengalir dari <span className="font-medium">Draf</span> →{' '}
          <span className="font-medium">Sudah ditinjau</span> →{' '}
          <span className="font-medium">Tayang</span>. Gunakan tombol di setiap kartu untuk
          menyetujui, menolak, atau menarik materi dari tayangan.
        </p>
      </header>

      <AdminFiltersBar intro="Filter menentukan modul dan konten mentah mana yang dimuat. Sesuaikan bahasa atau status tayang lalu terapkan." />

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <QueueColumn title="Draf" items={queueBuckets.draft} tone="slate">
            {(item) => (
              <QueueActions
                item={item}
                note={reviewNotesMap[item.id] ?? ''}
                onNoteChange={handleReviewNotesChange}
                onApprove={handleReviewAction}
                onReject={handleReviewAction}
                mode="draft"
              />
            )}
          </QueueColumn>
          <QueueColumn title="Sudah ditinjau" items={queueBuckets.reviewed} tone="amber">
            {(item) => (
              <QueueActions
                item={item}
                note={reviewNotesMap[item.id] ?? ''}
                onNoteChange={handleReviewNotesChange}
                onApprove={handleReviewAction}
                onReject={handleReviewAction}
                mode="reviewed"
              />
            )}
          </QueueColumn>
          <QueueColumn title="Tayang" items={queueBuckets.published} tone="emerald">
            {(item) => (
              <QueueActions
                item={item}
                note={reviewNotesMap[item.id] ?? ''}
                onNoteChange={handleReviewNotesChange}
                onApprove={handleReviewAction}
                onReject={handleReviewAction}
                mode="published"
              />
            )}
          </QueueColumn>
        </div>
        {loading ? (
          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-500">Memuat data…</p>
        ) : null}
      </article>
    </div>
  );
}
