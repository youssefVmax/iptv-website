"use client"

import { AuthProvider, useAuth } from "@/hooks/useAuth"
import LandingPage from "./components/landing-page"
import LoginPage from "./components/login-page"
import FullPageDashboard from "@/components/full-page-dashboard"

function AppContent() {
  const { user, login, logout, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthFlow onLogin={login} />
  }

  return <FullPageDashboard />
}

function AuthFlow({ onLogin }: { onLogin: (username: string, password: string) => Promise<boolean> }) {
  const [showLogin, setShowLogin] = useState(false)

  if (!showLogin) {
    return <LandingPage onGetStarted={() => setShowLogin(true)} />
  }

  return (
    <LoginPage 
      onLogin={async (role, userData) => {
        const success = await onLogin(userData.username, userData.password || '')
        return success
      }} 
      onBack={() => setShowLogin(false)} 
    />
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

  return <Dashboard userRole={userRole} user={user} onLogout={handleLogout} />
}
