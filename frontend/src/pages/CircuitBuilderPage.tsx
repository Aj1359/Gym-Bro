import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCircuit, type StationInput } from '../features/circuit/circuitApi';

export default function CircuitBuilderPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [overallNotes, setOverallNotes] = useState('');
  const [stations, setStations] = useState<StationInput[]>([
    { stationName: 'Kettlebell Swings', orderIndex: 1, plannedType: 'reps', plannedTarget: 20, plannedRestSeconds: 15 },
    { stationName: 'Box Jumps', orderIndex: 2, plannedType: 'time', plannedTarget: 45, plannedRestSeconds: 15 },
    { stationName: 'Battle Ropes', orderIndex: 3, plannedType: 'time', plannedTarget: 30, plannedRestSeconds: 30 },
  ]);

  const [newStationName, setNewStationName] = useState('');
  const [newType, setNewType] = useState<'time' | 'reps'>('reps');
  const [newTarget, setNewTarget] = useState<number>(15);
  const [newRest, setNewRest] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addStation(e: React.FormEvent) {
    e.preventDefault();
    if (!newStationName.trim()) return;

    const nextStation: StationInput = {
      stationName: newStationName.trim(),
      orderIndex: stations.length + 1,
      plannedType: newType,
      plannedTarget: newTarget,
      plannedRestSeconds: newRest,
    };

    setStations([...stations, nextStation]);
    setNewStationName('');
    setNewTarget(newType === 'time' ? 45 : 15);
  }

  function removeStation(index: number) {
    const updated = stations
      .filter((_, i) => i !== index)
      .map((st, i) => ({ ...st, orderIndex: i + 1 }));
    setStations(updated);
  }

  async function handleStartCircuit() {
    if (!title.trim()) {
      setError('Please provide a title for your circuit session.');
      return;
    }
    if (stations.length === 0) {
      setError('Add at least one station to your circuit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await createCircuit({
        title: title.trim(),
        overallNotes: overallNotes.trim() || undefined,
        stations,
      });
      navigate(`/circuits/${session.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to initialize circuit session.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-semibold uppercase tracking-wider mb-2">
            ⚡ Phase 2 • AI-Scored Sessions
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Circuit Builder</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Design dynamic conditioning stations. Our Gemini AI engine will evaluate your plan quality and pacing.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Session Details */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="text-lg font-bold">1. Circuit Overview</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">
              Circuit Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Full Body Metabolic Meltdown"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">
              Target Focus / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 30s max intensity, active recovery on ropes"
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>
      </div>

      {/* Station List */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">2. Station Sequence ({stations.length})</h2>
          <span className="text-xs text-[var(--color-text-muted)]">Executed in sequential order</span>
        </div>

        {stations.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">No stations added yet.</p>
        ) : (
          <div className="space-y-3">
            {stations.map((st, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/20 font-black text-xs text-[var(--color-accent)]">
                    #{st.orderIndex}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{st.stationName}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      Target: <span className="font-semibold text-[var(--color-text)]">{st.plannedTarget} {st.plannedType === 'time' ? 'seconds' : 'reps'}</span>
                      {' • '}Rest: <span className="font-semibold text-[var(--color-text)]">{st.plannedRestSeconds}s</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStation(idx)}
                  className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Station Form */}
        <form onSubmit={addStation} className="pt-4 border-t border-[var(--color-border)] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Add New Station</h3>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Station / Exercise Name"
                value={newStationName}
                onChange={(e) => setNewStationName(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'time' | 'reps')}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="reps">Reps Target</option>
                <option value="time">Timed (Seconds)</option>
              </select>
            </div>
            <div>
              <input
                type="number"
                min="1"
                placeholder={newType === 'time' ? 'Seconds' : 'Reps'}
                value={newTarget}
                onChange={(e) => setNewTarget(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--color-text-muted)]">Rest After Station:</label>
              <input
                type="number"
                min="0"
                value={newRest}
                onChange={(e) => setNewRest(parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs"
              />
              <span className="text-xs text-[var(--color-text-muted)]">seconds</span>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 text-xs font-semibold hover:bg-[var(--color-accent)] hover:text-black transition-colors"
            >
              + Add Station
            </button>
          </div>
        </form>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleStartCircuit}
          disabled={loading || stations.length === 0}
          className="rounded-2xl bg-[var(--color-accent)] px-8 py-3 text-sm font-black text-black shadow-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Initializing Session...' : '🚀 Start Circuit Session →'}
        </button>
      </div>
    </div>
  );
}
