"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import LandingPage from "./components/landing-page"
import LoginPage from "./components/login-page"
import FullPageDashboard from "@/components/full-page-dashboard"
import { Toaster } from "@/components/ui/toaster"

function AppContent() {
  const { user, login, logout, isAuthenticated, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

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
    if (!showLogin) {
      return <LandingPage onGetStarted={() => setShowLogin(true)} />
    }

    return (
      <LoginPage 
        onLogin={login}
        onBack={() => setShowLogin(false)} 
      />
    )
  }

  return <FullPageDashboard />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}