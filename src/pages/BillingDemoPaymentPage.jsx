import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLearnerEntitlement } from '../context/LearnerEntitlementContext';
import { ContentEngineError, completeDemoPayment, fetchLearnerEntitlement } from '../services/contentEngineApi';

const STEPS = { REVIEW: 'review', PROCESSING: 'processing', SUCCESS: 'success', ERROR: 'error' };

export function BillingDemoPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { refetch: refetchContext } = useLearnerEntitlement();

  const statePlan = location.state?.planCode;
  const stateTitle = location.state?.planTitle;
  const statePrice = location.state?.priceDisplay;

  const queryPlan = searchParams.get('plan')?.trim().toLowerCase() ?? '';

  const [step, setStep] = useState(STEPS.REVIEW);
  const [error, setError] = useState('');
  const [resolvedPlan, setResolvedPlan] = useState(statePlan || queryPlan || '');
  const [resolvedTitle, setResolvedTitle] = useState(stateTitle || '');
  const [resolvedPrice, setResolvedPrice] = useState(statePrice || '');
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [detail, setDetail] = useState('');
  const [gateLoaded, setGateLoaded] = useState(false);

  const loadPending = useCallback(async () => {
    setGateLoaded(false);
    try {
      const ent = await fetchLearnerEntitlement();
      setDemoEnabled(Boolean(ent.demo_payment_enabled));
      if (!statePlan && !queryPlan && ent.pending_plan_code) {
        setResolvedPlan(ent.pending_plan_code);
      }
    } catch {
      setDemoEnabled(false);
    } finally {
      setGateLoaded(true);
    }
  }, [statePlan, queryPlan]);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  useEffect(() => {
    const code = statePlan || queryPlan;
    if (!code) return;
    setResolvedPlan(code);
  }, [statePlan, queryPlan]);

  const runDemoPayment = async () => {
    setError('');
    setStep(STEPS.PROCESSING);
    await new Promise((r) => setTimeout(r, 1800));
    try {
      const body = await completeDemoPayment({
        planCode: resolvedPlan || undefined,
      });
      setDetail(body.detail ?? '');
      setStep(STEPS.SUCCESS);
      if (body.plan_title) setResolvedTitle(body.plan_title);
      if (body.price_display) setResolvedPrice(body.price_display);
      await refetchContext();
    } catch (e) {
      const msg =
        e instanceof ContentEngineError
          ? (e.body?.error ?? e.message)
          : e instanceof Error
            ? e.message
            : 'Gagal';
      setError(String(msg));
      setStep(STEPS.ERROR);
    }
  };

  if (!gateLoaded) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        Memuat…
      </div>
    );
  }

  if (!demoEnabled && step === STEPS.REVIEW) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h1 className="text-lg font-semibold">Simulasi pembayaran tidak aktif</h1>
        <p className="mt-2 text-sm">
          Set <code className="rounded bg-amber-100 px-1">BILLING_DEMO_PAYMENT_ENABLED=true</code> di backend{' '}
          <code className="rounded bg-amber-100 px-1">.env</code>, lalu restart server.
        </p>
        <Link to="/app/plans" className="mt-4 inline-block text-sm font-semibold text-amber-900 underline">
          Kembali ke paket
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Demo pembayaran</p>
      <h1 className="mt-1 text-xl font-semibold text-slate-900">Checkout simulasi</h1>
      <p className="mt-2 text-sm text-slate-600">
        Alur ini hanya untuk demo. Tidak ada charge sungguhan. Production: ganti dengan payment gateway.
      </p>

      {step === STEPS.REVIEW ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-medium text-slate-800">Ringkasan</p>
            <dl className="mt-2 space-y-1 text-slate-600">
              <div className="flex justify-between">
                <dt>Paket</dt>
                <dd className="font-semibold text-slate-900">
                  {resolvedTitle || resolvedPlan || '(dari permintaan upgrade)'}
                </dd>
              </div>
              {resolvedPrice ? (
                <div className="flex justify-between">
                  <dt>Tagihan</dt>
                  <dd className="font-semibold text-slate-900">{resolvedPrice} / bulan</dd>
                </div>
              ) : null}
              <div className="flex justify-between text-xs text-slate-500">
                <dt>Metode</dt>
                <dd>Demo — tanpa gateway</dd>
              </div>
            </dl>
          </div>
          {!resolvedPlan && !queryPlan && !statePlan ? (
            <p className="text-sm text-rose-600">
              Tidak ada paket terpilih. Pilih upgrade di halaman Paket terlebih dahulu, atau tambahkan{' '}
              <code className="rounded bg-slate-100 px-1">?plan=plus</code> di URL.
            </p>
          ) : null}
          <button
            type="button"
            disabled={!resolvedPlan && !queryPlan && !statePlan}
            onClick={() => void runDemoPayment()}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Konfirmasi &amp; bayar (demo)
          </button>
          <Link to="/app/plans" className="block text-center text-sm text-slate-500 hover:text-slate-800">
            Batal
          </Link>
        </div>
      ) : null}

      {step === STEPS.PROCESSING ? (
        <div className="mt-10 flex flex-col items-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-slate-700">Memproses pembayaran…</p>
          <p className="mt-1 text-xs text-slate-500">Menghubungi server (simulasi delay)</p>
        </div>
      ) : null}

      {step === STEPS.SUCCESS ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-semibold">Pembayaran demo berhasil</p>
          <p className="mt-2">{detail}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/app/account')}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Lihat akun
            </button>
            <Link
              to="/app/learn"
              className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              Mulai belajar
            </Link>
          </div>
        </div>
      ) : null}

      {step === STEPS.ERROR ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">Gagal</p>
          <p className="mt-2">{error}</p>
          <button
            type="button"
            onClick={() => {
              setStep(STEPS.REVIEW);
              setError('');
            }}
            className="mt-4 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900"
          >
            Coba lagi
          </button>
        </div>
      ) : null}
    </div>
  );
}
