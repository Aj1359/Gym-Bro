import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { getDashboard, type Dashboard } from '../features/dashboard/dashboardApi';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setDashboard).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!dashboard) return <div className="p-8">Something went wrong loading your dashboard.</div>;

  const hasTargets = dashboard.caloriesTarget !== null;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#a3e635';

  const macroPieData = [
    { name: 'Protein', value: dashboard.macroBreakdown.proteinPct, color: '#22c55e' },
    { name: 'Carbs', value: dashboard.macroBreakdown.carbsPct, color: '#3b82f6' },
    { name: 'Fat', value: dashboard.macroBreakdown.fatPct, color: '#a855f7' },
  ];

  const weeklyBarData = dashboard.weeklyScores.map((score, i) => ({
    day: DAY_LABELS[i],
    score,
  }));

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Good Morning! 👋</h1>
          <p className="text-[var(--color-text-muted)]">Ready to crush your goals today?</p>
        </div>
      </div>

      {!hasTargets && (
        <div className="mb-6 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/10 p-4 text-sm">
          <Link to="/profile" className="font-semibold text-[var(--color-accent)]">Complete your profile</Link> to unlock personalized targets and your daily score.
        </div>
      )}

      {/* Top macro row + daily score */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-4">
          <MacroCard label="Calories" icon="🔥" current={dashboard.caloriesConsumed} target={dashboard.caloriesTarget} unit="" barColor="bg-orange-500" />
          <MacroCard label="Protein" icon="💪" current={dashboard.proteinConsumed} target={dashboard.proteinTarget} unit="g" barColor="bg-green-500" />
          <MacroCard label="Carbs" icon="🌾" current={dashboard.carbsConsumed} target={dashboard.carbsTarget} unit="g" barColor="bg-blue-500" />
          <MacroCard label="Fats" icon="💧" current={dashboard.fatConsumed} target={dashboard.fatTarget} unit="g" barColor="bg-purple-500" />
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
          <div className="text-sm text-[var(--color-text-muted)]">Daily Score</div>
          <div className="relative my-2 h-24 w-24">
            <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="var(--color-border)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke={accent} strokeWidth="3" strokeDasharray={`${dashboard.dailyScore}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
              {dashboard.dailyScore}%
            </div>
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {dashboard.dailyScore >= 70 ? 'Keep going! 🔥' : dashboard.dailyScore >= 40 ? 'On track' : 'Let\'s pick it up'}
          </div>
        </div>
      </div>

      {/* Macro donut + Today's Summary + Weekly Activity */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-3 font-semibold">Calories & Macros</h3>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={macroPieData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {macroPieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <div className="text-lg font-bold">{dashboard.caloriesConsumed}</div>
              <div className="text-xs text-[var(--color-text-muted)]">Consumed</div>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-sm">
            {macroPieData.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.name}</span>
                <span className="text-[var(--color-text-muted)]">{m.value}%</span>
              </div>
            ))}
          </div>
          <Link to="/nutrition" className="mt-3 inline-block text-sm text-[var(--color-accent)]">View Nutrition →</Link>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-3 font-semibold">Today's Summary</h3>
          <SummaryRow icon="🏋️" label="Workout" value={dashboard.todaysWorkout ? (dashboard.todaysWorkout.completed ? 'Completed' : 'In progress') : 'Not started'} />
          <SummaryRow icon="🍽️" label="Meals" value={`${dashboard.recentMeals.length} logged`} />
          <SummaryRow icon="💧" label="Water" value={`${(dashboard.waterConsumedMl / 1000).toFixed(1)}L`} />
          <SummaryRow icon="🔥" label="Streak" value={`${dashboard.workoutStreak} day${dashboard.workoutStreak !== 1 ? 's' : ''}`} />
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-3 font-semibold">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyBarData}>
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Bar dataKey="score" fill={accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{dashboard.weeklyConsistency} of 7 days active</p>
        </div>
      </div>

      {/* Recent Meals + Recent Workouts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-3 font-semibold">Recent Meals</h3>
          {dashboard.recentMeals.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">No meals logged yet.</p>}
          <div className="space-y-3">
            {dashboard.recentMeals.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{m.foodName}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{m.quantity}{m.servingUnit} • {m.mealType}</div>
                </div>
                <div className="text-right text-xs text-[var(--color-text-muted)]">{m.calories} kcal</div>
              </div>
            ))}
          </div>
          <Link to="/nutrition" className="mt-3 inline-block text-sm text-[var(--color-accent)]">View All Meals →</Link>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-3 font-semibold">Recent Workouts</h3>
          {dashboard.recentWorkouts.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">No workouts logged yet.</p>}
          <div className="space-y-3">
            {dashboard.recentWorkouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{w.title}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{new Date(w.startedAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right text-xs text-[var(--color-text-muted)]">{w.durationMinutes ? `${w.durationMinutes}m` : 'In progress'}</div>
              </div>
            ))}
          </div>
          <Link to="/history" className="mt-3 inline-block text-sm text-[var(--color-accent)]">View All →</Link>
        </div>
      </div>

      {/* Honest placeholders — not fabricated */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-center text-sm text-[var(--color-text-muted)]">
          👟 Steps & 😴 Sleep tracking — coming with wearable integration (planned)
        </div>
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-center text-sm text-[var(--color-text-muted)]">
          🤖 AI Coach — coming in Phase 2
        </div>
      </div>
    </div>
  );
}

function MacroCard({ label, icon, current, target, unit, barColor }: {
  label: string; icon: string; current: number; target: number | null; unit: string; barColor: string;
}) {
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : null;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]"><span>{icon}</span>{label}</div>
      <div className="mt-1 text-xl font-bold">{current}{unit}{target ? <span className="text-sm font-normal text-[var(--color-text-muted)]"> / {target}{unit}</span> : ''}</div>
      {pct !== null && (
        <div className="mt-2 h-1.5 rounded-full bg-[var(--color-surface)]">
          <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-[var(--color-text-muted)]"><span>{icon}</span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
