import { COURSE_LEVELS } from '../constants/courseLevels';
import { STORAGE_KEYS } from '../constants/storageKeys';

function getProgressMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNING_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function ProgressDashboard() {
  const progressMap = getProgressMap();
  const completedCount = COURSE_LEVELS.filter((item) => progressMap[item.key]).length;
  const percentage = Math.round((completedCount / COURSE_LEVELS.length) * 100);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Progress Dashboard</h3>
      <p className="mt-1 text-sm text-slate-600">
        Ringkasan penyelesaian learning path Bahasa Inggris.
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-700 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-sm font-medium text-slate-700">
        {completedCount}/{COURSE_LEVELS.length} level selesai ({percentage}%)
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {COURSE_LEVELS.map((level) => (
          <div
            key={level.key}
            className={`rounded-lg border p-3 text-sm ${
              progressMap[level.key]
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <p className="font-semibold">{level.label}</p>
            <p className="text-xs">{progressMap[level.key] ? 'Completed' : 'In progress'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
