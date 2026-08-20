import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getProgressOverview, logMeasurement, getStrengthTrend, type ProgressOverview, type DataPoint } from '../features/progress/progressApi';
import { getExercises, type Exercise } from '../features/exercises/exerciseApi';

function getAccent() {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#a3e635';
}

export default function ProgressPage() {
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [strengthTrend, setStrengthTrend] = useState<DataPoint[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [chestInput, setChestInput] = useState('');

  function loadOverview() {
    getProgressOverview(90).then(setOverview);
  }

  useEffect(() => {
    loadOverview();
    getExercises({ size: 100 }).then((data) => setExercises(data.content));
  }, []);

  useEffect(() => {
    if (!selectedExerciseId) { setStrengthTrend([]); return; }
    getStrengthTrend(selectedExerciseId).then(setStrengthTrend);
  }, [selectedExerciseId]);

  async function handleLogMeasurement() {
    await logMeasurement({
      weightKg: weightInput ? Number(weightInput) : undefined,
      waistCm: waistInput ? Number(waistInput) : undefined,
      chestCm: chestInput ? Number(chestInput) : undefined,
    });
    setWeightInput(''); setWaistInput(''); setChestInput('');
    setShowLogForm(false);
    loadOverview();
  }

  if (!overview) return <div className="p-8">Loading...</div>;

  const accent = getAccent();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Progress</h1>
        <button onClick={() => setShowLogForm((v) => !v)} className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold">
          + Log Measurement
        </button>
      </div>

      {showLogForm && (
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:grid-cols-4">
          <input type="number" placeholder="Weight (kg)" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="rounded border px-3 py-2" />
          <input type="number" placeholder="Waist (cm)" value={waistInput} onChange={(e) => setWaistInput(e.target.value)} className="rounded border px-3 py-2" />
          <input type="number" placeholder="Chest (cm)" value={chestInput} onChange={(e) => setChestInput(e.target.value)} className="rounded border px-3 py-2" />
          <button onClick={handleLogMeasurement} className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-black">Save</button>
        </div>
      )}

      {/* Weight card */}
      <ChartCard
        title="Weight"
        subtitle={overview.weightChangeKg !== null
          ? `${overview.weightChangeKg > 0 ? '↑' : '↓'} ${Math.abs(overview.weightChangeKg).toFixed(1)}kg over this period`
          : 'Log at least 2 entries to see your trend'}
        data={overview.weightTrend}
        color={accent}
        unit="kg"
        emptyMessage="No weight entries yet — log your first measurement above."
      />

      {/* Strength card */}
      <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Strength (Estimated 1RM)</h3>
          <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)} className="rounded border bg-[var(--color-surface)] border-[var(--color-border)] px-2 py-1 text-sm outline-none">
            <option value="">Select an exercise...</option>
            {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
        </div>
        {selectedExerciseId ? (
          <TrendChart data={strengthTrend} color="#3b82f6" unit="kg" emptyMessage="No sets logged for this exercise yet." />
        ) : (
          <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">Pick an exercise to see your strength trend.</p>
        )}
      </div>

      {/* Volume card */}
      <ChartCard
        title="Workout Volume"
        subtitle="Total weight × reps per session"
        data={overview.volumeTrend}
        color="#a855f7"
        unit="kg"
        emptyMessage="No workout volume logged yet."
      />

      {/* Calories card */}
      <ChartCard
        title="Calories"
        subtitle="Daily total intake"
        data={overview.calorieTrend}
        color="#f97316"
        unit="kcal"
        emptyMessage="No meals logged yet."
      />

      {/* Latest measurements table */}
      {overview.latestMeasurement && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="mb-3 font-semibold">Latest Measurements</h3>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <MeasureStat label="Weight" value={overview.latestMeasurement.weightKg} unit="kg" />
            <MeasureStat label="Body Fat" value={overview.latestMeasurement.bodyFatPct} unit="%" />
            <MeasureStat label="Chest" value={overview.latestMeasurement.chestCm} unit="cm" />
            <MeasureStat label="Waist" value={overview.latestMeasurement.waistCm} unit="cm" />
            <MeasureStat label="Arms" value={overview.latestMeasurement.armsCm} unit="cm" />
            <MeasureStat label="Neck" value={overview.latestMeasurement.neckCm} unit="cm" />
            <MeasureStat label="Thigh" value={overview.latestMeasurement.thighCm} unit="cm" />
            <MeasureStat label="Calves" value={overview.latestMeasurement.calvesCm} unit="cm" />
          </div>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            Last updated {new Date(overview.latestMeasurement.loggedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, data, color, unit, emptyMessage }: {
  title: string; subtitle: string; data: DataPoint[]; color: string; unit: string; emptyMessage: string;
}) {
  return (
    <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mb-3 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
      <TrendChart data={data} color={color} unit={unit} emptyMessage={emptyMessage} />
    </div>
  );
}

function TrendChart({ data, color, unit, emptyMessage }: {
  data: DataPoint[]; color: string; unit: string; emptyMessage: string;
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
        <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8 }}
          formatter={(value: number) => [`${value}${unit}`, '']}
          labelFormatter={(d) => new Date(d).toLocaleDateString()}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MeasureStat({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div>
      <div className="text-lg font-bold">{value !== null ? `${value}${unit}` : '—'}</div>
      <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
    </div>
  );
}
