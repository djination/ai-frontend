import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StatusMessage } from '../components/StatusMessage';
import { getAccessToken, isAccessTokenExpired } from '../services/authSession';
import {
  ContentEngineError,
  deleteChatSession,
  fetchChatHistory,
  fetchChatSessions,
  fetchLearnerLimits,
  patchChatSession,
  sendChatMessage,
} from '../services/contentEngineApi';

const MODES = [
  { value: 'general', label: 'General' },
  { value: 'correction', label: 'Correction' },
  { value: 'hint', label: 'Hint' },
  { value: 'exercise', label: 'Exercise' },
];


function quotaRatio(bucket) {
  if (!bucket || bucket.limit == null) return null;
  const limit = Number(bucket.limit);
  const remaining = Number(bucket.remaining ?? 0);
  if (!Number.isFinite(limit) || limit <= 0) return null;
  return remaining / limit;
}

function quotaSeverity(bucket) {
  const ratio = quotaRatio(bucket);
  if (ratio == null) return null;
  if (ratio <= 0.05) return 'critical';
  if (ratio <= 0.1) return 'warn';
  if (ratio <= 0.2) return 'info';
  return null;
}

function formatSessionTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 1) return 'Baru saja';
  if (diffM < 60) return `${diffM} mnt lalu`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH} jam lalu`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function readStoredLearningContext() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.CHAT_LEARNING_CONTEXT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.moduleContext ? parsed : null;
  } catch {
    return null;
  }
}

export function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [learningContext, setLearningContext] = useState(() => readStoredLearningContext());

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('general');
  const [sessionKey, setSessionKey] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.CHAT_SESSION) ?? '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitUpgradeHint, setLimitUpgradeHint] = useState(false);
  const [limits, setLimits] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  /** Sidebar list: `active` (default) vs `archived` (matches API `?status=`). */
  const [sessionListFilter, setSessionListFilter] = useState('active');
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [renameKey, setRenameKey] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [renameBusy, setRenameBusy] = useState(false);
  const [renameError, setRenameError] = useState('');
  const bottomRef = useRef(null);
  /** Skip one history fetch when session_key first appears from POST (state already has messages). */
  const skipNextHistoryLoadRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || isAccessTokenExpired()) return;
    let active = true;
    (async () => {
      try {
        const data = await fetchLearnerLimits();
        if (active) setLimits(data);
      } catch {
        if (active) setLimits(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const loadChatSessions = useCallback(async () => {
    const token = getAccessToken();
    if (!token || isAccessTokenExpired()) return;
    setSessionsLoading(true);
    try {
      const data = await fetchChatSessions({ status: sessionListFilter });
      setChatSessions(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setChatSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [sessionListFilter]);

  useEffect(() => {
    void loadChatSessions();
  }, [loadChatSessions]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || isAccessTokenExpired() || !sessionKey.trim()) return;
    if (skipNextHistoryLoadRef.current) {
      skipNextHistoryLoadRef.current = false;
      return;
    }
    let active = true;
    setHistoryLoading(true);
    (async () => {
      try {
        const data = await fetchChatHistory(sessionKey);
        const items = Array.isArray(data?.messages) ? data.messages : [];
        const normalized = items
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .map((m) => ({ role: m.role, content: m.content }));
        if (active) setMessages(normalized);
      } catch (err) {
        if (!active) return;
        if (err instanceof ContentEngineError && err.status === 410) {
          skipNextHistoryLoadRef.current = false;
          persistSession('');
          setMessages([]);
          void loadChatSessions();
        } else {
          setMessages([]);
        }
      } finally {
        if (active) setHistoryLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [sessionKey, loadChatSessions]);

  useEffect(() => {
    const fromNav = location.state?.chatLearningContext;
    if (!fromNav?.moduleContext) return;
    try {
      sessionStorage.setItem(STORAGE_KEYS.CHAT_LEARNING_CONTEXT, JSON.stringify(fromNav));
    } catch {
      /* ignore */
    }
    setLearningContext(fromNav);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  const persistSession = (key) => {
    const k = String(key ?? '').trim();
    setSessionKey(k);
    try {
      if (k) sessionStorage.setItem(STORAGE_KEYS.CHAT_SESSION, k);
      else sessionStorage.removeItem(STORAGE_KEYS.CHAT_SESSION);
    } catch {
      /* ignore */
    }
  };

  const selectChatSession = (key) => {
    const k = String(key ?? '').trim();
    if (!k || k === sessionKey) return;
    setRenameKey(null);
    setRenameDraft('');
    setRenameError('');
    skipNextHistoryLoadRef.current = false;
    persistSession(k);
  };

  const beginRename = (row) => {
    setRenameError('');
    setRenameKey(row.session_key);
    const t = (row.title && String(row.title).trim()) || '';
    setRenameDraft(t || (row.preview && String(row.preview).trim()) || '');
  };

  const cancelRename = () => {
    setRenameKey(null);
    setRenameDraft('');
    setRenameError('');
  };

  const handleNewChat = () => {
    skipNextHistoryLoadRef.current = false;
    persistSession('');
    setMessages([]);
    setHistoryLoading(false);
    setError('');
    setLimitUpgradeHint(false);
    cancelRename();
  };

  const saveRename = async () => {
    if (!renameKey) return;
    setRenameBusy(true);
    setRenameError('');
    try {
      await patchChatSession(renameKey, { title: renameDraft.trim() });
      await loadChatSessions();
      cancelRename();
    } catch (e) {
      setRenameError(e instanceof Error ? e.message : 'Gagal menyimpan judul');
    } finally {
      setRenameBusy(false);
    }
  };

  const handleDeleteConversation = async (key) => {
    const k = String(key ?? '').trim();
    if (!k) return;
    if (!window.confirm('Hapus percakapan ini dari riwayat?')) return;
    setError('');
    try {
      await deleteChatSession(k);
      if (k === sessionKey) {
        handleNewChat();
      }
      if (renameKey === k) cancelRename();
      await loadChatSessions();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus percakapan');
    }
  };

  const handleToggleArchive = async (key, archive) => {
    const k = String(key ?? '').trim();
    if (!k) return;
    setError('');
    try {
      await patchChatSession(k, { is_archived: Boolean(archive) });
      if (k === sessionKey && archive) {
        setSessionListFilter('archived');
      }
      if (k === sessionKey && !archive) {
        setSessionListFilter('active');
      }
      await loadChatSessions();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memperbarui arsip');
    }
  };

  const sendCurrentInput = async () => {
    const text = input.trim();
    if (!text || loading || historyLoading) return;

    setError('');
    setLimitUpgradeHint(false);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const prevSessionKey = sessionKey;
      const data = await sendChatMessage({
        message: text,
        sessionKey: sessionKey || undefined,
        mode,
        level: learningContext?.level,
        moduleContext: learningContext?.moduleContext,
      });
      const nextKey = data.session_key ?? sessionKey;
      if (!prevSessionKey.trim() && String(nextKey).trim()) {
        skipNextHistoryLoadRef.current = true;
      }
      persistSession(nextKey);
      const meta = [];
      if (data.route) meta.push(`route: ${data.route}`);
      if (data.intent && data.intent !== data.route) meta.push(`intent: ${data.intent}`);
      if (data.ambiguous) meta.push('ambiguous');
      if (data.needs_human_handoff) meta.push('handoff suggested');
      const prefix = meta.length ? `[${meta.join(' · ')}]\n\n` : '';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `${prefix}${data.reply ?? ''}` },
      ]);
      try {
        const latest = await fetchLearnerLimits();
        setLimits(latest);
      } catch {
        /* ignore quota refresh failure */
      }
      void loadChatSessions();
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
      if (err instanceof ContentEngineError && err.status === 410) {
        skipNextHistoryLoadRef.current = false;
        persistSession('');
        setLimitUpgradeHint(false);
        void loadChatSessions();
        const msg =
          err.body && typeof err.body === 'object' && typeof err.body.error === 'string'
            ? err.body.error
            : 'Percakapan ini sudah dihapus. Mulai chat baru.';
        setError(msg);
      } else {
        const isLimit =
          err instanceof ContentEngineError &&
          err.status === 429 &&
          err.body &&
          typeof err.body === 'object' &&
          err.body.upgrade_available === true;
        setLimitUpgradeHint(Boolean(isLimit));
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    void sendCurrentInput();
  };

  const handleInputKeyDown = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    void sendCurrentInput();
  };

  const clearLessonContext = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CHAT_LEARNING_CONTEXT);
    } catch {
      /* ignore */
    }
    setLearningContext(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <aside className="flex max-h-[min(90vh,52rem)] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 lg:w-72 lg:max-w-[18rem]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Riwayat chat</h3>
            <button
              type="button"
              onClick={handleNewChat}
              disabled={historyLoading}
              className="shrink-0 rounded-lg bg-brand-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Baru
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-slate-500 dark:text-slate-500">
            Arsip memindahkan percakapan ke tab Arsip (seperti ChatGPT). Judul, arsip, dan hapus lewat tombol di tiap
            baris.
          </p>
          <div
            className="mt-2 flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-600"
            role="tablist"
            aria-label="Filter percakapan"
          >
            <button
              type="button"
              role="tab"
              aria-selected={sessionListFilter === 'active'}
              onClick={() => setSessionListFilter('active')}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                sessionListFilter === 'active'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sessionListFilter === 'archived'}
              onClick={() => setSessionListFilter('archived')}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                sessionListFilter === 'archived'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Arsip
            </button>
          </div>
          <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
            {sessionsLoading ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Memuat daftar…</p>
            ) : chatSessions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sessionListFilter === 'archived'
                  ? 'Belum ada percakapan di arsip.'
                  : 'Belum ada percakapan aktif.'}
              </p>
            ) : (
              chatSessions.map((row) => {
                const active = row.session_key === sessionKey;
                const displayTitle =
                  (row.title && String(row.title).trim()) ||
                  (row.preview && String(row.preview).trim()) ||
                  'Percakapan';
                return (
                  <div
                    key={row.session_key}
                    className={`flex gap-1 rounded-xl border p-1 transition ${
                      active
                        ? 'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/40'
                        : 'border-transparent bg-slate-50 dark:bg-slate-800/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectChatSession(row.session_key)}
                      className="min-w-0 flex-1 rounded-lg px-2 py-2 text-left text-xs text-slate-800 hover:bg-white/80 dark:text-slate-100 dark:hover:bg-slate-800/80"
                    >
                      <span className="line-clamp-2 font-medium leading-snug">{displayTitle}</span>
                      <span className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-500">
                        <span>{formatSessionTime(row.updated_at)}</span>
                        {typeof row.message_count === 'number' ? (
                          <span>{row.message_count} pesan</span>
                        ) : null}
                      </span>
                    </button>
                    <div className="flex shrink-0 flex-col justify-center gap-0.5 pr-0.5">
                      <button
                        type="button"
                        title="Ubah judul"
                        aria-label="Ubah judul percakapan"
                        onClick={(e) => {
                          e.stopPropagation();
                          beginRename(row);
                        }}
                        disabled={historyLoading || renameBusy}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-brand-800 hover:bg-brand-100 disabled:opacity-40 dark:text-brand-300 dark:hover:bg-brand-950/60"
                      >
                        Judul
                      </button>
                      <button
                        type="button"
                        title={sessionListFilter === 'archived' ? 'Kembalikan ke aktif' : 'Arsipkan percakapan'}
                        aria-label={
                          sessionListFilter === 'archived' ? 'Kembalikan dari arsip' : 'Arsipkan percakapan'
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleToggleArchive(row.session_key, sessionListFilter === 'active');
                        }}
                        disabled={historyLoading || renameBusy}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700/80"
                      >
                        {sessionListFilter === 'archived' ? 'Buka' : 'Arsip'}
                      </button>
                      <button
                        type="button"
                        title="Hapus percakapan"
                        aria-label="Hapus percakapan"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteConversation(row.session_key);
                        }}
                        disabled={historyLoading || renameBusy}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40 dark:text-rose-400 dark:hover:bg-rose-950/50"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {renameKey ? (
            <div className="mt-3 shrink-0 border-t border-slate-100 pt-3 dark:border-slate-700">
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Judul percakapan</p>
              <input
                type="text"
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                maxLength={200}
                disabled={renameBusy}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Contoh: Latihan past tense"
              />
              {renameError ? <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{renameError}</p> : null}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => void saveRename()}
                  disabled={renameBusy}
                  className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
                >
                  {renameBusy ? 'Menyimpan…' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={cancelRename}
                  disabled={renameBusy}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : null}
        </aside>

        <article className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AI tutor & support</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Ask English learning questions or platform questions (billing, account). Replies route to a tutor or
              support-style assistant.
            </p>
            {limits?.chat ? (
              <p
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                  quotaSeverity(limits.chat) === 'critical'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
                    : quotaSeverity(limits.chat) === 'warn'
                      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200'
                      : quotaSeverity(limits.chat) === 'info'
                        ? 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Sisa chat: {limits.chat.remaining}
                {limits.chat.limit == null ? ' / unlimited' : ` / ${limits.chat.limit}`}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400" htmlFor="chat-mode">
              Tutor mode
            </label>
            <select
              id="chat-mode"
              value={mode}
              onChange={(ev) => setMode(ev.target.value)}
              disabled={historyLoading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? <StatusMessage type="error" message={error} /> : null}
        {limitUpgradeHint ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-medium">Batas chat harian untuk paket Free tercapai.</p>
            <p className="mt-1 text-amber-900 dark:text-amber-200">
              Upgrade ke <span className="font-semibold">Pro</span> untuk kuota lebih besar (sesuai pengaturan
              server).
            </p>
            <Link
              to="/app/plans"
              className="mt-2 inline-block text-sm font-semibold text-brand-800 underline hover:text-brand-900 dark:text-brand-300 dark:hover:text-brand-200"
            >
              Pilih paket &amp; upgrade
            </Link>
          </div>
        ) : null}

        {learningContext ? (
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold">Lesson context:</span>{' '}
              {learningContext.moduleTitle}
              {learningContext.level ? (
                <span className="text-emerald-800 dark:text-emerald-300"> · level: {learningContext.level}</span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={clearLessonContext}
              className="shrink-0 rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-slate-800 dark:text-emerald-200 dark:hover:bg-slate-700"
            >
              Clear lesson context
            </button>
          </div>
        ) : (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
            Tip: dari Learning page, gunakan &quot;Chat with tutor (this lesson)&quot; untuk mengirim ringkasan materi +
            quiz ke tutor.
          </p>
        )}

        <div className="mt-4 max-h-[28rem] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          {historyLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Memuat riwayat chat…</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {sessionKey.trim()
                ? 'Belum ada pesan di sesi ini, atau masih memuat.'
                : 'Pilih percakapan di kiri atau mulai chat baru, lalu kirim pesan di bawah.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {messages.map((m, idx) => (
                <li
                  key={`${idx}-${m.role}`}
                  className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-8 bg-brand-700 text-white'
                      : 'mr-8 border border-slate-200 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-80">
                    {m.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="mt-1 block whitespace-pre-wrap">{m.content}</span>
                </li>
              ))}
              {loading ? (
                <li className="mr-8 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
                  Thinking…
                </li>
              ) : null}
              <li ref={bottomRef} />
            </ul>
          )}
        </div>

        <form onSubmit={handleSend} className="mt-4 flex flex-col gap-2 md:flex-row md:items-end">
          <label className="sr-only" htmlFor="chat-input">
            Message
          </label>
          <textarea
            id="chat-input"
            rows={3}
            value={input}
            onChange={(ev) => setInput(ev.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={historyLoading}
            placeholder="e.g. Explain present perfect vs past simple…"
            className="min-h-[5rem] flex-1 resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-900"
          />
          <button
            type="submit"
            disabled={loading || historyLoading || !input.trim()}
            className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
        </article>
      </div>
    </section>
  );
}
