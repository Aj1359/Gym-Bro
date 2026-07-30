import { useState, useEffect } from 'react';
import { getExercises, type Exercise } from '../features/exercises/exerciseApi';

const MUSCLE_OPTIONS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'abdominals'];
const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'cable', 'machine', 'body only'];

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getExercises({
      muscle: muscle || undefined,
      equipment: equipment || undefined,
      search: search || undefined,
      page,
      size: 20,
    })
      .then((data) => {
        setExercises(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [muscle, equipment, search, page]);

  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(0);
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Exercise Library</h1>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => updateFilter(setSearch, e.target.value)}
          className="rounded border px-3 py-2"
        />
        <select value={muscle} onChange={(e) => updateFilter(setMuscle, e.target.value)}
          className="rounded border px-3 py-2">
          <option value="">All Muscles</option>
          {MUSCLE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={equipment} onChange={(e) => updateFilter(setEquipment, e.target.value)}
          className="rounded border px-3 py-2">
          <option value="">All Equipment</option>
          {EQUIPMENT_OPTIONS.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {exercises.map((ex) => (
              <div key={ex.id} className="overflow-hidden rounded border shadow-sm">
                {ex.images[0] && (
                  <img
                    src={ex.images[0]}
                    alt={ex.name}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{ex.name}</h3>
                  <p className="text-sm text-gray-500">
                    {ex.primaryMuscles.join(', ')} • {ex.equipment ?? 'no equipment'} • {ex.level}
                  </p>
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