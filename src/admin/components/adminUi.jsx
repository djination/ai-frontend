export function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-600">{hint}</p> : null}
    </div>
  );
}

export function InputField({ label, ...props }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        {...props}
      />
    </label>
  );
}

export function DiscoverySummary({ report }) {
  if (!report) return null;

  const created = Array.isArray(report.created) ? report.created : [];
  const skipped = Array.isArray(report.skipped) ? report.skipped : [];
  const failed = Array.isArray(report.failed) ? report.failed : [];

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50/90 to-white p-4">
      <div>
        <p className="text-sm font-semibold text-emerald-900">Ringkasan hasil</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          <li>
            <span className="font-medium text-emerald-800">{created.length}</span> konten baru
            disimpan
          </li>
          <li>
            <span className="font-medium text-amber-800">{skipped.length}</span> dilewati (misalnya
            sudah pernah diimpor)
          </li>
          <li>
            <span className="font-medium text-rose-800">{failed.length}</span> gagal diambil
          </li>
        </ul>
      </div>

      {created.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Konten baru
          </p>
          <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm text-slate-800">
            {created.slice(0, 12).map((item, idx) => (
              <li key={`${item.source_url}-${idx}`} className="rounded-lg bg-white/80 px-3 py-2">
                <span className="font-medium">{item.title || 'Tanpa judul'}</span>
                {item.source_url ? (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate text-xs text-brand-700 hover:underline"
                  >
                    {item.source_url}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          {created.length > 12 ? (
            <p className="mt-2 text-xs text-slate-500">Menampilkan 12 pertama dari {created.length}.</p>
          ) : null}
        </div>
      ) : null}

      <details className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-700">
        <summary className="cursor-pointer font-medium text-slate-800 select-none">
          Detail teknis (untuk tim IT)
        </summary>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed">
          {JSON.stringify(report, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export function QueueColumn({ title, items, tone, children }) {
  const toneClasses = {
    slate: 'border-slate-200 bg-slate-50',
    amber: 'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  };

  return (
    <div className={`rounded-xl border p-3 ${toneClasses[tone]}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-slate-600">Belum ada modul di tahap ini.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-medium text-slate-900">{item.raw_content_title}</p>
              <p className="text-xs text-slate-500">
                Level: {translateDifficulty(item.difficulty)}
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
              <div className="mt-2">{children(item)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function translateDifficulty(value) {
  const map = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' };
  return map[value] ?? value;
}

export function QueueActions({ item, note, onNoteChange, onApprove, onReject, mode }) {
  return (
    <div className="space-y-2">
      <textarea
        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        rows={2}
        value={note}
        onChange={(event) => onNoteChange(item.id, event.target.value)}
        placeholder="Catatan internal (opsional)"
      />
      <div className="flex flex-wrap gap-2">
        {mode !== 'published' ? (
          <button
            type="button"
            onClick={() => onApprove(item, 'approve')}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Setujui & lanjut
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onReject(item, 'reject')}
            className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            Batalkan tayang
          </button>
        )}
        <button
          type="button"
          onClick={() => onReject(item, 'reject')}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100"
        >
          Tolak
        </button>
      </div>
    </div>
  );
}
