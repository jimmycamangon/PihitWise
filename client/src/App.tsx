import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
const AppLayout = lazy(() => import('./components/AppLayout'))
import LandingPage from './pages/LandingPage'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'

// Each page's code is downloaded when it's first opened, so the landing page doesn't have to
// load the whole app first. The loaders are kept so every page can also be fetched ahead of time.
const pages = {
  About: () => import('./pages/AboutPage'),
  Analytics: () => import('./pages/AnalyticsPage'),
  Guide: () => import('./pages/GuidePage'),
  Admin: () => import('./pages/AdminPage'),
  Contact: () => import('./pages/ContactPage'),
  Dashboard: () => import('./pages/DashboardPage'),
  Expenses: () => import('./pages/ExpensesPage'),
  ForgotPassword: () => import('./pages/ForgotPasswordPage'),
  Fuel: () => import('./pages/FuelPage'),
  Garage: () => import('./pages/GaragePage'),
  Login: () => import('./pages/LoginPage'),
  Maintenance: () => import('./pages/MaintenancePage'),
  NotFound: () => import('./pages/NotFoundPage'),
  Privacy: () => import('./pages/PrivacyPage'),
  Register: () => import('./pages/RegisterPage'),
  Reminders: () => import('./pages/RemindersPage'),
  ResetPassword: () => import('./pages/ResetPasswordPage'),
  Settings: () => import('./pages/SettingsPage'),
  Terms: () => import('./pages/TermsPage'),
  // Not a page, but fetched ahead too so switching to Filipino works offline.
  Filipino: () => import('./i18n/fil'),
}

const AboutPage = lazy(pages.About)
const AnalyticsPage = lazy(pages.Analytics)
const GuidePage = lazy(pages.Guide)
const AdminPage = lazy(pages.Admin)
const ContactPage = lazy(pages.Contact)
const DashboardPage = lazy(pages.Dashboard)
const ExpensesPage = lazy(pages.Expenses)
const ForgotPasswordPage = lazy(pages.ForgotPassword)
const FuelPage = lazy(pages.Fuel)
const GaragePage = lazy(pages.Garage)
const LoginPage = lazy(pages.Login)
const MaintenancePage = lazy(pages.Maintenance)
const NotFoundPage = lazy(pages.NotFound)
const PrivacyPage = lazy(pages.Privacy)
const RegisterPage = lazy(pages.Register)
const RemindersPage = lazy(pages.Reminders)
const ResetPasswordPage = lazy(pages.ResetPassword)
const SettingsPage = lazy(pages.Settings)
const TermsPage = lazy(pages.Terms)

/**
 * Once the first screen is shown and the browser is idle, fetch every other page's code too.
 * Moving between pages is then instant, and the offline copy (service worker) has every page,
 * so pages never opened before still work without signal.
 */
function usePrefetchPages() {
  useEffect(() => {
    const prefetch = () => Object.values(pages).forEach((load) => { load().catch(() => { /* offline: try next visit */ }) })
    const idle = window.requestIdleCallback
    if (idle) {
      const id = idle(prefetch, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(prefetch, 2000)
    return () => window.clearTimeout(id)
  }, [])
}

export default function App() {
  usePrefetchPages()

  return (
    <BrowserRouter>
      {/* Plain background while a public page's code arrives (app pages show a skeleton inside the layout). */}
      <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/garage" element={<GaragePage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/fuel" element={<FuelPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
