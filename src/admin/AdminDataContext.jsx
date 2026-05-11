import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import {
  createDraftModuleFromRaw,
  discoverIngest,
  fetchProcessedModules,
  fetchRawContentDetail,
  fetchRawContents,
  ingestRawContent,
  patchRawContent,
  setModulePublishStatus,
} from '../services/contentEngineApi';
import { LEARNING_PATH_OPTIONS } from '../constants/learningPaths';

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Pemula' },
  { value: 'intermediate', label: 'Menengah' },
  { value: 'advanced', label: 'Lanjutan' },
];

const initialForm = {
  title: '',
  source_url: '',
  raw_text: '',
  category: LEARNING_PATH_OPTIONS[0].value,
  difficulty: DIFFICULTY_OPTIONS[0].value,
};

const AdminDataContext = createContext(null);

export function AdminDataProvider({ children }) {
  const [formData, setFormData] = useState(initialForm);
  const [rawContents, setRawContents] = useState([]);
  const [modules, setModules] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [reviewNotesMap, setReviewNotesMap] = useState({});
  const [editingRawId, setEditingRawId] = useState(null);
  const [editRawForm, setEditRawForm] = useState({
    title: '',
    source_url: '',
    category: LEARNING_PATH_OPTIONS[0].value,
    raw_text: '',
  });
  const [promoteDifficultyByRaw, setPromoteDifficultyByRaw] = useState({});
  const [filterDraft, setFilterDraft] = useState({
    category: '',
    language_code: '',
    is_published: '',
    suggested_difficulty: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    category: '',
    language_code: '',
    is_published: '',
    suggested_difficulty: '',
  });
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [discoverCategory, setDiscoverCategory] = useState(LEARNING_PATH_OPTIONS[0].value);
  const [discoverDifficulty, setDiscoverDifficulty] = useState(DIFFICULTY_OPTIONS[0].value);
  const [discoverMax, setDiscoverMax] = useState(10);
  const [discoverLang, setDiscoverLang] = useState('en');
  const [discoverBackend, setDiscoverBackend] = useState('duckduckgo');
  const [discoverSkipEnrichment, setDiscoverSkipEnrichment] = useState(true);
  const [discoverReport, setDiscoverReport] = useState(null);

  const { loading, error, run } = useAsyncAction();

  const stats = useMemo(
    () => ({
      rawCount: rawContents.length,
      moduleCount: modules.length,
      publishedCount: modules.filter((item) => item.is_published).length,
    }),
    [rawContents, modules],
  );

  const queueBuckets = useMemo(() => {
    const buckets = {
      draft: [],
      reviewed: [],
      published: [],
    };

    modules.forEach((item) => {
      if (item.is_published) {
        buckets.published.push(item);
        return;
      }

      if (item.review_status === 'reviewed' || item.is_reviewed === true) {
        buckets.reviewed.push(item);
        return;
      }

      buckets.draft.push(item);
    });

    return buckets;
  }, [modules]);

  const loadAdminData = useCallback(async () => {
    const rawFilters = {};
    const modFilters = {};
    const cat = appliedFilters.category.trim();
    if (cat) {
      rawFilters.category = cat;
    }
    const lc = appliedFilters.language_code.trim();
    if (lc) {
      rawFilters.language_code = lc;
      modFilters.language_code = lc;
    }
    if (appliedFilters.is_published === 'true' || appliedFilters.is_published === 'false') {
      modFilters.is_published = appliedFilters.is_published === 'true';
    }
    const sd = (appliedFilters.suggested_difficulty || '').trim().toLowerCase();
    if (sd === 'beginner' || sd === 'intermediate' || sd === 'advanced') {
      rawFilters.suggested_difficulty = sd;
    }

    const result = await run(async () => {
      const [rawData, moduleData] = await Promise.all([
        fetchRawContents(rawFilters),
        fetchProcessedModules(modFilters),
      ]);
      return { rawData, moduleData };
    });

    if (result) {
      setRawContents(result.rawData);
      setModules(result.moduleData);
      setReviewNotesMap(
        result.moduleData.reduce((acc, item) => {
          acc[item.id] = item.review_notes ?? '';
          return acc;
        }, {}),
      );
    }
  }, [run, appliedFilters]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmitIngest = async (event) => {
    event.preventDefault();
    setFeedback('');
    const title = formData.title.trim();
    const lesson = formData.raw_text.trim();
    const payload = {
      title,
      source_url: formData.source_url.trim(),
      raw_text: lesson,
      category: formData.category,
      processed_module: {
        module_json: {
          title,
          lessonContent: lesson,
          quiz: [],
        },
        difficulty: formData.difficulty,
        is_published: false,
      },
    };
    const result = await run(async () => ingestRawContent(payload));
    if (!result) {
      return;
    }

    setFeedback('Materi berhasil ditambahkan dan masuk antrian sebagai draf.');
    setFormData(initialForm);
    await loadAdminData();
  };

  const handleReviewAction = async (module, action) => {
    setFeedback('');
    const note = reviewNotesMap[module.id] ?? '';
    const nextPublished = action === 'approve' ? true : false;
    const result = await run(async () =>
      setModulePublishStatus(module.id, nextPublished, {
        review_action: action,
        review_notes: note,
      }),
    );
    if (!result) {
      return;
    }
    const labels = {
      approve: 'disetujui',
      reject: 'ditolak',
    };
    setFeedback(`Perubahan berhasil disimpan (${labels[action] ?? action}).`);
    await loadAdminData();
  };

  const handleReviewNotesChange = (moduleId, value) => {
    setReviewNotesMap((previous) => ({
      ...previous,
      [moduleId]: value,
    }));
  };

  const openEditRaw = async (item) => {
    setFeedback('');
    const detail = await run(async () => fetchRawContentDetail(item.id));
    if (!detail) return;
    setEditingRawId(item.id);
    setEditRawForm({
      title: detail.title ?? '',
      source_url: detail.source_url ?? '',
      category: detail.category ?? LEARNING_PATH_OPTIONS[0].value,
      raw_text: detail.raw_text ?? '',
    });
  };

  const cancelEditRaw = () => {
    setEditingRawId(null);
    setFeedback('');
  };

  const saveEditRaw = async () => {
    if (editingRawId == null) return;
    setFeedback('');
    const result = await run(async () =>
      patchRawContent(editingRawId, {
        title: editRawForm.title.trim(),
        source_url: editRawForm.source_url.trim(),
        category: editRawForm.category,
        raw_text: editRawForm.raw_text,
      }),
    );
    if (!result) return;
    setFeedback('Konten mentah berhasil diperbarui.');
    setEditingRawId(null);
    await loadAdminData();
  };

  const promoteRawToDraft = async (rawId) => {
    setFeedback('');
    const difficulty = promoteDifficultyByRaw[rawId] ?? 'beginner';
    const result = await run(async () =>
      createDraftModuleFromRaw(rawId, { difficulty }),
    );
    if (!result) return;
    setFeedback(`Modul draf baru dibuat. Cek halaman Antrian publikasi.`);
    await loadAdminData();
  };

  const handleDiscoverSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setDiscoverReport(null);
    const q = discoverQuery.trim();
    if (q.length < 3) {
      setFeedback('Kata kunci minimal 3 huruf.');
      return;
    }
    const result = await run(async () =>
      discoverIngest({
        query: q,
        category: discoverCategory.trim(),
        suggested_difficulty: discoverDifficulty,
        max_results: Math.min(15, Math.max(1, Number(discoverMax) || 10)),
        language_code: discoverLang.trim() || 'en',
        search_backend: discoverBackend,
        skip_enrichment: discoverSkipEnrichment,
      }),
    );
    if (!result) return;
    setDiscoverReport(result);
    const n = Array.isArray(result.created) ? result.created.length : 0;
    setFeedback(
      n > 0
        ? `Berhasil menambahkan ${n} konten baru ke daftar konten mentah.`
        : 'Pencarian selesai; tidak ada konten baru (lihat ringkasan di bawah).',
    );
    if (n > 0) {
      setFilterDraft((prev) => ({ ...prev, suggested_difficulty: discoverDifficulty }));
      setAppliedFilters((prev) => ({ ...prev, suggested_difficulty: discoverDifficulty }));
    }
    await loadAdminData();
  };

  const value = {
    loading,
    error,
    feedback,
    setFeedback,
    stats,
    queueBuckets,
    rawContents,
    modules,
    loadAdminData,
    DIFFICULTY_OPTIONS,
    LEARNING_PATH_OPTIONS,
    formData,
    handleInputChange,
    handleSubmitIngest,
    handleReviewAction,
    handleReviewNotesChange,
    reviewNotesMap,
    editingRawId,
    editRawForm,
    setEditRawForm,
    openEditRaw,
    cancelEditRaw,
    saveEditRaw,
    promoteRawToDraft,
    promoteDifficultyByRaw,
    setPromoteDifficultyByRaw,
    filterDraft,
    setFilterDraft,
    appliedFilters,
    setAppliedFilters,
    discoverQuery,
    setDiscoverQuery,
    discoverCategory,
    setDiscoverCategory,
    discoverDifficulty,
    setDiscoverDifficulty,
    discoverMax,
    setDiscoverMax,
    discoverLang,
    setDiscoverLang,
    discoverBackend,
    setDiscoverBackend,
    discoverSkipEnrichment,
    setDiscoverSkipEnrichment,
    discoverReport,
    handleDiscoverSubmit,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error('useAdminData harus dipakai di dalam AdminDataProvider');
  }
  return ctx;
}
