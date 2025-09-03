"use client"

import { useState, useRef, useEffect } from "react"
import { 
  BarChart3,
  Bell,
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
  Upload,
  Download,
  Plus,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Activity,
  UserCheck,
  Shield,
  PieChart,
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
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
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
        { id: "all-deals", icon: FileText, label: "All Deals" },
        { id: "team-targets", icon: Target, label: "Team Targets" },
        { id: "datacenter", icon: Database, label: "Data Center" },
        { id: "customers", icon: Users, label: "All Customers" },
        { id: "team-management", icon: UserCheck, label: "Team Management" },
        { id: "competition", icon: TrendingUp, label: "Competition" },
        { id: "settings", icon: Settings, label: "Settings" },
      ]
    } else if (user.role === 'salesman') {
      return [
        ...baseItems,
        { id: "my-deals", icon: FileText, label: "My Deals" },
        { id: "add-deal", icon: Plus, label: "Add Deal" },
        { id: "my-targets", icon: Target, label: "My Targets" },
        { id: "datacenter", icon: Database, label: "Data Center" },
        { id: "my-customers", icon: Users, label: "My Customers" },
        { id: "competition", icon: TrendingUp, label: "Competition" },
      ]
    } else {
      return [
        ...baseItems,
        { id: "support-deals", icon: FileText, label: "Support Deals" },
        { id: "customers", icon: Users, label: "Customer Support" },
        { id: "datacenter", icon: Database, label: "Data Center" },
        { id: "competition", icon: TrendingUp, label: "Competition" },
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
            <CardHeader className={`p-4 border-b transition-colors duration-300 ${
              isDark ? 'border-slate-700/50' : 'border-blue-200/50'
            }`}>
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
            
            <CardContent className="p-4 flex-1 overflow-y-auto">
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

            <div className={`p-4 border-t transition-colors duration-300 ${
              isDark ? 'border-slate-700/50' : 'border-blue-200/50'
            }`}>
              <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                {sidebarOpen && (
                  <div className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <div className="font-medium">{user.name}</div>
                    <div className={`text-xs capitalize transition-colors duration-300 ${
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    }`}>{user.role}</div>
                    {user.team && (
                      <div className={`text-xs transition-colors duration-300 ${
                        isDark ? 'text-slate-600' : 'text-slate-400'
                      }`}>{user.team}</div>
                    )}
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
            <PageContent 
              activeTab={activeTab} 
              user={user} 
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
            />
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
    case "all-deals":
      return "All Deals Management"
    case "my-deals":
      return "My Sales Deals"
    case "support-deals":
      return "Support Deals"
    case "add-deal":
      return "Add New Deal"
    case "team-targets":
      return "Team Sales Targets"
    case "my-targets":
      return "My Sales Targets"
    case "datacenter":
      return "Data Center"
    case "notifications":
      return "Notifications"
    case "customers":
    case "my-customers":
      return userRole === 'manager' ? "All Customers" : "My Customers"
    case "team-management":
      return "Team Management"
    case "competition":
      return "Sales Competition"
    case "settings":
      return "Settings"
    default:
      return "Dashboard"
  }
}

function PageContent({ 
  activeTab, 
  user, 
  uploadedFiles, 
  setUploadedFiles 
}: { 
  activeTab: string; 
  user: any;
  uploadedFiles: string[];
  setUploadedFiles: (files: string[]) => void;
}) {
  switch (activeTab) {
    case "dashboard":
      return <DashboardOverview user={user} />
    case "analytics":
      return <SalesAnalysisDashboard userRole={user.role} user={user} />
    case "all-deals":
    case "my-deals":
    case "support-deals":
      return <DealsManagement user={user} />
    case "add-deal":
      return <AddDealPage />
    case "team-targets":
    case "my-targets":
      return <SalesTargets user={user} />
    case "datacenter":
      return <DataCenter user={user} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
    case "notifications":
      return <NotificationsPage userRole={user.role} user={user} />
    case "customers":
    case "my-customers":
      return <CustomerList userRole={user.role} userId={user.id} />
    case "team-management":
      return <TeamManagement user={user} />
    case "competition":
      return <CompetitionDashboard user={user} />
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
            {user.role === 'manager' ? 'All Team Deals' : 'My Deals'}
          </h2>
          <p className="text-muted-foreground">
            {user.role === 'manager' 
              ? 'Manage all team deals and performance' 
              : 'Track your personal deals and performance'}
          </p>
        </div>
        {(user.role === 'manager' || user.role === 'salesman') && (
          <Button 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            onClick={() => window.location.href = '/deals/new'}
          >
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
  const isManager = user.role === 'manager'
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {isManager ? 'Team Sales Targets' : 'My Sales Targets'}
          </CardTitle>
          <CardDescription>
            {isManager 
              ? 'Set and monitor team sales targets and performance' 
              : 'Track your personal sales targets and progress'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isManager ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "ahmed atef", target: 15000, current: 12500, team: "CS TEAM" },
                  { name: "ali team", target: 18000, current: 16200, team: "ALI ASHRAF" },
                  { name: "sherif ashraf", target: 14000, current: 11800, team: "SAIF MOHAMED" },
                  { name: "mohsen sayed", target: 20000, current: 18500, team: "ALI ASHRAF" },
                  { name: "marwan khaled", target: 16000, current: 14200, team: "ALI ASHRAF" },
                  { name: "ahmed heikal", target: 15000, current: 13100, team: "SAIF MOHAMED" },
                ].map((agent) => (
                  <Card key={agent.name} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium capitalize">{agent.name}</h4>
                        <Badge variant="outline">{agent.team}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round((agent.current / agent.target) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((agent.current / agent.target) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${agent.current.toLocaleString()}</span>
                          <span>${agent.target.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Monthly Target</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Progress</span>
                      <span className="font-bold">68%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full" style={{ width: '68%' }} />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$13,600</span>
                      <span>$20,000</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">This Month</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Deals Closed</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue Generated</span>
                      <span className="font-bold">$13,600</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Commission Earned</span>
                      <span className="font-bold text-green-600">$1,360</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DataCenter({ user, uploadedFiles, setUploadedFiles }: { 
  user: any; 
  uploadedFiles: string[];
  setUploadedFiles: (files: string[]) => void;
}) {
  const isManager = user.role === 'manager'
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simulate file upload
      const fileName = file.name
      setUploadedFiles([...uploadedFiles, fileName])
      
      // In a real app, you would upload to your server here
      console.log('Uploading file:', fileName)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Center</h2>
          <p className="text-muted-foreground">
            {isManager 
              ? 'Upload and manage Excel data files for the team' 
              : 'View assigned data and download resources'}
          </p>
        </div>
        {isManager && (
          <div className="flex space-x-2">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Excel
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Dataset */}
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
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Size:</span>
                <span className="text-sm font-medium">2.3 MB</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Download className="h-4 w-4 mr-2" />
              Download Current Data
            </Button>
          </CardContent>
        </Card>

        {/* Upload Section (Manager Only) */}
        {isManager && (
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
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Uploads:</h4>
                  <div className="space-y-1">
                    {uploadedFiles.slice(-3).map((file, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Data Statistics */}
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
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Deal Size:</span>
                <span className="text-sm font-medium">$1,247</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Datasets */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Available Datasets</CardTitle>
            <CardDescription>
              {isManager ? 'Manage and assign datasets to team members' : 'Datasets assigned to you'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "August Sales Data", file: "aug-ids.csv", records: 90, assigned: isManager ? "All Teams" : "You" },
                { name: "Q3 Performance", file: "q3-performance.xlsx", records: 245, assigned: isManager ? "Sales Team" : "You" },
                { name: "Customer Database", file: "customers.csv", records: 156, assigned: isManager ? "CS Team" : "You" },
              ].map((dataset, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{dataset.name}</h4>
                      <Badge variant="secondary" className="text-xs">{dataset.records} records</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{dataset.file}</p>
                    <p className="text-xs text-muted-foreground">Assigned to: {dataset.assigned}</p>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      {isManager && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
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
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Team Management
          </CardTitle>
          <CardDescription>Manage team members, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { team: "CS TEAM", members: 5, performance: 85 },
              { team: "ALI ASHRAF", members: 8, performance: 92 },
              { team: "SAIF MOHAMED", members: 7, performance: 88 },
              { team: "OTHER", members: 5, performance: 76 },
            ].map((team) => (
              <Card key={team.team} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{team.team}</h4>
                    <Badge variant="outline">{team.members} members</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span>{team.performance}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${team.performance}%` }}
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Team
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CompetitionDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sales Competition Dashboard
          </CardTitle>
          <CardDescription>
            {user.role === 'manager' 
              ? 'Monitor team competition and performance rankings' 
              : 'View your ranking and compete with colleagues'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <PieChart className="h-12 w-12 text-muted-foreground" />
            <span className="ml-4 text-muted-foreground">
              Competition dashboard will be displayed here
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsPage({ user }: { user: any }) {
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    team: user.team || '',
  })

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
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
            <div>
              <label className="block text-sm font-medium mb-2">Team</label>
              <input
                type="text"
                value={profile.team}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-muted text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-muted text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Change Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {user.role === 'manager' && (
        <Card>
          <CardHeader>
            <CardTitle>System Administration</CardTitle>
            <CardDescription>Advanced system settings and controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                User Management
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Database className="h-6 w-6 mb-2" />
                Database Backup
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Settings className="h-6 w-6 mb-2" />
                System Config
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <BarChart3 className="h-6 w-6 mb-2" />
                Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
          Save Changes
        </Button>
      </div>
    </div>
  )
}