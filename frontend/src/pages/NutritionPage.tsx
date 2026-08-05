import { useState, useEffect } from 'react';
import {
  searchFoods, logMeal, getDailySummary, deleteMeal,
  toggleFavorite, getFavorites, getRecentFoods, logWater,
  type Food, type DailySummary,
} from '../features/nutrition/nutritionApi';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const WATER_QUICK_ADD = [250, 500, 750];

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

export default function NutritionPage() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [favorites, setFavorites] = useState<Food[]>([]);
  const [recent, setRecent] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('');
  const [mealType, setMealType] = useState('breakfast');

  function loadAll() {
    getDailySummary(todayIso()).then(setSummary);
    getFavorites().then(setFavorites);
    getRecentFoods().then(setRecent);
  }

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (searchTerm.length < 2) { setResults([]); return; }
    const timeout = setTimeout(() => searchFoods(searchTerm).then(setResults), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  async function handleLog() {
    if (!selectedFood || !quantity) return;
    await logMeal(selectedFood.id, mealType, Number(quantity));
    setSelectedFood(null);
    setSearchTerm('');
    setResults([]);
    setQuantity('');
    loadAll();
  }

  async function handleDelete(mealId: string) {
    await deleteMeal(mealId);
    loadAll();
  }

  async function handleFavorite(foodId: string) {
    await toggleFavorite(foodId);
    getFavorites().then(setFavorites);
  }

  async function handleWater(ml: number) {
    await logWater(ml);
    getDailySummary(todayIso()).then(setSummary);
  }

  function isFavorited(foodId: string) {
    return favorites.some((f) => f.id === foodId);
  }

  function selectQuickFood(food: Food) {
    setSelectedFood(food);
    setSearchTerm(food.name);
    setResults([]);
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Nutrition</h1>

      {summary && (
        <div className="mb-6 grid grid-cols-5 gap-3 rounded-lg border p-4 text-center">
          <Stat label="Calories" value={summary.totalCalories} />
          <Stat label="Protein" value={summary.totalProtein} unit="g" />
          <Stat label="Carbs" value={summary.totalCarbs} unit="g" />
          <Stat label="Fat" value={summary.totalFat} unit="g" />
          <Stat label="Fiber" value={summary.totalFiber} unit="g" />
        </div>
      )}

      {/* Water Tracker */}
      <div className="mb-6 rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Water Intake</h3>
          <span className="text-sm text-gray-500">{((summary?.totalWaterMl ?? 0) / 1000).toFixed(1)}L today</span>
        </div>
        <div className="flex gap-2">
          {WATER_QUICK_ADD.map((ml) => (
            <button key={ml} onClick={() => handleWater(ml)} className="rounded border px-3 py-1 text-sm">
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      {/* Quick-add: Favorites & Recent */}
      {(favorites.length > 0 || recent.length > 0) && !selectedFood && (
        <div className="mb-6 space-y-3">
          {favorites.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-500">★ Favorites</h4>
              <div className="flex flex-wrap gap-2">
                {favorites.map((f) => (
                  <button key={f.id} onClick={() => selectQuickFood(f)} className="rounded-full border px-3 py-1 text-sm">
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {recent.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-500">Recent</h4>
              <div className="flex flex-wrap gap-2">
                {recent.map((f) => (
                  <button key={f.id} onClick={() => selectQuickFood(f)} className="rounded-full border px-3 py-1 text-sm">
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log a Meal */}
      <div className="mb-8 rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Log a Meal</h3>

        {!selectedFood ? (
          <div>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search foods (e.g. roti, chicken, dal)..."
              className="mb-2 w-full rounded border px-3 py-2"
            />
            {results.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded border">
                {results.map((f) => (
                  <div key={f.id} className="flex items-center justify-between border-b px-3 py-2 text-sm">
                    <button onClick={() => selectQuickFood(f)} className="text-left hover:underline">
                      {f.name} <span className="text-gray-500">({f.calories} kcal / {f.servingSize}{f.servingUnit})</span>
                    </button>
                    <button onClick={() => handleFavorite(f.id)} className={isFavorited(f.id) ? 'text-yellow-500' : 'text-gray-300'}>
                      ★
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between rounded bg-[var(--color-surface)] px-3 py-2 text-sm">
              <span>{selectedFood.name}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => handleFavorite(selectedFood.id)} className={isFavorited(selectedFood.id) ? 'text-yellow-500' : 'text-gray-400'}>★</button>
                <button onClick={() => { setSelectedFood(null); setSearchTerm(''); }} className="text-red-500">✕</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Quantity (${selectedFood.servingUnit})`} className="rounded border px-3 py-2" />
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="rounded border px-3 py-2">
                {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button onClick={handleLog} className="mt-3 w-full rounded bg-[var(--color-accent)] py-2 font-semibold">
              Log Meal
            </button>
          </div>
        )}
      </div>

      {/* Meal Timeline, grouped */}
      <h3 className="mb-3 font-semibold">Today's Timeline</h3>
      <div className="space-y-5">
        {summary && MEAL_TYPES.map((type) => {
          const meals = summary.mealsByType[type] ?? [];
          if (meals.length === 0) return null;
          return (
            <div key={type}>
              <h4 className="mb-2 text-sm font-semibold capitalize text-gray-500">{type}</h4>
              <div className="space-y-2">
                {meals.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded border px-4 py-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-400">
                        {new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="ml-2 font-medium">{m.foodName}</span>
                      <span className="ml-2 text-gray-500">{m.quantity}{m.servingUnit} • {m.calories} kcal</span>
                    </div>
                    <button onClick={() => handleDelete(m.id)} className="text-red-500">✕</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {summary && Object.values(summary.mealsByType).every((arr) => arr.length === 0) && (
          <p className="text-gray-500">No meals logged today yet.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
  return (
    <div>
      <div className="text-xl font-bold">{value}{unit}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
