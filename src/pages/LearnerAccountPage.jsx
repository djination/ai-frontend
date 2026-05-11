import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { useLearnerEntitlement } from '../context/LearnerEntitlementContext';
import { ContentEngineError, manageSubscription } from '../services/contentEngineApi';

function formatLimit(limit) {
  if (limit == null) return '—';
  if (limit === 0) return 'Tanpa batas harian';
  return String(limit);
}

/** Modal konfirmasi pembatalan (akses tetap sampai akhir periode). */
function CancelSubscriptionModal({
  open,
  busy,
  accessEndLabel,
  onClose,
  onConfirmCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
        aria-label="Tutup"
        disabled={busy}
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-600 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Sayang melihat Anda pergi
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Langganan berbayar Anda tetap berlaku sampai{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{accessEndLabel}</span>. Tidak ada
          tagihan perpanjangan setelah Anda membatalkan. Jika ingin melanjutkan pembatalan, pilih &quot;Batalkan
          langganan&quot; di bawah.
        </p>
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/80 dark:bg-amber-950/35">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </span>
          <div className="min-w-0 text-sm text-amber-950 dark:text-amber-100">
            <p className="font-semibold">Periksa sebelum melanjutkan</p>
            <p className="mt-1 leading-relaxed text-amber-900/95 dark:text-amber-100/95">
              Setelah <span className="font-semibold">{accessEndLabel}</span>, kuota chat harian dan akses konten
              mengikuti paket Free (lebih terbatas). Tutor dan fitur lain tetap tersedia sesuai batas Free.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Tetap langganan
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirmCancel()}
            className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-50"
          >
            {busy ? 'Memproses…' : 'Batalkan langganan'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RevokeCancelModal({ open, busy, onClose, onConfirm }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
        aria-label="Tutup"
        disabled={busy}
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-600 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Urungkan pembatalan?</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Permintaan berhenti di akhir periode akan dibatalkan. Langganan Anda tetap berjalan seperti biasa sampai
          tanggal berlaku, kecuali Anda membatalkan lagi nanti.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {busy ? 'Memproses…' : 'Ya, urungkan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LearnerAccountPage() {
  const navigate = useNavigate();
  const { loading, data, error, refetch } = useLearnerEntitlement();
  const [manageBusy, setManageBusy] = useState(false);
  const [manageError, setManageError] = useState('');
  const [manageSuccess, setManageSuccess] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);

  const showPendingPayment =
    Boolean(data?.pending_plan_code) && String(data?.payment_status ?? '').toLowerCase() !== 'active';

  const accessEndLabel = data?.pro_access_until
    ? new Date(data.pro_access_until).toLocaleString()
    : 'tanggal akhir periode berlangganan Anda';

  const submitCancelSubscription = useCallback(async () => {
    setManageError('');
    setManageSuccess('');
    setManageBusy(true);
    try {
      const res = await manageSubscription({ intent: 'cancel' });
      setManageSuccess(res?.detail ?? 'Pembatalan disimpan.');
      setCancelModalOpen(false);
      await refetch();
    } catch (e) {
      setManageError(e instanceof ContentEngineError ? e.message : 'Gagal menyimpan pembatalan.');
    } finally {
      setManageBusy(false);
    }
  }, [refetch]);

  const submitRevokeScheduledCancel = useCallback(async () => {
    setManageError('');
    setManageSuccess('');
    setManageBusy(true);
    try {
      const res = await manageSubscription({ intent: 'revoke_cancel' });
      setManageSuccess(res?.detail ?? 'Jadwal berhenti diurungkan.');
      setRevokeModalOpen(false);
      await refetch();
    } catch (e) {
      setManageError(e instanceof ContentEngineError ? e.message : 'Gagal mengurungkan.');
    } finally {
      setManageBusy(false);
    }
  }, [refetch]);

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 md:p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Akun &amp; paket</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Ringkasan paket efektif dan kuota chat. Untuk memilih paket berbayar (Free, Go, Plus, Pro), buka halaman{' '}
          <Link to="/app/plans" className="font-semibold text-brand-700 underline dark:text-brand-400">
            Paket &amp; upgrade
          </Link>
          .
        </p>

        {error ? (
          <div className="mt-4">
            <StatusMessage type="error" message={error.message} />
          </div>
        ) : null}
        {manageError ? (
          <div className="mt-4">
            <StatusMessage type="error" message={manageError} />
          </div>
        ) : null}
        {manageSuccess ? (
          <div className="mt-4">
            <StatusMessage type="success" message={manageSuccess} />
          </div>
        ) : null}

        {loading && !data ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">Memuat paket…</p>
        ) : data ? (
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Paket efektif
              </dt>
              <dd className="mt-1 text-lg font-semibold capitalize text-slate-900 dark:text-slate-100">
                {data.plan}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Batas pesan chat / hari
              </dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatLimit(data.chat_daily_message_limit)}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Status pembayaran
              </dt>
              <dd className="mt-1 font-medium capitalize text-slate-800 dark:text-slate-200">
                {data.payment_status}
              </dd>
            </div>
            {showPendingPayment ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                  Menunggu pembayaran
                </dt>
                <dd className="mt-1 text-amber-950 dark:text-amber-100">
                  Paket dipilih: <span className="font-semibold">{data.pending_plan_code}</span>. Selesaikan pembayaran
                  lewat payment gateway saat sudah terhubung.
                </dd>
                {data.demo_payment_enabled ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/app/billing/demo', {
                        state: { planCode: data.pending_plan_code },
                      })
                    }
                    className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    Simulasi bayar (demo)
                  </button>
                ) : null}
              </div>
            ) : null}
            {data.pro_access_until ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Langganan aktif sampai
                </dt>
                <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                  {new Date(data.pro_access_until).toLocaleString()}
                </dd>
                {data.cancel_at_period_end ? (
                  <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                    Anda memilih berhenti di akhir periode. Akses tetap sampai tanggal di atas; tidak diperpanjang
                    otomatis setelahnya.
                  </p>
                ) : null}
              </div>
            ) : null}
          </dl>
        ) : null}

        {data?.can_manage_subscription ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Kelola langganan</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Ganti atau turunkan tier tanpa memutus masa berlaku lewat{' '}
              <Link to="/app/plans" className="font-semibold text-brand-700 underline dark:text-brand-400">
                halaman paket
              </Link>
              .
            </p>
            <div className="mt-3">
              {data.cancel_at_period_end ? (
                <button
                  type="button"
                  disabled={manageBusy || loading}
                  onClick={() => setRevokeModalOpen(true)}
                  className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
                >
                  Urungkan pembatalan
                </button>
              ) : (
                <button
                  type="button"
                  disabled={manageBusy || loading}
                  onClick={() => setCancelModalOpen(true)}
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  Batalkan langganan
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/app/plans"
            className="inline-flex rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-800"
          >
            Lihat &amp; pilih paket
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={() => void refetch()}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Muat ulang status
          </button>
        </div>
      </article>

      <CancelSubscriptionModal
        open={cancelModalOpen}
        busy={manageBusy}
        accessEndLabel={accessEndLabel}
        onClose={() => setCancelModalOpen(false)}
        onConfirmCancel={submitCancelSubscription}
      />
      <RevokeCancelModal
        open={revokeModalOpen}
        busy={manageBusy}
        onClose={() => setRevokeModalOpen(false)}
        onConfirm={submitRevokeScheduledCancel}
      />
    </section>
  );
}
