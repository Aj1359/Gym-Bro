import { useState, useEffect } from 'react';
import { getExercises, type Exercise } from '../features/exercises/exerciseApi';
import ThemeToggle from '../components/ThemeToggle';

const MUSCLE_OPTIONS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'abdominals'];
const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'cable', 'machine', 'body only'];
const LEVEL_OPTIONS = ['beginner', 'intermediate', 'expert'];

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getExercises({
      muscle: muscle || undefined,
      equipment: equipment || undefined,
      level: level || undefined,
      search: search || undefined,
      page,
      size: 20,
    })
      .then((data) => {
        setExercises(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [muscle, equipment, level, search, page]);

  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(0);
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <h1 className="mb-6 text-2xl font-bold">Exercise Library</h1>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => updateFilter(setSearch, e.target.value)}
          className="rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]"
        />
        <select value={muscle} onChange={(e) => updateFilter(setMuscle, e.target.value)}
          className="rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]">
          <option value="">All Muscles</option>
          {MUSCLE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={equipment} onChange={(e) => updateFilter(setEquipment, e.target.value)}
          className="rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]">
          <option value="">All Equipment</option>
          {EQUIPMENT_OPTIONS.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
        </select>
        <select value={level} onChange={(e) => updateFilter(setLevel, e.target.value)}
          className="rounded border px-3 py-2 bg-[var(--color-bg)] border-[var(--color-border)]">
          <option value="">All Levels</option>
          {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exercises.map((ex) => (
              <div key={ex.id} className="overflow-hidden rounded border shadow-sm bg-[var(--color-card)] border-[var(--color-border)]">
                {ex.images[0] && (
                  <img
                    src={ex.images[0]}
                    alt={ex.name}
                    className="h-40 w-full object-contain bg-white"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{ex.name}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-2">
                    {ex.primaryMuscles.join(', ')} • {ex.equipment ?? 'no equipment'} • {ex.level}
                  </p>
                  <button
                    onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
                    className="text-xs font-medium text-[var(--color-accent)]"
                  >
                    {expandedId === ex.id ? '▲ Hide Instructions' : '▼ View Instructions'}
                  </button>
                  
                  {expandedId === ex.id && (
                    <div className="mt-3 border-t border-[var(--color-border)] pt-3 text-sm">
                      <ol className="list-decimal space-y-1 pl-4">
                        {ex.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
              className="rounded border px-4 py-2 disabled:opacity-40">
              Previous
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
              className="rounded border px-4 py-2 disabled:opacity-40">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}