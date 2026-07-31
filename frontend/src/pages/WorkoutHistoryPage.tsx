import { useState, useEffect } from 'react';
import { getWorkouts, type Workout } from '../features/workouts/workoutApi';

export default function WorkoutHistoryPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkouts().then(setWorkouts).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Workout History</h1>

      {workouts.length === 0 && (
        <p className="text-[var(--color-text-muted)]">No workouts logged yet — start one to see it here.</p>
      )}

      <div className="space-y-3">
        {workouts.map((w) => {
          const prCount = w.sets.filter((s) => s.isPersonalRecord).length;
          const duration = w.completedAt
            ? Math.round((new Date(w.completedAt).getTime() - new Date(w.startedAt).getTime()) / 60000)
            : null;

          return (
            <div key={w.id} className="rounded-lg border p-4 bg-[var(--color-card)] border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{w.title}</h3>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {new Date(w.startedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-[var(--color-text-muted)]">
                <span>{w.sets.length} sets</span>
                <span>{w.totalVolume}kg volume</span>
                {duration !== null && <span>{duration} min</span>}
                {prCount > 0 && (
                  <span className="font-semibold text-[var(--color-accent)]">{prCount} PR{prCount > 1 ? 's' : ''} 🎉</span>
                )}
                {!w.completedAt && <span className="text-orange-500">In progress</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
