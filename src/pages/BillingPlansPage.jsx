import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLearnerEntitlement } from '../context/LearnerEntitlementContext';
import { getAccessToken, isAccessTokenExpired } from '../services/authSession';
import {
  ContentEngineError,
  fetchBillingPlans,
  fetchLearnerLimits,
  requestBillingPlanUpgrade,
} from '../services/contentEngineApi';

function FeatureIcon({ name }) {
  const cls = 'h-4 w-4 shrink-0 text-brand-600';
  switch (name) {
    case 'spark':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" d="M12 3v4m0 10v4M4.5 12H8m8 0h3.5M6.4 6.4l2.5 2.5m6.2 6.2l2.5 2.5M6.4 17.6l2.5-2.5m6.2-6.2l2.5-2.5" />
        </svg>
      );
    case 'message':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h4m-6 8v-4.5a2 2 0 012-2h6a2 2 0 012 2V22" />
        </svg>
      );
    case 'book':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14M4 19a2 2 0 002 2h12a2 2 0 002-2M4 19V9a2 2 0 012-2h12a2 2 0 012 2v10" />
        </svg>
      );
    case 'memory':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 2M5 12a7 7 0 1114 0 7 7 0 01-14 0z" />
        </svg>
      );
    case 'search':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 110-16 8 8 0 010 16z" />
        </svg>
      );
    case 'stack':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l8-4 8 4M4 14l8 4 8-4" />
        </svg>
      );
    case 'zap':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
  }
}

function formatDailyLimit(value) {
  if (value == null) return 'Unlimited';
  return `${value}/hari`;
}

function quotaRatio(bucket) {
  if (!bucket || bucket.limit == null) return false;
  const limit = Number(bucket.limit);
  const remaining = Number(bucket.remaining ?? 0);
  if (!Number.isFinite(limit) || limit <= 0) return null;
  return remaining / limit;
}

function quotaSeverity(limits) {
  const ratios = [quotaRatio(limits?.chat), quotaRatio(limits?.content)].filter(
    (v) => typeof v === 'number',
  );
  if (!ratios.length) return null;
  const minRatio = Math.min(...ratios);
  if (minRatio <= 0.05) return 'critical';
  if (minRatio <= 0.1) return 'warn';
  if (minRatio <= 0.2) return 'info';
  return null;
}

