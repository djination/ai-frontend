import { Link, useParams } from 'react-router-dom';
import { getCourseLevel } from '../constants/courseLevels';

export function LessonDetailPage() {
  const { moduleId = 'beginner' } = useParams();
  const detail = getCourseLevel(moduleId);

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Course Detail
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          {detail.label} Track
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Outcome target untuk level ini:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {detail.outcomes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link
          to="/app/learn"
          className="mt-4 inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Kembali ke Learning Page
        </Link>
      </article>
    </section>
  );
}
