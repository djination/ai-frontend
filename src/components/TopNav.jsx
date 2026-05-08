import { NavLink } from 'react-router-dom';
import { useSessionRole } from '../hooks/useSessionRole';
import { clearAuthSession } from '../services/authSession';

const menuItems = [
  { to: '/app/learn', label: 'Learning' },
  { to: '/app/admin', label: 'Admin Content' },
];

export function TopNav() {
  const { role, clearRole } = useSessionRole();

  return (
    <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-4 py-6 text-white md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
          Educational Platform
        </p>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
          English Course Portal
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-100">
          Platform belajar Bahasa Inggris untuk learner dan content admin dalam satu
          dashboard.
        </p>
      </div>
      <div className="flex flex-col gap-3 bg-white p-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-sm text-slate-600">Pilih area kerja:</p>
          <NavLink to="/" className="text-xs font-medium text-brand-700 hover:underline">
            Kembali ke landing page
          </NavLink>
          {role ? (
            <p className="mt-1 text-xs text-slate-500">
              Role aktif: <span className="font-semibold text-slate-700">{role}</span>
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <nav className="inline-flex rounded-xl bg-slate-100 p-1">
            {menuItems.map((item) => (
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
              onClick={() => {
                clearRole();
                clearAuthSession();
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Logout Role
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
