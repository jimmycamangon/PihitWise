import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'

// ── Nav items ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M2 10a8 8 0 1 1 16 0A8 8 0 0 1 2 10zm8-3a1 1 0 0 0-1 1v2a1 1 0 0 0 .553.894l2 1a1 1 0 0 0 .894-1.789L11 9.382V8a1 1 0 0 0-1-1z" />
      </svg>
    ),
  },
  {
    to: '/garage',
    label: 'My Garage',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M8 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM2.22 5.22a.75.75 0 0 1 1.06 0L5 6.94V3.75a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1 0-1.5h2.19L2.22 6.28a.75.75 0 0 1 0-1.06zM6.5 11a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 6.5 11zm-1.25-4a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9A.75.75 0 0 1 5.25 7z" />
      </svg>
    ),
  },
  {
    to: '/maintenance',
    label: 'Maintenance',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
        <path fillRule="evenodd" d="M14.5 10a4.5 4.5 0 0 0 4.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 0 1-.493.11 3.01 3.01 0 0 1-1.618-1.616.455.455 0 0 1 .11-.494l2.694-2.692c.24-.241.174-.647-.15-.752A4.502 4.502 0 0 0 10 5.5c0 .329.027.65.077.96l-5.551 5.554A3.5 3.5 0 1 0 9.96 16.51l.017-.017 5.533-5.532c.31.05.631.077.96.077l-.97-.038zM3.5 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/fuel',
    label: 'Fuel Logs',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13zm7.25 4.25a.75.75 0 0 0-1.5 0V10H7a.75.75 0 0 0 0 1.5h1.75v1.75a.75.75 0 0 0 1.5 0v-1.75H12a.75.75 0 0 0 0-1.5h-1.75V7.75z" />
      </svg>
    ),
  },
  {
    to: '/reminders',
    label: 'Reminders',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
        <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6zm0 14.5a2 2 0 0 1-1.95-1.557 33.54 33.54 0 0 0 3.9 0A2 2 0 0 1 10 16.5z" clipRule="evenodd" />
      </svg>
    ),
    badge: 2, // unread reminder count — wire to real data later
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2zM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6zM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10z" />
      </svg>
    ),
  },
]

const BOTTOM_NAV = NAV_ITEMS.slice(0, 5) // first 5 on mobile bottom nav

// ── Helpers ────────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('revora-theme')
    return saved !== null ? saved === 'dark' : true
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('revora-theme', dark ? 'dark' : 'light')
  }, [dark])
  return { dark, setDark }
}

