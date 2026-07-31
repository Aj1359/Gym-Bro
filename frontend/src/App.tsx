import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import ProtectedRoute from './routes/ProtectedRoute';
import WorkoutSessionPage from './pages/WorkoutSessionPage';
import ManageSplitsPage from './pages/ManageSplitsPage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';

function DashboardPlaceholder() {
  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard coming Day 10 👋</h1>
      <p className="text-[var(--color-text-muted)] mb-6">
        You are successfully logged in! In the meantime, try out the features we've built:
      </p>
      <div className="flex flex-col gap-3">
        <Link to="/splits" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Workout Splits
        </Link>
        <Link to="/history" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Workout History
        </Link>
        <Link to="/workout" className="p-4 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] font-semibold text-center hover:opacity-90 transition">
          Go to Workout Planner
        </Link>
        <Link to="/exercises" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Exercise Library
        </Link>
        <Link to="/profile" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Profile Setup
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/splits" element={<ManageSplitsPage />} />
          <Route path="/history" element={<WorkoutHistoryPage />} />
          <Route path="/workout" element={<WorkoutSessionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
