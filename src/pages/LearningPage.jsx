import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LearningSkeleton } from '../components/LearningSkeleton';
import {
  COURSE_LEVELS,
  getCourseLevel,
  normalizeDifficulty,
  resolvePublishedModulePick,
} from '../constants/courseLevels';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StatusMessage } from '../components/StatusMessage';
import {
  fetchCurrentModule,
  fetchPublishedModule,
  fetchPublishedModules,
  getLearnerContentLanguage,
  setLearnerContentLanguage,
} from '../services/contentEngineApi';
import { buildChatLearningPayload } from '../utils/chatLearningContext';

export function LearningPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [module, setModule] = useState(null);
  const [publishedModules, setPublishedModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [moduleLoading, setModuleLoading] = useState(false);
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
  /** Bump so language `<select>` reflects `localStorage` after override changes. */
  const [languageRevision, setLanguageRevision] = useState(0);

  const prevModuleUrlRef = useRef(undefined);

  const loadInitial = async () => {
    setLoading(true);
    setError('');
    try {
      const publishedModulesResponse = await fetchPublishedModules();
      const items = Array.isArray(publishedModulesResponse?.items)
        ? publishedModulesResponse.items
        : [];
      setPublishedModules(items);

      const wanted = searchParams.get('module');
      const { pick, levelKey } = resolvePublishedModulePick(items, wanted, activeLevel);
      setActiveLevel(levelKey);
      setSelectedModuleId(pick);

      if (pick != null) {
        if (searchParams.get('module') !== String(pick)) {
          setSearchParams({ module: String(pick) }, { replace: true });
        }
        const mod = await fetchPublishedModule(pick);
        setModule(mod);
      } else {
        const cur = await fetchCurrentModule();
        setModule(cur);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat materi');
    } finally {
      setLoading(false);
    }
  };

  const selectPublishedModule = useCallback(
    async (moduleId) => {
      setSelectedModuleId(moduleId);
      setSearchParams({ module: String(moduleId) }, { replace: true });
      setModuleLoading(true);
      setError('');
      try {
        const mod = await fetchPublishedModule(moduleId);
        setModule(mod);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat modul');
      } finally {
        setModuleLoading(false);
      }
    },
    [setSearchParams],
  );

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only bootstrap
  }, []);

  /**
   * Align tab + lesson when `?module=` or course level changes.
   * When the URL `module` param changes (history navigation), snap `activeLevel` to that module's difficulty.
   */
  useEffect(() => {
    if (loading || publishedModules.length === 0) return;

    const wanted = searchParams.get('module');
    const prevWanted = prevModuleUrlRef.current;
    const moduleUrlChanged = prevWanted !== undefined && wanted !== prevWanted;
    prevModuleUrlRef.current = wanted ?? null;

    if (wanted && moduleUrlChanged) {
      const meta = publishedModules.find((m) => String(m.id) === wanted);
      if (meta) {
        const d = normalizeDifficulty(meta.difficulty);
        if (d !== activeLevel) {
          setActiveLevel(d);
          return;
        }
      }
    }

    const pool = publishedModules.filter(
      (m) => normalizeDifficulty(m.difficulty) === activeLevel,
    );

    if (pool.length === 0) {
      if (selectedModuleId !== null) setSelectedModuleId(null);
      setModule(null);
      if (searchParams.get('module')) {
        setSearchParams({}, { replace: true });
      }
      return;
    }

    const wantedInPool =
      wanted && pool.some((m) => String(m.id) === wanted) ? Number(wanted) : null;

    const selectedInPool =
      selectedModuleId != null && pool.some((m) => m.id === selectedModuleId);

    const targetId = wantedInPool ?? (selectedInPool ? selectedModuleId : pool[0].id);

    if (targetId === selectedModuleId && module?.id === targetId) {
      if (searchParams.get('module') !== String(targetId)) {
        setSearchParams({ module: String(targetId) }, { replace: true });
      }
      return;
    }

    let cancelled = false;
    (async () => {
      setModuleLoading(true);
      setError('');
      try {
        const mod = await fetchPublishedModule(targetId);
        if (!cancelled) {
          setModule(mod);
          setSelectedModuleId(targetId);
          setSearchParams({ module: String(targetId) }, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat modul');
        }
      } finally {
        if (!cancelled) setModuleLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    activeLevel,
    publishedModules,
    loading,
    searchParams,
    selectedModuleId,
    module?.id,
    module,
    setSearchParams,
  ]);

  const modulesForActiveLevel = useMemo(
    () =>
      publishedModules.filter(
        (m) => normalizeDifficulty(m.difficulty) === activeLevel,
      ),
    [publishedModules, activeLevel],
  );

  const languageSelectValue = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LEARNER_CONTENT_LANGUAGE);
      if (raw != null && raw.trim() !== '') {
        return raw.trim().toLowerCase();
      }
    } catch {
      /* ignore */
    }
    return 'default';
  }, [languageRevision]);

  if (loading) {
    return <LearningSkeleton />;
  }

  if (error) {
    return (
      <section className="space-y-3">
        <StatusMessage type="error" message={error} />
        <button
          type="button"
          onClick={loadInitial}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-300"
        >
          Coba Muat Ulang
        </button>
      </section>
    );
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

  const effectiveLang = getLearnerContentLanguage();

  const handleContentLanguageChange = (event) => {
    const v = event.target.value;
    setLearnerContentLanguage(v === 'default' ? '' : v);
    setLanguageRevision((n) => n + 1);
    void loadInitial();
  };

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Learning Path</h2>
        <p className="mt-1 text-sm text-slate-600">
          Pilih level belajar untuk menyesuaikan fokus materi.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-slate-700" htmlFor="learner-content-lang">
            Bahasa materi (filter publish)
            <select
              id="learner-content-lang"
              value={languageSelectValue}
              onChange={handleContentLanguageChange}
              className="mt-1 block min-w-[11rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            >
              <option value="default">
                Default
                {languageSelectValue === 'default' && effectiveLang ? ` (${effectiveLang})` : ''}
              </option>
              <option value="en">English (en)</option>
              <option value="id">Indonesia (id)</option>
            </select>
          </label>
          <p className="max-w-md text-xs text-slate-500">
            Mengatur query <code className="text-[11px]">?language=</code> ke API modul. Default memakai preference
            browser jika ada, lalu variabel{' '}
            <code className="text-[11px]">VITE_LEARNER_LANGUAGE</code> saat build.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {COURSE_LEVELS.map((level) => (
            <div key={level.key} className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveLevel(level.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  activeLevel === level.key
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-300'
                }`}
              >
                {level.label}
              </button>
              <Link
                to={`/app/learn/${level.key}`}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Detail
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-800">
            Fokus {selectedLevel.label}
          </p>
          <p className="mt-1 text-xs text-brand-700">
            CEFR: {selectedLevel.cefr} • Estimasi: {selectedLevel.estimatedHours} jam
          </p>
          <p className="mt-1 text-xs text-brand-700">
            Bahasa tersedia saat ini: {selectedLevel.supportedLanguages.join(', ')}
          </p>
          <p className="mt-1 text-sm text-brand-700">{selectedLevel.focus}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-brand-700">
            {selectedLevel.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
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

      <article
        className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 ${
          moduleLoading ? 'opacity-70' : ''
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{module?.title}</h2>
          <button
            type="button"
            disabled={moduleLoading}
            onClick={() =>
              navigate('/app/chat', {
                state: { chatLearningContext: buildChatLearningPayload(module, activeLevel) },
              })
            }
            className="shrink-0 rounded-lg border border-brand-600 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Chat with tutor (this lesson)
          </button>
        </div>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-700">
          {module?.lessonContent}
        </p>
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Modul untuk level ini: {modulesForActiveLevel.length}
            <span className="font-normal text-slate-600">
              {' '}
              · Total publish: {publishedModules.length}
            </span>
            {moduleLoading ? <span className="ml-2 font-normal text-slate-500">Memuat…</span> : null}
          </p>
          {publishedModules.length === 0 ? (
            <p className="mt-1 text-sm text-slate-600">
              Belum ada modul publish lain yang tersedia. Minta admin publish modul
              tambahan dari halaman admin.
            </p>
          ) : modulesForActiveLevel.length === 0 ? (
            <p className="mt-1 text-sm text-slate-600">
              Belum ada modul dengan tingkat <span className="font-semibold">{selectedLevel.label}</span>{' '}
              (difficulty). Pilih level lain atau minta admin menambah konten untuk level ini.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {modulesForActiveLevel.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectPublishedModule(item.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedModuleId === item.id
                        ? 'border-brand-600 bg-brand-50 font-semibold text-brand-900'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-brand-300'
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
