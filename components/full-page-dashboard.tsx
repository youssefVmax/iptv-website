"use client"

import { useState, useRef, useEffect } from "react"
import { 
  BarChart3,
  Bell,
  Command,
  Database,
  type LucideIcon,
  Search,
  Settings,
  Tv,
  Users,
  Target,
  TrendingUp,
  FileText,
  LogOut,
  User,
  Shield,
  Upload,
  Download,
  Plus,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  PieChart,
  Activity,
  UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { SalesAnalysisDashboard } from '@/components/sales-dashboard-fixed'
import NotificationsPage from "@/components/notifications-page-new"
import { CustomerList } from "@/components/customer-list"
import { AddDealPage } from "@/components/add-deal"

export default function FullPageDashboard() {
  const { user, logout } = useAuth()
  const [isDark, setIsDark] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  // Animated background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    function animate() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(34, 211, 238, ${particle.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!user) {
    return null // This should be handled by the auth wrapper
  }

  const getNavItems = () => {
    const baseItems = [
      { id: "dashboard", icon: Home, label: "Dashboard" },
      { id: "analytics", icon: BarChart3, label: "Analytics" },
      { id: "notifications", icon: Bell, label: "Notifications" },
    ]

    if (user.role === 'manager') {
      return [
        ...baseItems,
        { id: "deals", icon: FileText, label: "All Deals" },
        { id: "targets", icon: Target, label: "Sales Targets" },
        { id: "datacenter", icon: Database, label: "Data Center" },
        { id: "customers", icon: Users, label: "Customers" },
        { id: "team", icon: UserCheck, label: "Team Management" },
        { id: "settings", icon: Settings, label: "Settings" },
      ]
    } else if (user.role === 'salesman') {
      return [
        ...baseItems,
        { id: "my-deals", icon: FileText, label: "My Deals" },
        { id: "add-deal", icon: Plus, label: "Add Deal" },
        { id: "targets", icon: Target, label: "My Targets" },
        { id: "datacenter", icon: Database, label: "Data Center" },
        { id: "customers", icon: Users, label: "My Customers" },
      ]
    } else {
      return [
        ...baseItems,
        { id: "support-deals", icon: FileText, label: "Support Deals" },
        { id: "customers", icon: Users, label: "Customer Support" },
        { id: "datacenter", icon: Database, label: "Data Center" },
      ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'dark bg-slate-950' 
        : 'light bg-gradient-to-br from-blue-50 via-white to-cyan-50'
    }`}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isDark 
            ? "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 1) 100%)"
            : "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)",
        }}
      />

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex-shrink-0`}>
          <Card className={`h-full backdrop-blur-sm transition-all duration-300 rounded-none border-r ${
            isDark 
              ? 'bg-slate-900/50 border-slate-700/50' 
              : 'bg-white/80 border-blue-200/50 shadow-lg'
          }`}>
            <CardHeader className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${sidebarOpen ? '' : 'justify-center'}`}>
                  <Tv className={`h-6 w-6 transition-colors duration-300 ${
                    isDark ? 'text-cyan-500' : 'text-blue-600'
                  }`} />
                  {sidebarOpen && (
                    <span className="font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Vmax Sales
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`transition-colors duration-300 ${
                    isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    collapsed={!sidebarOpen}
                    isDark={isDark}
                  />
                ))}
              </nav>
            </CardContent>

            <div className="p-4 border-t border-slate-700/50">
              <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                {sidebarOpen && (
                  <div className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <div className="font-medium">{user.name}</div>
                    <div className={`text-xs capitalize transition-colors duration-300 ${
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    }`}>{user.role}</div>
                  </div>
                )}
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className={`transition-colors duration-300 ${
                      isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className={`transition-colors duration-300 ${
                      isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={`p-4 border-b backdrop-blur-sm transition-colors duration-300 ${
            isDark ? 'border-slate-700/50 bg-slate-900/30' : 'border-blue-200/50 bg-white/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  {getPageTitle(activeTab, user.role)}
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Welcome back, {user.name}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`hidden md:flex items-center space-x-1 rounded-full px-3 py-1.5 border backdrop-blur-sm transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-800/50 border-slate-700/50' 
                    : 'bg-white/70 border-blue-200/50'
                }`}>
                  <Search className={`h-4 w-4 transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className={`bg-transparent border-none focus:outline-none text-sm w-40 transition-colors duration-300 ${
                      isDark 
                        ? 'text-slate-100 placeholder:text-slate-500' 
                        : 'text-slate-800 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`relative transition-colors duration-300 ${
                    isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-800'
                  }`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-5 w-5" />
                  <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full animate-pulse transition-colors duration-300 ${
                    isDark ? 'bg-cyan-500' : 'bg-blue-500'
                  }`}></span>
                </Button>

                <Badge variant="outline" className={`transition-colors duration-300 ${
                  isDark ? 'border-slate-600 text-slate-300' : 'border-blue-300 text-blue-700'
                }`}>
                  {user.team || user.role}
                </Badge>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <PageContent activeTab={activeTab} user={user} />
          </main>
        </div>
      </div>
    </div>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  collapsed,
  isDark,
}: { 
  icon: LucideIcon; 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
  collapsed?: boolean;
  isDark: boolean;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`w-full transition-all duration-300 ${
        collapsed ? 'justify-center px-2' : 'justify-start'
      } ${
        active 
          ? isDark 
            ? "bg-slate-800/70 text-cyan-400" 
            : "bg-blue-100/70 text-blue-700"
          : isDark
            ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
            : "text-slate-600 hover:text-slate-800 hover:bg-blue-50/50"
      }`}
    >
      <Icon className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
      {!collapsed && label}
    </Button>
  )
}

