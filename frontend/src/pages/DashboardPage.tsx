import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, type Dashboard } from '../features/dashboard/dashboardApi';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setDashboard).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!dashboard) return <div className="p-8 text-[var(--color-text-muted)]">Something went wrong loading your dashboard.</div>;

  const hasTargets = dashboard.caloriesTarget !== null;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {!hasTargets && (
        <div className="mb-6 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/10 p-4 text-sm">
          <Link to="/profile" className="font-semibold text-[var(--color-accent)] hover:underline">Complete your profile</Link> to see personalized calorie and macro targets here.
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          label="Calories"
          current={dashboard.caloriesConsumed}
          target={dashboard.caloriesTarget}
          unit="kcal"
        />
        <MetricCard
          label="Protein"
          current={dashboard.proteinConsumed}
          target={dashboard.proteinTarget}
          unit="g"
        />
        <MetricCard
          label="Water"
          current={dashboard.waterConsumedMl / 1000}
          target={dashboard.waterTargetMl ? dashboard.waterTargetMl / 1000 : null}
          unit="L"
          decimals={1}
        />
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
          <div className="text-2xl font-bold">{dashboard.currentWeightKg ?? '—'}</div>
          <div className="text-xs text-[var(--color-text-muted)]">Weight (kg)</div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-muted)]">Today's Workout</h3>
          {dashboard.todaysWorkout ? (
            <Link to="/workout" className="block hover:opacity-80">
              <div className="font-semibold">{dashboard.todaysWorkout.title}</div>
              <div className={`text-sm ${dashboard.todaysWorkout.completed ? 'text-[var(--color-accent)]' : 'text-orange-500'}`}>
                {dashboard.todaysWorkout.completed ? '✓ Completed' : 'In progress'}
              </div>
            </Link>
          ) : (
            <Link to="/workout" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">Start a workout →</Link>
          )}
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-muted)]">Streak</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{dashboard.workoutStreak}</span>
            <span className="text-sm text-[var(--color-text-muted)]">day{dashboard.workoutStreak !== 1 ? 's' : ''} 🔥</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">This Week's Consistency</h3>
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-8 flex-1 rounded transition-colors ${i < dashboard.weeklyConsistency ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)]'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{dashboard.weeklyConsistency} of 7 days active</p>
      </div>
    </div>
  );
}

function MetricCard({ label, current, target, unit, decimals = 0 }: {
  label: string; current: number; target: number | null; unit: string; decimals?: number;
}) {
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="text-sm text-[var(--color-text-muted)]">{label}</div>
      <div className="text-xl font-bold">
        {current.toFixed(decimals)}{target ? ` / ${target.toFixed(decimals)}` : ''} {unit}
      </div>
      {pct !== null && (
        <div className="mt-2 h-1.5 rounded-full bg-[var(--color-surface)]">
          <div className="h-1.5 rounded-full bg-[var(--color-accent)] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
