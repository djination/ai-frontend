import { Link, useNavigate } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { useLearnerEntitlement } from '../context/LearnerEntitlementContext';

function formatLimit(limit) {
  if (limit == null) return '—';
  if (limit === 0) return 'Tanpa batas harian';
  return String(limit);
}

export function LearnerAccountPage() {
  const navigate = useNavigate();
  const { loading, data, error, refetch } = useLearnerEntitlement();

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Akun &amp; paket</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ringkasan paket efektif dan kuota chat. Untuk memilih paket berbayar (Free, Go, Plus, Pro), buka halaman{' '}
          <Link to="/app/plans" className="font-semibold text-brand-700 underline">
            Paket &amp; upgrade
          </Link>
          .
        </p>

        {error ? (
          <div className="mt-4">
            <StatusMessage type="error" message={error.message} />
          </div>
        ) : null}

        {loading && !data ? (
          <p className="mt-4 text-sm text-slate-500">Memuat paket…</p>
        ) : data ? (
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paket efektif</dt>
              <dd className="mt-1 text-lg font-semibold capitalize text-slate-900">{data.plan}</dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Batas pesan chat / hari
              </dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                {formatLimit(data.chat_daily_message_limit)}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status pembayaran</dt>
              <dd className="mt-1 font-medium capitalize text-slate-800">{data.payment_status}</dd>
            </div>
            {data.pending_plan_code ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-amber-800">Menunggu pembayaran</dt>
                <dd className="mt-1 text-amber-950">
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
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Langganan aktif sampai</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {new Date(data.pro_access_until).toLocaleString()}
                </dd>
              </div>
            ) : null}
          </dl>
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
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Muat ulang status
          </button>
        </div>
      </article>
    </section>
  );
}
