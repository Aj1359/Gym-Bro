import { useState } from 'react';
import { NavLink, Outlet, useNavigate, NavLink as NL } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ThemeToggle from './ThemeToggle';
import { clearCredentials } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';

function getInitialFromToken(token: string | null): string {
  if (!token) return 'A';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const sub: string = payload.sub ?? payload.email ?? payload.username ?? 'A';
    return sub.charAt(0).toUpperCase();
  } catch {
    return 'A';
  }
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/workout', label: 'Workouts', icon: '🏋️' },
  { to: '/history', label: 'History', icon: '📜' },
  { to: '/splits', label: 'Splits', icon: '📋' },
  { to: '/exercises', label: 'Exercise Library', icon: '📖' },
  { to: '/nutrition', label: 'Nutrition', icon: '🥗' },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const userInitial = getInitialFromToken(token);

  function handleLogout() {
    dispatch(clearCredentials());
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-lg font-black text-black">
            G
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-wide">
              GYM<span className="text-[var(--color-accent)]">BRO</span>
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)]">Stronger Every Day</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-black shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Sidebar footer: Profile + ThemeToggle + Logout ── */}
        <div className="border-t border-[var(--color-border)] p-3 space-y-2">
          {/* Theme toggle row */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-[var(--color-surface)]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium">Theme</span>
            <ThemeToggle />
          </div>

          {/* Profile link */}
          <NL
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-surface)]'
              }`
            }
          >
            {/* Avatar initials */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-sm font-bold text-[var(--color-accent)]">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">My Profile</div>
              <div className="text-[10px] text-[var(--color-text-muted)]">View & Edit →</div>
            </div>
          </NL>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-all duration-150 hover:bg-red-500/10 hover:text-red-500"
          >
            <span className="text-base">🚪</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main content — fills remaining space ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar (hamburger only — no ThemeToggle, it's in sidebar) */}
        <div className="flex items-center border-b border-[var(--color-border)] px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium"
            aria-label="Open menu"
          >
            ☰ Menu
          </button>
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
