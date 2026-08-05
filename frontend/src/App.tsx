import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './routes/ProtectedRoute';

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