function getPageTitle(activeTab: string, userRole: string): string {
  switch (activeTab) {
    case "dashboard":
      return "Dashboard Overview"
    case "analytics":
      return "Sales Analytics"
    case "deals":
      return "All Deals Management"
    case "my-deals":
      return "My Sales Deals"
    case "support-deals":
      return "Support Deals"
    case "add-deal":
      return "Add New Deal"
    case "targets":
      return userRole === 'manager' ? "Team Sales Targets" : "My Sales Targets"
    case "datacenter":
      return "Data Center"
    case "notifications":
      return "Notifications"
    case "customers":
      return "Customer Management"
    case "team":
      return "Team Management"
    case "settings":
      return "Settings"
    default:
      return "Dashboard"
  }
}

function PageContent({ activeTab, user }: { activeTab: string; user: any }) {
  switch (activeTab) {
    case "dashboard":
      return <DashboardOverview user={user} />
    case "analytics":
      return <SalesAnalysisDashboard userRole={user.role} user={user} />
    case "deals":
    case "my-deals":
    case "support-deals":
      return <DealsManagement user={user} />
    case "add-deal":
      return <AddDealPage />
    case "targets":
      return <SalesTargets user={user} />
    case "datacenter":
      return <DataCenter user={user} />
    case "notifications":
      return <NotificationsPage userRole={user.role} user={user} />
    case "customers":
      return <CustomerList userRole={user.role} userId={user.id} />
    case "team":
      return <TeamManagement user={user} />
    case "settings":
      return <SettingsPage user={user} />
    default:
      return <DashboardOverview user={user} />
  }
}

function DashboardOverview({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value="$125,430"
          icon={TrendingUp}
          trend="up"
          change="+12.5%"
        />
        <MetricCard
          title="Active Deals"
          value="24"
          icon={FileText}
          trend="up"
          change="+8.2%"
        />
        <MetricCard
          title="Customers"
          value="156"
          icon={Users}
          trend="stable"
          change="+2.1%"
        />
        <MetricCard
          title="Target Progress"
          value="78%"
          icon={Target}
          trend="up"
          change="+5.3%"
        />
      </div>

      <SalesAnalysisDashboard userRole={user.role} user={user} />
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, trend, change }: {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'stable';
  change: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-xs ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change} from last month
            </p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function DealsManagement({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {user.role === 'manager' ? 'All Deals' : 'My Deals'}
          </h2>
          <p className="text-muted-foreground">
            {user.role === 'manager' 
              ? 'Manage all team deals and performance' 
              : 'Track your personal deals and performance'}
          </p>
        </div>
        {user.role !== 'customer-service' && (
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Add New Deal
          </Button>
        )}
      </div>
      
      <SalesAnalysisDashboard userRole={user.role} user={user} />
    </div>
  )
}

function SalesTargets({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {user.role === 'manager' ? 'Team Sales Targets' : 'My Sales Targets'}
          </CardTitle>
          <CardDescription>
            {user.role === 'manager' 
              ? 'Set and monitor team sales targets' 
              : 'Track your personal sales targets and progress'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <Target className="h-12 w-12 text-muted-foreground" />
            <span className="ml-4 text-muted-foreground">
              Sales targets management will be displayed here
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DataCenter({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Center</h2>
          <p className="text-muted-foreground">
            {user.role === 'manager' 
              ? 'Upload and manage Excel data files for the team' 
              : 'View assigned data and download resources'}
          </p>
        </div>
        {user.role === 'manager' && (
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Current Dataset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">File:</span>
                <span className="text-sm font-medium">aug-ids.csv</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Records:</span>
                <span className="text-sm font-medium">90 deals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm font-medium">Today</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>

        {user.role === 'manager' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload New Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drop Excel file here or click to browse
                </p>
                <Button variant="outline" size="sm">
                  Select File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Data Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue:</span>
                <span className="text-sm font-medium">$2.1M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Agents:</span>
                <span className="text-sm font-medium">25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Teams:</span>
                <span className="text-sm font-medium">4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TeamManagement({ user }: { user: any }) {
  if (user.role !== 'manager') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">Only managers can access team management.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>Manage team members, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <Users className="h-12 w-12 text-muted-foreground" />
            <span className="ml-4 text-muted-foreground">
              Team management interface will be displayed here
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsPage({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                defaultValue={user.email || ''}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-muted text-muted-foreground"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}