import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import WorkoutSessionPage from './pages/WorkoutSessionPage';
import ManageSplitsPage from './pages/ManageSplitsPage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
import NutritionPage from './pages/NutritionPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-4xl p-4 flex gap-4 flex-wrap">
        <Link to="/dashboard" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Dashboard
        </Link>
        <Link to="/splits" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Split Planner
        </Link>
        <Link to="/history" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Workout History
        </Link>
        <Link to="/nutrition" className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-semibold text-center hover:bg-[var(--color-card)] transition">
          Go to Nutrition Tracker
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
      <Outlet />
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/splits" element={<ManageSplitsPage />} />
          <Route path="/history" element={<WorkoutHistoryPage />} />
          <Route path="/workout" element={<WorkoutSessionPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
