"use client"

import { useState } from "react"
import Dashboard from "./dashboard"
import LandingPage from "./components/landing-page"
import LoginPage from "./components/login-page"

type AppState = "landing" | "login" | "dashboard"
type UserRole = "manager" | "salesman" | "customer-service"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [userRole, setUserRole] = useState<UserRole>("manager")
  const [user, setUser] = useState<{ name: string; username: string }>({ name: "", username: "" })

  const handleGetStarted = () => {
    setAppState("login")
  }

  const handleLogin = (role: UserRole, userData: { name: string; username: string }) => {
    setUserRole(role)
    setUser(userData)
    setAppState("dashboard")
  }

  const handleLogout = () => {
    setAppState("landing")
    setUser({ name: "", username: "" })
  }

  const handleBackToLanding = () => {
    setAppState("landing")
  }

  if (appState === "landing") {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  if (appState === "login") {
    return <LoginPage onLogin={handleLogin} onBack={handleBackToLanding} />
  }

  return <Dashboard userRole={userRole} user={user} onLogout={handleLogout} />
}
