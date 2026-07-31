import { useState, useEffect, FormEvent } from 'react';
import {
  getProfile,
  updateProfile,
  type ProfileData,
  type ProfileRequest,
} from '../features/profile/profileApi';
import ThemeToggle from '../components/ThemeToggle';

const emptyForm: ProfileRequest = {
  age: 0,
  heightCm: 0,
  weightKg: 0,
  gender: 'male',
  goal: 'maintain',
  activityLevel: 'moderate',
  experienceLevel: 'beginner',
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileRequest>(emptyForm);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        // Pre-fill the form with existing data
        setForm({
          age: data.age,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          gender: data.gender,
          goal: data.goal,
          activityLevel: data.activityLevel,
          experienceLevel: data.experienceLevel,
        });
      })
      .catch(() => {
        // No profile yet — first-time onboarding; keep empty form, no error shown.
        // A missing profile is the expected starting state, not an error condition.
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile(form);
      // updateProfile returns the full profile + freshly-recalculated targets —
      // no separate GET needed after saving
      setProfile(updated);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              id="profile-age"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              id="profile-gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input
              id="profile-height"
              type="number"
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              id="profile-weight"
              type="number"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Goal</label>
            <select
              id="profile-goal"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cut">Cut (Fat Loss)</option>
              <option value="maintain">Maintain</option>
              <option value="bulk">Bulk (Muscle Gain)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Activity Level</label>
            <select
              id="profile-activity"
              value={form.activityLevel}
              onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Experience Level</label>
            <select
              id="profile-experience"
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <button
          id="profile-save-btn"
          type="submit"
          disabled={saving}
          className="w-full rounded bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Targets Card — only shown after the first successful save */}
      {profile && (
        <div className="rounded-lg bg-green-50 p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Your Daily Targets</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat label="Calories" value={profile.targets.calories} unit="kcal" />
            <Stat label="Protein" value={profile.targets.proteinGrams} unit="g" />
            <Stat label="Carbs" value={profile.targets.carbsGrams} unit="g" />
            <Stat label="Fat" value={profile.targets.fatGrams} unit="g" />
            <Stat label="Water" value={profile.targets.waterLitres} unit="L" />
            <Stat label="BMI" value={profile.targets.bmi} unit="" />
          </div>
          <div className="mt-4 border-t border-green-200 pt-4 grid grid-cols-2 gap-4 text-center text-sm text-gray-600">
            <div>
              <span className="font-medium">BMR:</span> {profile.targets.bmr} kcal
            </div>
            <div>
              <span className="font-medium">TDEE:</span> {profile.targets.tdee} kcal
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm">
      <div className="text-2xl font-bold text-gray-900">
        {value}
        {unit}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
