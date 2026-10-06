import { useState, useEffect } from 'react'

type Step = 1 | 2

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

interface FieldError {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreeToTerms?: string
}

export default function RegisterPage() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('revora-theme')
    if (saved !== null) return saved === 'dark'
    return true
  })

  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<FieldError>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('revora-theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    setErrors({ ...errors, [name]: undefined })
  }

  // ── Password strength ────────────────────────────────────────────────────
  const getStrength = (pw: string): { score: number; label: string; color: string } => {
    let score = 0
    if (pw.length >= 8)           score++
    if (/[A-Z]/.test(pw))         score++
    if (/[0-9]/.test(pw))         score++
    if (/[^A-Za-z0-9]/.test(pw))  score++
    const map = [
      { label: '',        color: 'bg-zinc-700' },
      { label: 'Weak',    color: 'bg-red-500'    },
      { label: 'Fair',    color: 'bg-amber-400'  },
      { label: 'Good',    color: 'bg-blue-400'   },
      { label: 'Strong',  color: 'bg-emerald-400'},
    ]
    return { score, ...map[score] }
  }

  const strength = getStrength(form.password)

  // ── Validation ───────────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: FieldError = {}
    if (!form.fullName.trim())
      errs.fullName = 'Full name is required.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address.'
    if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.'
    if (!form.agreeToTerms)
      errs.agreeToTerms = 'You must agree to the terms.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: call POST /api/auth/register
    await new Promise((r) => setTimeout(r, 1400))
    setLoading(false)
    // On success: redirect to /dashboard or /login
  }

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google/login`
  }

  // ── Shared input class ───────────────────────────────────────────────────
  const inputCls = (field: keyof FieldError) =>
    `w-full px-4 py-3 rounded-xl text-sm transition-all
     text-zinc-900 dark:text-white
     placeholder:text-zinc-400 dark:placeholder:text-zinc-600
     focus:outline-none focus:ring-2 transition-all
     ${errors[field]
       ? 'border border-red-500/60 bg-red-500/5 focus:border-red-500/60 focus:ring-red-500/10'
       : 'border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-orange-500/60 focus:ring-orange-500/15'
     }`

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-white
                    font-sans antialiased transition-colors duration-300 flex">

      {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] min-h-screen
                      bg-zinc-900 dark:bg-[#111114] border-r border-white/5 p-12 relative overflow-hidden">

        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full
                        bg-[radial-gradient(ellipse,rgba(255,107,33,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full
                        bg-[radial-gradient(ellipse,rgba(255,107,33,0.08),transparent_70%)] pointer-events-none" />

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

        {/* Middle */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          border border-orange-500/30 bg-orange-500/10 mb-8
                          text-xs font-medium text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Join Filipino riders
          </div>

          <h2 className="font-extrabold tracking-tighter text-4xl text-white leading-[1.08] mb-5">
            Build your<br />
            <span className="text-orange-500">digital garage.</span>
          </h2>
          <p className="text-sm font-light text-zinc-400 leading-relaxed max-w-xs mb-10">
            Start tracking your motorcycle's maintenance, fuel economy, and expenses in one clean dashboard.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-3">
            {[
              { icon: '🔩', text: 'Track all maintenance services' },
              { icon: '⛽', text: 'Monitor km/L and fuel costs' },
              { icon: '🔔', text: 'Never miss PMS or LTO renewal' },
              { icon: '📊', text: 'See your full ownership expenses' },
              { icon: '🏍️', text: 'Multi-bike garage support' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20
                                flex items-center justify-center text-sm shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm text-zinc-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-[11px] text-zinc-600">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500 no-underline hover:text-orange-400">Sign in →</a>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5
                        border-b border-zinc-100 dark:border-white/5">
          <a href="/" className="lg:hidden flex items-center gap-2 no-underline">
            <img src="/Logo.png" alt="Revora" className="h-8 w-auto" />
            <span className="font-extrabold tracking-widest text-base text-zinc-900 dark:text-white">REVORA</span>
          </a>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <button onClick={() => setDark(!dark)}
                    className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-white/10
                               bg-zinc-100 dark:bg-white/5
                               flex items-center justify-center text-base
                               hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer">
              {dark ? '☀️' : '🌙'}
            </button>
            <span className="text-sm text-zinc-400 dark:text-zinc-500 hidden sm:block">Have an account?</span>
            <a href="/login"
               className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-white/10
                          text-zinc-900 dark:text-white text-sm font-medium
                          hover:bg-zinc-100 dark:hover:bg-white/5 transition-all no-underline">
              Sign in
            </a>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12">
          <div className="w-full max-w-md">

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {([1, 2] as Step[]).map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${step >= s
                                      ? 'bg-orange-500 text-black'
                                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500'}`}>
                      {step > s ? '✓' : s}
                    </div>
                    {s < 2 && (
                      <div className={`h-px w-16 transition-all ${step > s ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                    )}
                  </div>
                ))}
                <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                  Step {step} of 2 — {step === 1 ? 'Account details' : 'Review & confirm'}
                </span>
              </div>

              <h1 className="font-extrabold tracking-tighter text-3xl sm:text-4xl
                             text-zinc-900 dark:text-white mb-2">
                {step === 1 ? 'Create your account' : 'Almost there!'}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                {step === 1
                  ? 'Fill in your details to get started for free.'
                  : 'Review your info and confirm your account.'}
              </p>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                {/* Google OAuth */}
                <button onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3
                                   py-3 rounded-xl border border-zinc-200 dark:border-white/10
                                   bg-white dark:bg-white/5
                                   text-zinc-900 dark:text-white text-sm font-medium
                                   hover:bg-zinc-50 dark:hover:bg-white/8 transition-all
                                   cursor-pointer mb-5 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-white/8" />
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">or register with email</span>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-white/8" />
                </div>

                <form onSubmit={handleStep1} className="flex flex-col gap-4">
                  {/* Full name */}
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider
                                      text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Juan dela Cruz"
                      className={inputCls('fullName')}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-400 mt-1.5">{errors.fullName}</p>
                    )}
                  </div>

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
                      className={inputCls('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider
                                      text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        className={inputCls('password')}
                      />
                      <button type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2
                                         text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
                                         transition-colors cursor-pointer text-lg">
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {form.password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i}
                                 className={`h-1 flex-1 rounded-full transition-all duration-300
                                             ${strength.score >= i ? strength.color : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                          ))}
                        </div>
                        {strength.label && (
                          <p className="text-[11px] text-zinc-400">{strength.label} password</p>
                        )}
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider
                                      text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className={inputCls('confirmPassword')}
                      />
                      <button type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 -translate-y-1/2
                                         text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
                                         transition-colors cursor-pointer text-lg">
                        {showConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {form.confirmPassword.length > 0 && (
                      <p className={`text-[11px] mt-1.5 ${form.password === form.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                        {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={form.agreeToTerms}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 rounded border-zinc-300 dark:border-white/20
                                   accent-orange-500 cursor-pointer shrink-0"
                      />
                      <span className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        I agree to the{' '}
                        <a href="/terms" className="text-orange-500 hover:text-orange-400 no-underline font-medium">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-orange-500 hover:text-orange-400 no-underline font-medium">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-xs text-red-400 mt-1.5 ml-7">{errors.agreeToTerms}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-orange-500 text-black font-bold text-sm
                               hover:bg-orange-400 hover:-translate-y-0.5 transition-all cursor-pointer mt-1
                               shadow-[0_0_30px_rgba(255,107,33,0.25)]">
                    Continue →
                  </button>
                </form>
              </>
            )}

            {/* ── STEP 2 — Review ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Review card */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10
                                rounded-2xl p-5 flex flex-col gap-4">
                  <div className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mb-1">
                    Account summary
                  </div>

                  {[
                    { label: 'Full name',  value: form.fullName },
                    { label: 'Email',      value: form.email    },
                    { label: 'Password',   value: '••••••••'    },
                    { label: 'Role',       value: 'Rider (user)'},
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between
                                                   py-2.5 border-b border-zinc-100 dark:border-white/5
                                                   last:border-0 last:pb-0">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">{r.label}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* Info note */}
                <div className="flex items-start gap-3 p-4 rounded-xl
                                bg-orange-500/8 border border-orange-500/20">
                  <span className="text-orange-500 text-lg shrink-0">💡</span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    After registration you can add your motorcycle profile from the dashboard. Your account starts on the free plan — no credit card required.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 rounded-xl border border-zinc-200 dark:border-white/10
                               text-zinc-900 dark:text-white text-sm font-medium
                               hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer">
                    ← Edit info
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-xl bg-orange-500 text-black font-bold text-sm
                               hover:bg-orange-400 hover:-translate-y-0.5
                               disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                               transition-all cursor-pointer
                               shadow-[0_0_30px_rgba(255,107,33,0.25)]">
                    {loading
                      ? <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Creating...
                        </span>
                      : 'Create Account'}
                  </button>
                </div>

                <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
                  Already have an account?{' '}
                  <a href="/login"
                     className="text-orange-500 font-semibold hover:text-orange-400 transition-colors no-underline">
                    Sign in →
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-4 border-t border-zinc-100 dark:border-white/5
                        text-center text-xs text-zinc-400 dark:text-zinc-600">
          © 2025 Revora. Built for Filipino riders.
        </div>
      </div>
    </div>
  )
}