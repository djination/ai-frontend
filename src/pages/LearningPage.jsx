import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LearningSkeleton } from '../components/LearningSkeleton';
import { COURSE_LEVELS, getCourseLevel } from '../constants/courseLevels';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StatusMessage } from '../components/StatusMessage';
import { fetchCurrentModule } from '../services/contentEngineApi';

export function LearningPage() {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLevel, setActiveLevel] = useState(COURSE_LEVELS[0].key);
  const [progressMap, setProgressMap] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LEARNING_PROGRESS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const loadModule = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCurrentModule();
        setModule(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat materi');
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, []);

  if (loading) {
    return <LearningSkeleton />;
  }

  if (error) {
    return <StatusMessage type="error" message={error} />;
  }

  const selectedLevel = getCourseLevel(activeLevel);
  const completedForActiveLevel = progressMap[activeLevel] ?? false;
  const completedCount = Object.values(progressMap).filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / COURSE_LEVELS.length) * 100);

  const toggleCompletion = () => {
    const next = {
      ...progressMap,
      [activeLevel]: !completedForActiveLevel,
    };
    setProgressMap(next);
    localStorage.setItem(STORAGE_KEYS.LEARNING_PROGRESS, JSON.stringify(next));
  };

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Learning Path</h2>
        <p className="mt-1 text-sm text-slate-600">
          Pilih level belajar untuk menyesuaikan fokus materi.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {COURSE_LEVELS.map((level) => (
            <Link
              key={level.key}
              to={`/app/learn/${level.key}`}
              onClick={() => setActiveLevel(level.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                activeLevel === level.key
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-brand-300'
              }`}
            >
              {level.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-800">
            Fokus {selectedLevel.label}
          </p>
          <p className="mt-1 text-sm text-brand-700">{selectedLevel.focus}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleCompletion}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                completedForActiveLevel
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-brand-700'
              }`}
            >
              {completedForActiveLevel ? 'Sudah Selesai' : 'Tandai Selesai'}
            </button>
            <p className="text-xs text-brand-800">
              Progress: {completedCount}/{COURSE_LEVELS.length} level ({completionPercentage}
              %)
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-semibold text-slate-900">{module?.title}</h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-700">
          {module?.lessonContent}
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Quick Quiz</h3>
        {(module?.quiz ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Belum ada quiz untuk modul ini.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {module.quiz.map((item, index) => (
              <div key={`${item.question}-${index}`} className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{item.question}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {item.options.map((option, optionIndex) => (
                    <li
                      key={`${option}-${optionIndex}`}
                      className={
                        optionIndex === item.correctOptionIndex
                          ? 'font-semibold text-emerald-700'
                          : ''
                      }
                    >
                      {option}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-500">{item.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
