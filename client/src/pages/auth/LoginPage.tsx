import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('revora-theme')
    if (saved !== null) return saved === 'dark'
    return true
  })

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('revora-theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    // TODO: call POST /api/auth/login
    await new Promise((r) => setTimeout(r, 1200)) // simulate
    setLoading(false)
    setError('Invalid email or password.') // placeholder
  }

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google/login`
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-white
                    font-sans antialiased transition-colors duration-300 flex">

      {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] min-h-screen
                      bg-zinc-900 dark:bg-[#111114] border-r border-white/5 p-12 relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full
                        bg-[radial-gradient(ellipse,rgba(255,107,33,0.15),transparent_70%)]
                        pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full
                        bg-[radial-gradient(ellipse,rgba(255,107,33,0.08),transparent_70%)]
                        pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-3 no-underline">
            <img src="/Logo.png" alt="Revora" className="h-10 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-extrabold tracking-widest text-white">REVORA</span>
              <span className="text-[10px] font-semibold tracking-[.18em] text-orange-500 mt-0.5">RIDE SMARTER</span>
            </div>
          </a>
        </div>

        {/* Middle content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          border border-orange-500/30 bg-orange-500/10 mb-8
                          text-xs font-medium text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Your Digital Garage
          </div>

          <h2 className="font-extrabold tracking-tighter text-4xl text-white leading-[1.08] mb-5">
            Welcome back,<br />
            <span className="text-orange-500">rider.</span>
          </h2>
          <p className="text-sm font-light text-zinc-400 leading-relaxed max-w-xs mb-10">
            Track maintenance, fuel economy, and expenses — all in one premium dashboard built for Filipino riders.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Avg km/L saved',   value: '8.4',   color: 'text-emerald-400' },
              { label: 'PMS never missed', value: '100%',  color: 'text-orange-500'  },
              { label: 'Riders tracking',  value: '1,200+',color: 'text-white'        },
              { label: 'Logs recorded',    value: '14k+',  color: 'text-white'        },
            ].map((s) => (
              <div key={s.label}
                   className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className={`font-extrabold text-xl ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bike pills */}
        <div className="relative z-10">
          <div className="text-[11px] text-zinc-600 mb-3">Built for</div>
          <div className="flex flex-wrap gap-2">
            {['NMAX 155', 'Honda ADV', 'Aerox', 'Click 160', 'Mio i 125'].map((b) => (
              <span key={b}
                    className="px-3 py-1 rounded-full border border-white/10 bg-white/5
                               text-xs text-zinc-400">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5
                        border-b border-zinc-100 dark:border-white/5">
          {/* Mobile logo */}
          <a href="/" className="lg:hidden flex items-center gap-2 no-underline">
            <img src="/Logo.png" alt="Revora" className="h-8 w-auto" />
            <span className="font-extrabold tracking-widest text-base text-zinc-900 dark:text-white">REVORA</span>
          </a>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button onClick={() => setDark(!dark)}
                    className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-white/10
                               bg-zinc-100 dark:bg-white/5
                               flex items-center justify-center text-base
                               hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer">
              {dark ? '☀️' : '🌙'}
            </button>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">No account?</span>
            <a href="/register"
               className="px-4 py-2 rounded-lg bg-orange-500 text-black text-sm font-semibold
                          hover:bg-orange-400 transition-all no-underline
                          shadow-[0_0_16px_rgba(255,107,33,0.3)]">
              Sign up
            </a>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="font-extrabold tracking-tighter text-3xl sm:text-4xl
                             text-zinc-900 dark:text-white mb-2">
                Sign in
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                Enter your credentials to access your garage.
              </p>
            </div>

            {/* Google OAuth */}
            <button onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3
                               py-3 rounded-xl border border-zinc-200 dark:border-white/10
                               bg-white dark:bg-white/5
                               text-zinc-900 dark:text-white text-sm font-medium
                               hover:bg-zinc-50 dark:hover:bg-white/8 transition-all
                               cursor-pointer mb-6 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-white/8" />
              <span className="text-xs text-zinc-400 dark:text-zinc-600">or sign in with email</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-white/8" />
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5
                              bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <span className="shrink-0">⚠️</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider
                                  text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@email.com"
                  className="w-full px-4 py-3 rounded-xl
                             border border-zinc-200 dark:border-white/10
                             bg-white dark:bg-white/5
                             text-zinc-900 dark:text-white text-sm
                             placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                             focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15
                             transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold tracking-wider
                                    text-zinc-500 dark:text-zinc-400 uppercase">
                    Password
                  </label>
                  <a href="/forgot-password"
                     className="text-[11px] font-semibold text-orange-500
                                hover:text-orange-400 transition-colors no-underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl
                               border border-zinc-200 dark:border-white/10
                               bg-white dark:bg-white/5
                               text-zinc-900 dark:text-white text-sm
                               placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                               focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15
                               transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
                               transition-colors cursor-pointer text-lg">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-orange-500 text-black font-bold text-sm
                           hover:bg-orange-400 hover:-translate-y-0.5
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                           transition-all cursor-pointer mt-1
                           shadow-[0_0_30px_rgba(255,107,33,0.25)]">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Signing in...
                    </span>
                  : 'Sign in'}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 mt-6">
              Don't have an account?{' '}
              <a href="/register"
                 className="text-orange-500 font-semibold hover:text-orange-400 transition-colors no-underline">
                Create one →
              </a>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="px-6 sm:px-10 py-4 border-t border-zinc-100 dark:border-white/5
                        text-center text-xs text-zinc-400 dark:text-zinc-600">
          © 2025 Revora. Built for Filipino riders.
        </div>
      </div>
    </div>
  )
}