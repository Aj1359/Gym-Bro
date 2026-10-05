import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Track Workouts',
    desc: 'Log exercises, sets and see real progress.',
  },
  {
    icon: (
      <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: 'Nutrition Tracking',
    desc: 'Track calories and macros with ease.',
  },
  {
    icon: (
      <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'AI Insights',
    desc: 'Get personalized recommendations.',
  },
  {
    icon: (
      <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Build Healthy Habits',
    desc: 'Stay consistent and achieve your goals.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F1ED] text-black font-sans relative overflow-x-hidden">
      
      {/* Background Image Container */}
      <div className="absolute right-0 top-0 h-[90vh] w-full md:w-3/5 lg:w-2/3 xl:w-[60%] z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero_bg.jpg)' }}
        />
        {/* Gradient fade from left to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F1ED] via-[#F4F1ED]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F1ED] via-transparent to-transparent opacity-50" />
        {/* Gradient fade to bottom for seamless transition to features */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F4F1ED] to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tighter text-[#2A3B2A]">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10v4h2v-4H4zm14 0v4h2v-4h-2zm-8-3h4v10h-4V7zm-4 2h2v6H6V9zm10 0h2v6h-2V9z" />
            </svg>
            GYM<span className="text-[#5B7B5B]">BRO</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-black/70 md:flex">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-black transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 hover:bg-black/10 cursor-pointer transition-colors">
              <svg className="h-5 w-5 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <Link to="/login" className="rounded-lg border border-black/20 px-5 py-2.5 text-sm font-medium hover:bg-black/5 transition-colors bg-white">
              Log In
            </Link>
            <Link to="/register" className="flex items-center gap-2 rounded-lg bg-[#2A3B2A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2c1f] transition-colors shadow-lg">
              Get Started &rarr;
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-8 pb-12 pt-16 lg:pt-24 min-h-[75vh] flex items-center">
          <div className="flex w-full flex-col lg:flex-row lg:items-center">
            
            {/* Left Content */}
            <div className="max-w-xl lg:w-1/2">
              <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-black/50 uppercase">
                <span className="h-[1px] w-8 bg-black/50"></span>
                Discipline Today. A Stronger Tomorrow.
              </div>
              
              <h1 className="mt-8 text-6xl font-serif leading-[1.05] text-[#2A3B2A] md:text-[5.5rem] tracking-tight">
                Your Fitness.
                <br />
                Our Mission.
                <br />
                <span className="text-[#4A6B4A]">Stronger You.</span>
              </h1>
              
              <p className="mt-8 text-lg text-black/60 md:text-xl leading-relaxed max-w-md">
                GymBro is your all-in-one fitness companion. Track workouts, nutrition, and progress. Get AI-powered insights to become your best self.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#2A3B2A] px-8 py-4 font-semibold text-white hover:bg-[#1f2c1f] transition-colors shadow-xl"
                >
                  Start Your Journey &rarr;
                </Link>
                <button className="flex items-center justify-center gap-3 rounded-lg bg-white px-8 py-4 font-semibold text-black shadow-sm border border-black/5 hover:bg-gray-50 transition-colors">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2A3B2A] text-white pl-0.5">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5-7-5z" />
                    </svg>
                  </div>
                  Watch Demo
                </button>
              </div>

              <div className="mt-12 flex items-center gap-4 pb-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="h-10 w-10 rounded-full border-2 border-[#F4F1ED] object-cover" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-black/80">10,000+ fitness enthusiasts</div>
                  <div className="text-black/50">building a stronger tomorrow</div>
                </div>
              </div>
            </div>

            {/* Right Content / Floating Cards */}
            <div className="mt-16 relative lg:mt-0 lg:w-1/2 min-h-[500px] w-full">
              
              <div className="absolute right-4 top-0 font-['Brush_Script_MT',cursive] text-5xl text-white/90 rotate-[-12deg] hidden lg:block opacity-90 drop-shadow-lg" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                Better<br/>Stronger<br/>Consistent
                <div className="h-[2px] w-32 bg-[#D1E0B0] mt-2 ml-4"></div>
              </div>

              {/* Workout Card */}
              <div className="absolute left-0 top-16 w-72 rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Today's Workout
                  </div>
                  <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Bench Press', sets: '3 × 8 reps', active: true, img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=100&auto=format&fit=crop' },
                    { name: 'Lat Pulldown', sets: '3 × 10 reps', active: false, img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=100&auto=format&fit=crop' },
                    { name: 'Shoulder Press', sets: '3 × 12 reps', active: false, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=100&auto=format&fit=crop' },
                  ].map((ex) => (
                    <div key={ex.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-black/50 overflow-hidden flex items-center justify-center">
                           <img src={ex.img} alt={ex.name} className="h-full w-full object-cover opacity-80" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{ex.name}</div>
                          <div className="text-xs text-white/50">{ex.sets}</div>
                        </div>
                      </div>
                      {ex.active ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#94B866]">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-white/30"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition Card */}
              <div className="absolute left-20 bottom-0 lg:-bottom-10 w-[340px] rounded-2xl border border-white/20 bg-black/50 p-5 backdrop-blur-md text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Nutrition
                  </div>
                  <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Circular progress dummy */}
                  <div className="relative h-28 w-28 flex-shrink-0">
                    <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                      <path className="text-white/10" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-[#94B866]" strokeDasharray="80, 100" strokeWidth="3.5" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold">1,840</span>
                      <span className="text-[10px] text-white/60">/ 2,200 kcal</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 text-xs font-medium">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/70">Protein</span>
                        <span>120g</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#94B866] w-[75%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/70">Carbs</span>
                        <span>210g</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E5D06A] w-[60%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/70">Fats</span>
                        <span>70g</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C2B7A3] w-[40%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Chart Card */}
              <div className="absolute right-0 bottom-16 w-[320px] rounded-2xl border border-white/20 bg-black/40 p-5 backdrop-blur-md text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] hidden md:block">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Progress
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs border border-white/10">
                    This Month
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end gap-6">
                  {/* Bar Chart Dummy */}
                  <div className="flex h-16 flex-1 items-end gap-2 opacity-90">
                    {[35, 45, 30, 65, 45, 80, 95].map((h, i) => (
                      <div key={i} className="w-full rounded-t-sm bg-gradient-to-t from-[#94B866]/30 to-[#94B866]" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="pb-1 text-right">
                    <div className="flex items-center justify-end gap-1 text-2xl font-bold text-[#94B866]">
                      +12%
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                      </svg>
                    </div>
                    <div className="text-xs text-white/50 mt-1">Strength Increase</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Bottom Banner */}
        <section className="bg-white/80 border-t border-black/5">
          <div className="mx-auto max-w-7xl px-8 py-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-4 pr-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F4F1ED] border border-black/5 shadow-sm">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2A3B2A]">{f.title}</h3>
                    <p className="mt-1 text-sm text-black/60 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