// ── AppLayout ──────────────────────────────────────────────────────────────
export default function AppLayout() {
  const { dark, setDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)   // desktop sidebar expanded
  const [mobileOpen, setMobileOpen] = useState(false)    // mobile drawer open
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile drawer on route change
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMobileOpen(false)
  }

  // Current page title
  const currentNav = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to))
  const pageTitle = currentNav?.label ?? 'Revora'

  // Mock user — replace with real auth context later
  const user = { name: 'Juan dela Cruz', email: 'juan@gmail.com', role: 'user' }

  const handleLogout = () => {
    localStorage.removeItem('revora-token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-white
                    font-sans antialiased transition-colors duration-300 flex overflow-hidden">

      {/* ── MOBILE OVERLAY ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
             onClick={() => setMobileOpen(false)} />
      )}

      {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full flex flex-col
        bg-white dark:bg-[#111114]
        border-r border-zinc-100 dark:border-white/5
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-[240px]' : 'w-[68px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>

        {/* Sidebar header */}
        <div className={`flex items-center h-16 px-4 border-b border-zinc-100 dark:border-white/5
                         shrink-0 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <a href="/" className="flex items-center gap-2.5 no-underline">
              <img src="/Logo.png" alt="Revora" className="h-8 w-auto" />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-extrabold tracking-widest text-zinc-900 dark:text-white">REVORA</span>
                <span className="text-[9px] font-semibold tracking-[.16em] text-orange-500 mt-0.5">RIDE SMARTER</span>
              </div>
            </a>
          )}
          {!sidebarOpen && (
            <img src="/Logo.png" alt="Revora" className="h-7 w-auto" />
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center
                       text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
                       hover:bg-zinc-100 dark:hover:bg-white/8 transition-all cursor-pointer shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              {sidebarOpen
                ? <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02z" clipRule="evenodd" />
                : <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02z" clipRule="evenodd" />
              }
            </svg>
          </button>
        </div>

        {/* Active bike pill */}
        {sidebarOpen && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2.5
                          bg-orange-500/8 border border-orange-500/20 rounded-xl
                          flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center
                            text-xs font-bold text-orange-500 shrink-0">
              N
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">NMAX 155</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">12,480 km</div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 animate-pulse" />
          </div>
        )}
        {!sidebarOpen && (
          <div className="mx-auto mt-3 mb-1 w-9 h-9 rounded-xl
                          bg-orange-500/10 border border-orange-500/20
                          flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          </div>
        )}

        {/* Nav section label */}
        {sidebarOpen && (
          <div className="px-4 pt-4 pb-1.5">
            <span className="text-[9px] font-bold tracking-[.14em] uppercase text-zinc-400 dark:text-zinc-600">
              Main menu
            </span>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-2 overflow-y-auto py-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                group flex items-center gap-3 rounded-xl px-3 py-2.5 mb-0.5
                transition-all duration-150 no-underline relative
                ${isActive
                  ? 'bg-orange-500/10 text-orange-500 dark:text-orange-500'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                }
                ${!sidebarOpen ? 'justify-center px-2' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5
                                     bg-orange-500 rounded-r-full" />
                  )}

                  <span className={`shrink-0 transition-colors ${isActive ? 'text-orange-500' : ''}`}>
                    {item.icon}
                  </span>

                  {sidebarOpen && (
                    <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                  )}

                  {/* Badge */}
                  {sidebarOpen && item.badge && (
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-black
                                     text-[10px] font-bold flex items-center justify-center shrink-0">
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed badge dot */}
                  {!sidebarOpen && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
                  )}

                  {/* Tooltip on collapsed */}
                  {!sidebarOpen && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
                                     bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium
                                     opacity-0 group-hover:opacity-100 pointer-events-none
                                     whitespace-nowrap shadow-lg z-50 transition-opacity">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className={`shrink-0 border-t border-zinc-100 dark:border-white/5 p-3
                         ${sidebarOpen ? '' : 'flex flex-col items-center gap-2'}`}>

          {/* Settings link */}
          <NavLink
            to="/settings"
            className={({ isActive }) => `
              flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1
              transition-all no-underline
              ${isActive
                ? 'bg-orange-500/10 text-orange-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
              }
              ${!sidebarOpen ? 'justify-center px-2 w-full' : ''}
            `}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px] shrink-0">
              <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.993 6.993 0 0 1 7.51 3.456l.33-1.652zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" clipRule="evenodd" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </NavLink>

          {/* User row */}
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl
                            hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer group"
                 onClick={() => navigate('/settings/profile')}>
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20
                              flex items-center justify-center text-xs font-bold text-orange-500 shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{user.name}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{user.email}</div>
              </div>
              <svg viewBox="0 0 20 20" fill="currentColor"
                   className="w-3.5 h-3.5 text-zinc-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20
                            flex items-center justify-center text-xs font-bold text-orange-500
                            cursor-pointer hover:bg-orange-500/15 transition-all"
                 onClick={() => navigate('/settings/profile')}>
              {user.name.charAt(0)}
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN AREA ───────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300
                       ${sidebarOpen ? 'lg:ml-[240px]' : 'lg:ml-[68px]'}
                       pb-16 lg:pb-0`}>

        {/* ── TOP NAV ───────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 h-16 flex items-center
                           bg-white/80 dark:bg-[#0c0c0e]/80
                           backdrop-blur-xl
                           border-b border-zinc-100 dark:border-white/5
                           px-4 sm:px-6 gap-4">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-1.5
                       border border-zinc-200 dark:border-white/10
                       bg-zinc-50 dark:bg-white/5
                       hover:bg-zinc-100 dark:hover:bg-white/8 transition-all cursor-pointer shrink-0">
            <span className="w-4.5 h-0.5 bg-zinc-600 dark:bg-zinc-400 rounded" />
            <span className="w-4.5 h-0.5 bg-zinc-600 dark:bg-zinc-400 rounded" />
            <span className="w-3 h-0.5 bg-zinc-600 dark:bg-zinc-400 rounded" />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-zinc-900 dark:text-white truncate">{pageTitle}</h1>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:block">
              {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Quick log button */}
            <button
              onClick={() => navigate('/fuel/log')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg
                         bg-orange-500 text-black text-xs font-semibold
                         hover:bg-orange-400 transition-all cursor-pointer
                         shadow-[0_0_16px_rgba(255,107,33,0.25)]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5z" />
              </svg>
              Quick Log
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-white/10
                         bg-zinc-50 dark:bg-white/5
                         flex items-center justify-center text-base
                         hover:bg-zinc-100 dark:hover:bg-white/8 transition-colors cursor-pointer">
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                className="relative w-9 h-9 rounded-lg border border-zinc-200 dark:border-white/10
                           bg-zinc-50 dark:bg-white/5
                           flex items-center justify-center
                           hover:bg-zinc-100 dark:hover:bg-white/8 transition-colors cursor-pointer">
                <svg viewBox="0 0 20 20" fill="currentColor"
                     className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400">
                  <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6zm0 14.5a2 2 0 0 1-1.95-1.557 33.54 33.54 0 0 0 3.9 0A2 2 0 0 1 10 16.5z" clipRule="evenodd" />
                </svg>
                {/* Unread dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white dark:border-[#0c0c0e]" />
              </button>

              {/* Notifications dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl
                                bg-white dark:bg-[#1c1c21]
                                border border-zinc-100 dark:border-white/10
                                shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3
                                  border-b border-zinc-100 dark:border-white/5">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</span>
                    <span className="text-xs font-medium text-orange-500 cursor-pointer hover:text-orange-400">
                      Mark all read
                    </span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-white/5">
                    {[
                      { icon: '🔔', title: 'PMS due in 340km', sub: 'NMAX 155 — oil change reminder', time: 'Just now', unread: true },
                      { icon: '📅', title: 'LTO renewal in 14 days', sub: 'Registration expires Feb 28', time: '2h ago', unread: true },
                      { icon: '⛽', title: 'Fuel log added', sub: 'NMAX 155 — 4.2L · ₱280', time: 'Yesterday', unread: false },
                    ].map((n, i) => (
                      <div key={i}
                           className={`flex items-start gap-3 px-4 py-3 cursor-pointer
                                       hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors
                                       ${n.unread ? 'bg-orange-500/3' : ''}`}>
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800
                                        flex items-center justify-center text-sm shrink-0 mt-0.5">
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate
                                           ${n.unread ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {n.title}
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{n.sub}</div>
                          <div className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-0.5">{n.time}</div>
                        </div>
                        {n.unread && (
                          <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-white/5 text-center">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 cursor-pointer hover:text-orange-500 transition-colors">
                      View all notifications →
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                           border border-zinc-200 dark:border-white/10
                           bg-zinc-50 dark:bg-white/5
                           hover:bg-zinc-100 dark:hover:bg-white/8 transition-all cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20
                                flex items-center justify-center text-xs font-bold text-orange-500">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hidden sm:block max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <svg viewBox="0 0 20 20" fill="currentColor"
                     className="w-3.5 h-3.5 text-zinc-400 hidden sm:block shrink-0">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-2xl
                                bg-white dark:bg-[#1c1c21]
                                border border-zinc-100 dark:border-white/10
                                shadow-2xl z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-white/5">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user.name}</div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{user.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                    bg-orange-500/10 border border-orange-500/20">
                      <span className="text-[9px] font-bold tracking-wider text-orange-500 uppercase">Rider</span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    {[
                      { label: 'My Profile',    to: '/settings/profile',  icon: '👤' },
                      { label: 'My Garage',     to: '/garage',            icon: '🏍️' },
                      { label: 'Settings',      to: '/settings',          icon: '⚙️' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { navigate(item.to); setProfileOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left
                                   text-sm text-zinc-600 dark:text-zinc-400
                                   hover:bg-zinc-50 dark:hover:bg-white/5
                                   hover:text-zinc-900 dark:hover:text-white
                                   transition-colors cursor-pointer">
                        <span>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-zinc-100 dark:border-white/5 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left
                                 text-sm text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer">
                      <span>🚪</span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ──────────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16
                      bg-white/90 dark:bg-[#111114]/90 backdrop-blur-xl
                      border-t border-zinc-100 dark:border-white/5
                      flex items-center">
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center gap-1 py-2
              transition-colors no-underline relative
              ${isActive ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500'}
            `}
          >
            {({ isActive }) => (
              <>
                {/* Active pill bg */}
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2
                                   w-10 h-10 rounded-xl bg-orange-500/10 -z-10" />
                )}
                <span className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full
                                     bg-orange-500 text-black text-[9px] font-bold
                                     flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-medium leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}