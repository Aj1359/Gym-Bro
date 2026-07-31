import { useState, useEffect } from 'react';
import { getExercises, type Exercise } from '../features/exercises/exerciseApi';
import { createTemplate, getTemplates, addExerciseToTemplate, deleteTemplate, type Template } from '../features/templates/templateApi';
import ThemeToggle from '../components/ThemeToggle';

export default function ManageSplitsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newName, setNewName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');

  useEffect(() => {
    getTemplates().then(setTemplates);
    getExercises({ size: 1000 }).then((data) => setExercises(data.content));
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    const t = await createTemplate(newName);
    setTemplates((prev) => [...prev, t]);
    setNewName('');
  }

  async function handleAddExercise(templateId: string) {
    if (!selectedExerciseId) return;
    const updated = await addExerciseToTemplate(templateId, {
      exerciseId: selectedExerciseId,
      targetSets: Number(sets),
      targetReps: Number(reps),
    });
    setTemplates((prev) => prev.map((t) => (t.id === templateId ? updated : t)));
    setSelectedExerciseId('');
  }

  async function handleDelete(templateId: string) {
    await deleteTemplate(templateId);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <h1 className="mb-6 text-2xl font-bold">Manage Your Splits</h1>

      <div className="mb-8 flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Push, Pull, Legs, Day A..."
          className="flex-1 rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]"
        />
        <button onClick={handleCreate} className="rounded bg-[var(--color-accent)] px-4 py-2 font-semibold text-[var(--color-accent-text)]">
          Add Day
        </button>
      </div>

      <div className="space-y-4">
        {templates.map((t) => (
          <div key={t.id} className="rounded-lg border p-4 bg-[var(--color-card)] border-[var(--color-border)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">{t.name}</h3>
              <button onClick={() => handleDelete(t.id)} className="text-sm text-red-500">Delete</button>
            </div>

            <div className="mb-3 space-y-2">
              {t.exercises.map((ex) => (
                <div key={ex.id} className="flex items-center gap-3 rounded border px-3 py-2 text-sm border-[var(--color-border)]">
                  {ex.imageUrl && <img src={ex.imageUrl} className="h-10 w-10 rounded object-cover" alt={ex.exerciseName} />}
                  <span className="flex-1">{ex.exerciseName}</span>
                  <span className="text-gray-500">{ex.targetSets} × {ex.targetReps}</span>
                </div>
              ))}
            </div>

            {activeTemplateId === t.id ? (
              <div className="flex flex-wrap items-center gap-2 rounded border p-3 border-[var(--color-border)]">
                <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)} className="rounded border px-2 py-1 text-sm bg-[var(--color-bg)] border-[var(--color-border)]">
                  <option value="">Select exercise...</option>
                  {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
                <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} className="w-16 rounded border px-2 py-1 text-sm bg-[var(--color-bg)] border-[var(--color-border)]" placeholder="Sets" />
                <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="w-16 rounded border px-2 py-1 text-sm bg-[var(--color-bg)] border-[var(--color-border)]" placeholder="Reps" />
                <button onClick={() => handleAddExercise(t.id)} className="rounded bg-[var(--color-accent)] px-3 py-1 text-sm font-semibold text-[var(--color-accent-text)]">Add</button>
              </div>
            ) : (
              <button onClick={() => setActiveTemplateId(t.id)} className="text-sm text-[var(--color-accent)]">+ Add exercise to {t.name}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
