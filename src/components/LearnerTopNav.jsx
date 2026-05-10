import { NavLink, useNavigate } from 'react-router-dom';
import { useLearnerEntitlement } from '../context/LearnerEntitlementContext';
import { useSessionRole } from '../hooks/useSessionRole';
import { clearAuthSession } from '../services/authSession';

const LEARNER_LINKS = [
  { to: '/app/learn', label: 'Belajar' },
  { to: '/app/chat', label: 'Chat AI' },
  { to: '/app/plans', label: 'Paket' },
  { to: '/app/account', label: 'Akun' },
];

export function LearnerTopNav() {
  const navigate = useNavigate();
  const { role, clearRole } = useSessionRole();
  const { data: entitlement, loading: entLoading } = useLearnerEntitlement();

  const signOut = () => {
    clearRole();
    clearAuthSession();
    navigate('/', { replace: true });
  };

  return (
    <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-4 py-6 text-white md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
          Ruang peserta
        </p>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Belajar Bahasa Inggris</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-100">
          Akses materi, latihan, dan tutor AI — tanpa menu pengelolaan konten admin.
        </p>
      </div>
      <div className="flex flex-col gap-3 bg-white p-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-sm text-slate-600">Navigasi peserta</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <NavLink to="/" className="font-medium text-brand-700 hover:underline">
              Beranda portal
            </NavLink>
            <NavLink to="/login" className="font-medium text-slate-600 hover:text-brand-700">
              Ganti akun (login)
            </NavLink>
            <NavLink to="/register" className="font-medium text-slate-600 hover:text-brand-700">
              Daftar akun baru
            </NavLink>
          </div>
          {role ? (
            <p className="mt-2 text-xs text-slate-500">
              Masuk sebagai: <span className="font-semibold text-slate-700">{role}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!entLoading && entitlement?.plan ? (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                entitlement.plan === 'free'
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {entitlement.plan}
            </span>
          ) : null}
          <nav className="inline-flex rounded-xl bg-slate-100 p-1">
            {LEARNER_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {role ? (
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Keluar
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
