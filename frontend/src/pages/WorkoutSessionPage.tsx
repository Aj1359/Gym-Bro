import { useState, useEffect } from 'react';
import { getExercises, type Exercise } from '../features/exercises/exerciseApi';
import { getTemplates, type Template } from '../features/templates/templateApi';
import { startWorkout, logSet, completeWorkout, type Workout } from '../features/workouts/workoutApi';
import ThemeToggle from '../components/ThemeToggle';

function RestTimer() {
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [running, seconds]);

  return (
    <div className="mb-6 flex items-center gap-3 rounded border p-3 border-[var(--color-border)] bg-[var(--color-bg)]">
      <span className="text-lg font-mono font-bold">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
      </span>
      <button onClick={() => setRunning((r) => !r)} className="rounded border px-3 py-1 text-sm border-[var(--color-border)] hover:bg-[var(--color-surface)]">
        {running ? 'Pause' : 'Start Rest'}
      </button>
      <button onClick={() => { setSeconds(90); setRunning(false); }} className="rounded border px-3 py-1 text-sm border-[var(--color-border)] hover:bg-[var(--color-surface)]">
        Reset
      </button>
    </div>
  );
}

export default function WorkoutSessionPage() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [title, setTitle] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  useEffect(() => {
    getExercises({ size: 1000 }).then((data) => setExercises(data.content));
    getTemplates().then(setTemplates);
  }, []);

  async function handleStart() {
    const chosenTemplate = templates.find((t) => t.id === selectedTemplateId);
    const w = await startWorkout(title || chosenTemplate?.name || 'Workout', selectedTemplateId || undefined);
    setWorkout(w);
  }

  async function handleLogSet() {
    if (!workout || !selectedExerciseId || !reps) return;
    const setsForThisExercise = workout.sets.filter((s) => s.exerciseId === selectedExerciseId);
    const nextSetNumber = setsForThisExercise.length + 1;

    const updated = await logSet(workout.id, {
      exerciseId: selectedExerciseId,
      setNumber: nextSetNumber,
      weightKg: weight ? Number(weight) : undefined,
      reps: Number(reps),
      rpe: rpe ? Number(rpe) : undefined,
    });
    setWorkout(updated);
    setWeight(''); setReps(''); setRpe('');
  }

  async function handleComplete() {
    if (!workout) return;
    setWorkout(await completeWorkout(workout.id));
  }

  function exerciseName(id: string) {
    return exercises.find((e) => e.id === id)?.name ?? 'Unknown';
  }

  function setsLoggedFor(exerciseId: string) {
    return workout?.sets.filter((s) => s.exerciseId === exerciseId).length ?? 0;
  }

  if (!workout) {
    return (
      <div className="mx-auto max-w-md p-8">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>
        <h1 className="mb-4 text-2xl font-bold">Start a Workout</h1>

        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="mb-3 w-full rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]"
        >
          <option value="">No plan — freestyle workout</option>
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]"
          placeholder="Workout title (optional if a plan is selected)"
        />
        <button onClick={handleStart} className="w-full rounded bg-[var(--color-accent)] py-2 font-semibold text-[var(--color-accent-text)]">
          Start Workout
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        {!workout.completedAt && (
          <button onClick={handleComplete} className="rounded border px-4 py-2 border-[var(--color-border)]">Finish Workout</button>
        )}
      </div>

      {workout.plannedExercises && workout.plannedExercises.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 font-semibold">Today's Plan</h3>
          <div className="space-y-2">
            {workout.plannedExercises.map((plan) => (
              <div key={plan.id} className="overflow-hidden rounded border border-[var(--color-border)]">
                <div className="flex items-center gap-3 p-3 bg-[var(--color-card)]">
                  {plan.imageUrl && <img src={plan.imageUrl} className="h-14 w-14 rounded object-cover" alt={plan.exerciseName} />}
                  <div className="flex-1">
                    <div className="font-medium">{plan.exerciseName}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      Target: {plan.targetSets} × {plan.targetReps}
                      {plan.targetWeightKg ? ` @ ${plan.targetWeightKg}kg` : ' — target weight: set by AI Coach (coming soon)'}
                      {' · '}Logged: {setsLoggedFor(plan.exerciseId)}/{plan.targetSets}
                    </div>
                    <button
                      onClick={() => setExpandedPlanId((cur) => (cur === plan.id ? null : plan.id))}
                      className="mt-1 text-xs font-medium text-[var(--color-accent)]"
                    >
                      {expandedPlanId === plan.id ? '▲ Hide' : '▼ How to do it'}
                    </button>
                  </div>
                </div>
                {expandedPlanId === plan.id && (
                  <ol className="list-decimal space-y-1 border-t bg-[var(--color-surface)] p-4 pl-8 text-sm border-[var(--color-border)]">
                    {plan.instructions.map((step: string, i: number) => <li key={i}>{step}</li>)}
                  </ol>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!workout.completedAt && (
        <div className="mb-8 rounded-lg border p-4 bg-[var(--color-card)] border-[var(--color-border)]">
          <h3 className="mb-3 font-semibold">Log a Set</h3>
          <RestTimer />
          <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)} className="mb-3 w-full rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]">
            <option value="">Select exercise...</option>
            {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className="rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]" />
            <input type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} className="rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]" />
            <input type="number" step="0.5" placeholder="RPE" value={rpe} onChange={(e) => setRpe(e.target.value)} className="rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]" />
          </div>
          <button onClick={handleLogSet} className="mt-3 w-full rounded bg-[var(--color-accent)] py-2 font-semibold text-[var(--color-accent-text)]">Log Set</button>
        </div>
      )}

      <h3 className="mb-3 flex items-center justify-between font-semibold">
        <span>Sets Logged ({workout.sets.length})</span>
        <span className="text-sm font-normal text-[var(--color-text-muted)]">Volume: {workout.totalVolume}kg</span>
      </h3>
      <div className="space-y-2">
        {workout.sets.map((s) => (
          <div key={s.id} className={`flex justify-between rounded border px-4 py-2 text-sm bg-[var(--color-card)] border-[var(--color-border)] ${s.isPersonalRecord ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : ''}`}>
            <span>
              {exerciseName(s.exerciseId)} — Set {s.setNumber}
              {s.isPersonalRecord && <span className="ml-2 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-bold text-[var(--color-accent-text)]">PR!</span>}
            </span>
            <span>{s.weightKg ?? '—'}kg × {s.reps} reps {s.rpe ? `@ RPE ${s.rpe}` : ''} · e1RM {s.estimatedOneRepMax}kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}
