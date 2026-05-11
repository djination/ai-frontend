import { Link, useParams } from 'react-router-dom';
import { getCourseLevel } from '../constants/courseLevels';
import { buildLevelPathChatPayload } from '../utils/chatLearningContext';

export function LessonDetailPage() {
  const { moduleId = 'beginner' } = useParams();
  const detail = getCourseLevel(moduleId);
  const chatPayload = buildLevelPathChatPayload(moduleId);

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
          Course Detail
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {detail.label} Track
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Outcome target untuk level ini:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          {detail.outcomes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/app/learn"
            className="inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Kembali ke Learning Page
          </Link>
          <Link
            to="/app/chat"
            state={{ chatLearningContext: chatPayload }}
            className="inline-block rounded-lg border border-brand-600 bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50 dark:border-brand-500 dark:bg-slate-800 dark:text-brand-200 dark:hover:bg-slate-700"
          >
            Open AI chat (this level)
          </Link>
        </div>
      </article>
    </section>
  );
}
