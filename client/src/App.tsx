import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import AboutPage from './pages/AboutPage'
import AnalyticsPage from './pages/AnalyticsPage'
import GuidePage from './pages/GuidePage'
import ContactPage from './pages/ContactPage'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import FuelPage from './pages/FuelPage'
import GaragePage from './pages/GaragePage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import MaintenancePage from './pages/MaintenancePage'
import NotFoundPage from './pages/NotFoundPage'
import PrivacyPage from './pages/PrivacyPage'
import RegisterPage from './pages/RegisterPage'
import RemindersPage from './pages/RemindersPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SettingsPage from './pages/SettingsPage'
import TermsPage from './pages/TermsPage'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'

export default function App() {
  return (
    <BrowserRouter>
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
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
