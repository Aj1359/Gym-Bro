import { Navigate, Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export default function ProtectedRoute() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-4xl p-4 flex gap-4 flex-wrap">
        <Link to="/dashboard" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Dashboard
        </Link>
        <Link to="/splits" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Split Planner
        </Link>
        <Link to="/history" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Workout History
        </Link>
        <Link to="/nutrition" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Nutrition Tracker
        </Link>
        <Link to="/workout" className="p-4 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] font-semibold text-center hover:opacity-90 transition">
          Go to Workout Planner
        </Link>
        <Link to="/exercises" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Exercise Library
        </Link>
        <Link to="/profile" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Profile Setup
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
