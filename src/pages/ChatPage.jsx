import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StatusMessage } from '../components/StatusMessage';
import { getAccessToken, isAccessTokenExpired } from '../services/authSession';
import { ContentEngineError, fetchLearnerLimits, sendChatMessage } from '../services/contentEngineApi';

const MODES = [
  { value: 'general', label: 'General' },
  { value: 'correction', label: 'Correction' },
  { value: 'hint', label: 'Hint' },
  { value: 'exercise', label: 'Exercise' },
];

const SESSION_STORAGE_KEY = 'content-engine-chat-session';

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
      return sessionStorage.getItem(SESSION_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitUpgradeHint, setLimitUpgradeHint] = useState(false);
  const [limits, setLimits] = useState(null);
  const bottomRef = useRef(null);

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
    setSessionKey(key);
    try {
      if (key) sessionStorage.setItem(SESSION_STORAGE_KEY, key);
    } catch {
      /* ignore */
    }
  };

  const sendCurrentInput = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError('');
    setLimitUpgradeHint(false);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const data = await sendChatMessage({
        message: text,
        sessionKey: sessionKey || undefined,
        mode,
        level: learningContext?.level,
        moduleContext: learningContext?.moduleContext,
      });
      persistSession(data.session_key ?? sessionKey);
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
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
      const isLimit =
        err instanceof ContentEngineError &&
        err.status === 429 &&
        err.body &&
        typeof err.body === 'object' &&
        err.body.upgrade_available === true;
      setLimitUpgradeHint(Boolean(isLimit));
      setError(err instanceof Error ? err.message : 'Failed to send message');
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

  const handleNewChat = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSessionKey('');
    setMessages([]);
    setError('');
    setLimitUpgradeHint(false);
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
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">AI tutor & support</h2>
            <p className="mt-1 text-sm text-slate-600">
              Ask English learning questions or platform questions (billing, account). Replies route to a tutor or
              support-style assistant.
            </p>
            {limits?.chat ? (
              <p
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                  quotaSeverity(limits.chat) === 'critical'
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : quotaSeverity(limits.chat) === 'warn'
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : quotaSeverity(limits.chat) === 'info'
                        ? 'border-sky-300 bg-sky-50 text-sky-800'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Sisa chat: {limits.chat.remaining}
                {limits.chat.limit == null ? ' / unlimited' : ` / ${limits.chat.limit}`}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-slate-600" htmlFor="chat-mode">
              Tutor mode
            </label>
            <select
              id="chat-mode"
              value={mode}
              onChange={(ev) => setMode(ev.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleNewChat}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-300"
            >
              New chat
            </button>
          </div>
        </div>

        {error ? <StatusMessage type="error" message={error} /> : null}
        {limitUpgradeHint ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">Batas chat harian untuk paket Free tercapai.</p>
            <p className="mt-1 text-amber-900">
              Upgrade ke <span className="font-semibold">Pro</span> untuk kuota lebih besar (sesuai pengaturan
              server).
            </p>
            <Link
              to="/app/plans"
              className="mt-2 inline-block text-sm font-semibold text-brand-800 underline hover:text-brand-950"
            >
              Pilih paket &amp; upgrade
            </Link>
          </div>
        ) : null}

        {learningContext ? (
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold">Lesson context:</span>{' '}
              {learningContext.moduleTitle}
              {learningContext.level ? (
                <span className="text-emerald-800"> · level: {learningContext.level}</span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={clearLessonContext}
              className="shrink-0 rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              Clear lesson context
            </button>
          </div>
        ) : (
          <p className="mt-4 text-xs text-slate-500">
            Tip: dari Learning page, gunakan &quot;Chat with tutor (this lesson)&quot; untuk mengirim ringkasan materi +
            quiz ke tutor.
          </p>
        )}

        <div className="mt-4 max-h-[28rem] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">Start by sending a message below.</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((m, idx) => (
                <li
                  key={`${idx}-${m.role}`}
                  className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-8 bg-brand-700 text-white'
                      : 'mr-8 border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-80">
                    {m.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="mt-1 block whitespace-pre-wrap">{m.content}</span>
                </li>
              ))}
              {loading ? (
                <li className="mr-8 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
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
            placeholder="e.g. Explain present perfect vs past simple…"
            className="min-h-[5rem] flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </article>
    </section>
  );
}