export function BillingPlansPage() {
  const navigate = useNavigate();
  const { refetch: refetchEntitlement } = useLearnerEntitlement();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [busyCode, setBusyCode] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');
  const [demoPaymentEnabled, setDemoPaymentEnabled] = useState(false);
  const [lastRequestedPlan, setLastRequestedPlan] = useState(null);
  const [limits, setLimits] = useState(null);
  const [limitsError, setLimitsError] = useState('');
  const severity = quotaSeverity(limits);
  const quotaWarningConfig = {
    info: {
      cls: 'border-sky-200 bg-sky-50 text-sky-800',
      msg: 'Kuota mulai berkurang (<=20%). Anda bisa pertimbangkan upgrade.',
    },
    warn: {
      cls: 'border-amber-200 bg-amber-50 text-amber-800',
      msg: 'Kuota menipis (<=10%). Pertimbangkan upgrade agar belajar tidak terhenti.',
    },
    critical: {
      cls: 'border-rose-200 bg-rose-50 text-rose-800',
      msg: 'Kuota kritis (<=5%). Segera upgrade jika ingin lanjut tanpa gangguan.',
    },
  };

  const hasValidAccessToken = () => {
    const token = getAccessToken();
    return Boolean(token) && !isAccessTokenExpired();
  };

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    setLimitsError('');
    try {
      const data = await fetchBillingPlans();
      setPlans(data.plans ?? []);
      setDemoPaymentEnabled(Boolean(data.demo_payment_enabled));
      if (hasValidAccessToken()) {
        try {
          const limitsData = await fetchLearnerLimits();
          setLimits(limitsData ?? null);
        } catch (e) {
          if (!(e instanceof ContentEngineError && e.status === 401)) {
            setLimitsError('Gagal memuat sisa kuota harian.');
          }
          setLimits(null);
        }
      } else {
        setLimits(null);
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Gagal memuat paket');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const requireAuthForUpgrade = () => {
    if (!hasValidAccessToken()) {
      navigate(`/login?next=${encodeURIComponent('/app/plans')}`);
      return false;
    }
    return true;
  };

  const handleUpgrade = async (plan) => {
    if (plan.code === 'free') return;
    if (plan.is_current_effective) return;
    setActionMsg('');
    setActionErr('');
    if (!requireAuthForUpgrade()) return;
    setBusyCode(plan.code);
    try {
      await requestBillingPlanUpgrade(plan.code);
      setLastRequestedPlan({
        code: plan.code,
        title: plan.title,
        priceDisplay: plan.price_display,
      });
      setActionMsg(
        `Permintaan untuk paket "${plan.title}" tercatat. Pembayaran akan dilakukan lewat payment gateway ketika terintegrasi.`,
      );
      await refetchEntitlement();
      if (hasValidAccessToken()) {
        const limitsData = await fetchLearnerLimits();
        setLimits(limitsData ?? null);
      }
    } catch (e) {
      const msg =
        e instanceof ContentEngineError
          ? (e.body?.error ?? e.message)
          : e instanceof Error
            ? e.message
            : 'Gagal mengirim permintaan';
      setActionErr(String(msg));
    } finally {
      setBusyCode('');
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-8 shadow-sm md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Paket</p>
        <h1 className="mt-2 text-center text-2xl font-semibold text-slate-900 md:text-3xl">Upgrade paket Anda</h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600">
          Harga dan fitur dapat diatur di Django Admin (Paket billing). Pembayaran nanti melalui payment gateway.
        </p>
        {limits ? (
          <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-medium text-brand-800">
              Kuota hari ini ({limits.plan?.toUpperCase?.() ?? 'FREE'})
            </p>
            <p className="mt-1">
              Chat: <strong>{limits.chat?.remaining ?? 0}</strong>
              {limits.chat?.limit == null ? ' / unlimited' : ` / ${limits.chat?.limit}`} tersisa
            </p>
            <p>
              Konten: <strong>{limits.content?.remaining ?? 0}</strong>
              {limits.content?.limit == null ? ' / unlimited' : ` / ${limits.content?.limit}`} tersisa
            </p>
            {severity ? (
              <p
                className={`mt-2 rounded-md border px-2 py-1 text-xs ${quotaWarningConfig[severity].cls}`}
              >
                {quotaWarningConfig[severity].msg}
              </p>
            ) : null}
          </div>
        ) : null}
        {limitsError ? <p className="mt-3 text-center text-xs text-amber-700">{limitsError}</p> : null}

        {fetchError ? (
          <p className="mt-6 text-center text-sm text-rose-600">{fetchError}</p>
        ) : null}
        {actionErr ? (
          <p className="mt-4 text-center text-sm text-rose-600">{actionErr}</p>
        ) : null}
        {actionMsg ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900">
            <p>{actionMsg}</p>
            {demoPaymentEnabled && lastRequestedPlan ? (
              <button
                type="button"
                onClick={() =>
                  navigate('/app/billing/demo', {
                    state: {
                      planCode: lastRequestedPlan.code,
                      planTitle: lastRequestedPlan.title,
                      priceDisplay: lastRequestedPlan.priceDisplay,
                    },
                  })
                }
                className="mt-3 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 md:w-auto"
              >
                Lanjut simulasi pembayaran (demo)
              </button>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <p className="mt-10 text-center text-sm text-slate-500">Memuat paket…</p>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const popular = plan.popular;
              const current = plan.is_current_effective;
              return (
                <div
                  key={plan.code}
                  className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                    popular
                      ? 'border-brand-400 ring-2 ring-brand-200'
                      : 'border-slate-200'
                  } ${current && !popular ? 'ring-1 ring-slate-300' : ''}`}
                >
                  {popular ? (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Popular
                    </span>
                  ) : null}
                  <h2 className="text-lg font-semibold text-slate-900">{plan.title}</h2>
                  <div className="mt-3 min-h-[3.5rem]">
                    {plan.price_prefix ? (
                      <span className="text-xs font-medium text-slate-500">{plan.price_prefix}</span>
                    ) : null}
                    <div className="flex flex-wrap items-baseline gap-x-1">
                      <span className="text-2xl font-bold text-slate-900">{plan.price_display}</span>
                      <span className="text-sm text-slate-500">{plan.period_label}</span>
                    </div>
                    {plan.vat_note ? <p className="mt-1 text-xs text-slate-500">{plan.vat_note}</p> : null}
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{plan.slogan}</p>
                  {plan.daily_limits ? (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      <p>Chat: {formatDailyLimit(plan.daily_limits.chat)}</p>
                      <p>Konten: {formatDailyLimit(plan.daily_limits.content)}</p>
                    </div>
                  ) : null}
                  <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-sm text-slate-700">
                    {(plan.features ?? []).map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <FeatureIcon name={f.icon} />
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.footer_note ? (
                    <p className="mt-4 text-xs text-slate-500">{plan.footer_note}</p>
                  ) : null}
                  <div className="mt-5">
                    {plan.code === 'free' ? (
                      <button
                        type="button"
                        disabled={current}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 disabled:cursor-default disabled:opacity-100"
                      >
                        {current ? 'Paket Anda saat ini' : 'Gratis'}
                      </button>
                    ) : current ? (
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-sm font-semibold text-slate-500"
                      >
                        Paket aktif
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyCode === plan.code}
                        onClick={() => void handleUpgrade(plan)}
                        className={`w-full rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                          popular
                            ? 'bg-brand-700 text-white shadow-sm hover:bg-brand-800'
                            : 'border border-slate-300 bg-white text-slate-800 hover:border-brand-300 hover:bg-brand-50'
                        }`}
                      >
                        {busyCode === plan.code ? 'Memproses…' : `Upgrade ke ${plan.title}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-slate-500">
          <Link to="/app/account" className="font-medium text-brand-700 hover:underline">
            Kembali ke akun
          </Link>
          {' · '}
          <Link to="/app/learn" className="hover:text-slate-800">
            Belajar
          </Link>
          {demoPaymentEnabled ? (
            <>
              {' · '}
              <Link to="/app/billing/demo" className="font-medium text-amber-800 hover:underline">
                Demo checkout
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}
