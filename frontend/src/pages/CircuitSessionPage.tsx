import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCircuit, logStation, completeCircuit, type CircuitSession } from '../features/circuit/circuitApi';

export default function CircuitSessionPage() {
  const { id } = useParams<{ id: string }>();

  const [session, setSession] = useState<CircuitSession | null>(null);
  const [activeStationIndex, setActiveStationIndex] = useState(0);
  const [actualValue, setActualValue] = useState<string>('');
  const [actualNotes, setActualNotes] = useState<string>('');
  const [overallNotes, setOverallNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // Rest timer
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const timerRef = useRef<any>(null);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id]);

  async function fetchSession() {
    if (!id) return;
    try {
      const data = await getCircuit(id);
      setSession(data);
      // Auto-set first unlogged station
      const firstUnlogged = data.stations.findIndex((s) => s.actualValue === null || s.actualValue === undefined);
      if (firstUnlogged !== -1 && data.status !== 'completed') {
        setActiveStationIndex(firstUnlogged);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch circuit session.');
    } finally {
      setLoading(false);
    }
  }

  // 3-second Polling for AI report once completed
  useEffect(() => {
    if (session?.status === 'completed' && !session.aiReport && !polling && id) {
      setPolling(true);
      pollRef.current = setInterval(async () => {
        try {
          const updated = await getCircuit(id);
          setSession(updated);
          if (updated.aiReport) {
            setPolling(false);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch (e) {
          // ignore transient poll error
        }
      }, 3000);
    }

    return () => {
      if (session?.aiReport && pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [session, id, polling]);

  async function handleLogStation() {
    if (!session || !id) return;
    const currentStation = session.stations[activeStationIndex];
    if (!currentStation) return;

    setActionLoading(true);
    setError(null);

    try {
      const val = actualValue.trim() !== '' ? parseInt(actualValue) : currentStation.plannedTarget;
      const updated = await logStation(id, currentStation.id, {
        actualValue: val,
        actualNotes: actualNotes.trim() || undefined,
      });

      setSession(updated);
      setActualValue('');
      setActualNotes('');

      // Start rest timer if planned
      if (currentStation.plannedRestSeconds > 0) {
        startRestTimer(currentStation.plannedRestSeconds);
      }

      // Advance station
      if (activeStationIndex < session.stations.length - 1) {
        setActiveStationIndex(activeStationIndex + 1);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to log station execution.');
    } finally {
      setActionLoading(false);
    }
  }

  function startRestTimer(seconds: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setRestSecondsLeft(seconds);

    timerRef.current = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleCompleteSession() {
    if (!id) return;
    setActionLoading(true);
    setError(null);

    try {
      const updated = await completeCircuit(id, overallNotes.trim() || undefined);
      setSession(updated);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to complete circuit session.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-3xl animate-bounce">⚡</div>
          <div className="text-sm font-semibold text-[var(--color-text-muted)]">Loading circuit session...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-400">Circuit Session Not Found</h2>
        <Link to="/circuits/new" className="text-sm text-[var(--color-accent)] underline">
          ← Build a new circuit
        </Link>
      </div>
    );
  }

  const isCompleted = session.status === 'completed';
  const currentStation = session.stations[activeStationIndex];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
              }`}
            >
              {session.status}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">{session.sessionDate}</span>
          </div>
          <h1 className="text-3xl font-black mt-1">{session.title}</h1>
          {session.overallNotes && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{session.overallNotes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to="/circuits/new"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold hover:bg-[var(--color-card)]"
          >
            + New Circuit
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Rest Timer Active Banner */}
      {restSecondsLeft !== null && restSecondsLeft > 0 && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <div className="font-bold text-sm text-yellow-400">Station Rest Interval</div>
              <div className="text-xs text-[var(--color-text-muted)]">Catch your breath before the next station!</div>
            </div>
          </div>
          <div className="text-2xl font-black text-yellow-400 font-mono">{restSecondsLeft}s</div>
        </div>
      )}

      {/* AI Report Scorecard (If Completed) */}
      {isCompleted && (
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h2 className="text-lg font-black">Gemini AI Circuit Evaluation</h2>
            </div>
            {session.aiReport && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Evaluated: {new Date(session.aiReport.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {!session.aiReport ? (
            <div className="py-8 text-center space-y-3">
              <div className="text-4xl animate-spin inline-block">⚡</div>
              <h3 className="font-bold text-base">Analyzing Session Performance...</h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                Gemini AI is evaluating your station work/rest pacing, target adherence, and metabolic structure.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                  <div className="text-3xl font-black text-[var(--color-accent)]">
                    {session.aiReport.overallScore}
                    <span className="text-sm font-normal text-[var(--color-text-muted)]">/100</span>
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                    Overall Score
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                  <div className="text-3xl font-black text-blue-400">
                    {session.aiReport.planQualityScore}
                    <span className="text-sm font-normal text-[var(--color-text-muted)]">/100</span>
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                    Plan Quality
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                  <div className="text-3xl font-black text-emerald-400">
                    {session.aiReport.adherenceScore}
                    <span className="text-sm font-normal text-[var(--color-text-muted)]">/100</span>
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                    Adherence
                  </div>
                </div>
              </div>

              {/* Feedback Summary */}
              <div className="rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-1">
                  AI Coach Summary & Recommendations
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-text)]">{session.aiReport.summaryFeedback}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Logger (When Planned/In-Progress) */}
      {!isCompleted && currentStation && (
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-black font-black text-base">
                #{currentStation.orderIndex}
              </span>
              <div>
                <div className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Active Station</div>
                <h2 className="text-2xl font-extrabold">{currentStation.stationName}</h2>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--color-text-muted)]">Target</div>
              <div className="text-lg font-black text-[var(--color-accent)]">
                {currentStation.plannedTarget} {currentStation.plannedType === 'time' ? 'Sec' : 'Reps'}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Actual {currentStation.plannedType === 'time' ? 'Time (Seconds)' : 'Reps Completed'}
              </label>
              <input
                type="number"
                placeholder={currentStation.plannedTarget.toString()}
                value={actualValue}
                onChange={(e) => setActualValue(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Station Notes / RPE</label>
              <input
                type="text"
                placeholder="e.g. Unbroken, felt light"
                value={actualNotes}
                onChange={(e) => setActualNotes(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {session.stations.map((st, i) => (
                <button
                  key={st.id}
                  onClick={() => setActiveStationIndex(i)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold ${
                    i === activeStationIndex
                      ? 'bg-[var(--color-accent)] text-black'
                      : st.actualValue !== null
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogStation}
              disabled={actionLoading}
              className="rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-black text-black shadow hover:opacity-90 transition-opacity"
            >
              {actionLoading ? 'Saving...' : 'Log & Next Station →'}
            </button>
          </div>
        </div>
      )}

      {/* Station Execution History Table */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4">
        <h3 className="text-base font-bold">Station Breakdown ({session.stations.length})</h3>
        <div className="divide-y divide-[var(--color-border)]">
          {session.stations.map((st) => (
            <div key={st.id} className="py-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-[var(--color-text-muted)]">#{st.orderIndex}</span>
                <div>
                  <span className="font-semibold">{st.stationName}</span>
                  {st.actualNotes && (
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">({st.actualNotes})</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[var(--color-text-muted)]">Plan: </span>
                  <span className="font-bold">{st.plannedTarget} {st.plannedType}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Actual: </span>
                  <span className={`font-black ${st.actualValue !== null ? 'text-green-400' : 'text-[var(--color-text-muted)]'}`}>
                    {st.actualValue !== null ? `${st.actualValue} ${st.plannedType}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Box */}
      {!isCompleted && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Finish Circuit</h3>
          <textarea
            placeholder="Overall circuit session notes / fatigue reflections (Optional)..."
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            rows={2}
          />
          <div className="flex justify-end">
            <button
              onClick={handleCompleteSession}
              disabled={actionLoading}
              className="rounded-xl bg-green-500 px-8 py-3 text-sm font-black text-black shadow-lg hover:bg-green-400 transition-colors"
            >
              {actionLoading ? 'Completing...' : '🏁 Complete Circuit & Get AI Score'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
