import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { StatusMessage } from '../components/StatusMessage';
import { useAsyncAction } from '../hooks/useAsyncAction';
import {
  fetchProcessedModules,
  fetchRawContents,
  ingestRawContent,
  setModulePublishStatus,
} from '../services/contentEngineApi';
import {
  getLearningPathLabel,
  LEARNING_PATH_OPTIONS,
} from '../constants/learningPaths';

const initialForm = {
  title: '',
  source_url: '',
  raw_text: '',
  category: LEARNING_PATH_OPTIONS[0].value,
};

export function AdminPage() {
  const [formData, setFormData] = useState(initialForm);
  const [rawContents, setRawContents] = useState([]);
  const [modules, setModules] = useState([]);
  const [feedback, setFeedback] = useState('');

  const { loading, error, run } = useAsyncAction();

  const stats = useMemo(
    () => ({
      rawCount: rawContents.length,
      moduleCount: modules.length,
      publishedCount: modules.filter((item) => item.is_published).length,
    }),
    [rawContents, modules],
  );

  const loadAdminData = useCallback(async () => {
    const result = await run(async () => {
      const [rawData, moduleData] = await Promise.all([
        fetchRawContents(),
        fetchProcessedModules(),
      ]);
      return { rawData, moduleData };
    });

    if (result) {
      setRawContents(result.rawData);
      setModules(result.moduleData);
    }
  }, [run]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    const result = await run(async () => ingestRawContent(formData));
    if (!result) {
      return;
    }

    setFeedback('Materi berhasil di-ingest.');
    setFormData(initialForm);
    await loadAdminData();
  };

  const handlePublishToggle = async (moduleId, currentStatus) => {
    setFeedback('');
    const result = await run(async () =>
      setModulePublishStatus(moduleId, !currentStatus),
    );
    if (!result) {
      return;
    }

    setFeedback('Status publish modul berhasil diperbarui.');
    await loadAdminData();
  };

  return (
    <section className="space-y-4">
      <ProgressDashboard />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Raw Content" value={stats.rawCount} />
        <StatCard label="Processed Modules" value={stats.moduleCount} />
        <StatCard label="Published Modules" value={stats.publishedCount} />
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Ingest English Content</h2>
        <p className="mt-1 text-sm text-slate-600">
          Form ini mengirim data ke endpoint backend `ingest`.
        </p>
        <form className="mt-4 grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
          <InputField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Source URL"
            name="source_url"
            type="url"
            value={formData.source_url}
            onChange={handleInputChange}
            required
          />
          <label className="text-sm font-medium text-slate-700">
            Category (Learning Path)
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
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
          <label className="text-sm font-medium text-slate-700">
            Raw Text
            <textarea
              className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              name="raw_text"
              value={formData.raw_text}
              onChange={handleInputChange}
              required
            />
          </label>
          <button
            type="submit"
            className="w-fit rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Ingest Materi'}
          </button>
        </form>
      </article>

      <StatusMessage type="success" message={feedback} />
      <StatusMessage type="error" message={error} />

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Processed Modules</h3>
        <div className="mt-3 space-y-2">
          {modules.length === 0 ? (
            <p className="text-sm text-slate-600">Belum ada processed module.</p>
          ) : (
            modules.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.raw_content_title}</p>
                  <p className="text-xs text-slate-500">Difficulty: {item.difficulty}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePublishToggle(item.id, item.is_published)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    item.is_published
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.is_published ? 'Published' : 'Draft'}
                </button>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Raw Content Feed</h3>
        <p className="mt-1 text-sm text-slate-600">
          Daftar materi mentah yang sudah masuk ke backend.
        </p>
        <div className="mt-3 space-y-2">
          {rawContents.length === 0 ? (
            <p className="text-sm text-slate-600">Belum ada raw content.</p>
          ) : (
            rawContents.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-slate-600">
                  Learning Path: {getLearningPathLabel(item.category)}
                </p>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-brand-700 hover:underline"
                >
                  {item.source_url}
                </a>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        {...props}
      />
    </label>
  );
}
