import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const FEATURES = [
  { icon: '🏋️', title: 'Workout Tracking', desc: 'Log workouts, sets, reps, and track your strength progress over time.' },
  { icon: '🥗', title: 'Nutrition & Meals', desc: 'Track calories & macros, get meal suggestions and plan your diet.' },
  { icon: '🧠', title: 'AI Coach', desc: 'Get AI-powered insights, workout suggestions and smart recommendations.' },
  { icon: '📈', title: 'Progress Analytics', desc: 'Visualize your progress with advanced charts and analytics.' },
  { icon: '🔥', title: 'Habit & Streaks', desc: 'Build consistency with daily streaks and habit tracking.' },
  { icon: '🔔', title: 'Reminders', desc: 'Never miss a workout or meal with smart reminders.' },
];

const STATS = [
  { value: '50K+', label: 'Active Users' },
  { value: '1M+', label: 'Workouts Logged' },
  { value: '10M+', label: 'Meals Logged' },
  { value: '4.9★', label: 'App Rating' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2 text-lg font-bold">
          <img src="/logo.png" alt="GymBro" className="h-8 w-8" />
          GYM<span className="text-[var(--color-accent)]">BRO</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-[var(--color-text-muted)] md:flex">
          <a href="#features" className="hover:text-[var(--color-text)]">Features</a>
          <a href="#how-it-works" className="hover:text-[var(--color-text)]">How It Works</a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm">
            Log In
          </Link>
          <Link to="/register" className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-text)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 pb-20 pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">
            Your Fitness. Our Mission.
            <br />
            <span className="text-[var(--color-accent)]">Stronger You.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--color-text-muted)]">
            GymBro is your all-in-one fitness companion. Track workouts, nutrition, and progress.
            Get AI-powered insights to become your best self.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-semibold text-[var(--color-accent-text)]"
            >
              Start Your Journey →
            </Link>
            <button className="rounded-lg border border-[var(--color-border)] px-6 py-3 font-semibold">
              ▶ Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Powerful features to help you train smarter, eat better, and track every step of your journey.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-left"
              >
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-[var(--color-border)] px-8 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-[var(--color-accent)]">{s.value}</div>
              <div className="mt-1 text-sm text-[var(--color-text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--color-border)] px-8 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 rounded-2xl bg-[var(--color-surface)] p-10 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-2xl font-bold">Ready to transform your life?</h3>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Join GymBro today and take the first step towards a stronger, healthier you.
            </p>
          </div>
          <Link
            to="/register"
            className="whitespace-nowrap rounded-lg bg-[var(--color-accent)] px-6 py-3 font-semibold text-[var(--color-accent-text)]"
          >
            Get Started for Free →
          </Link>
        </div>
      </section>
    </div>
  );
}
