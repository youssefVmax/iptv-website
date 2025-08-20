"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import Papa from "papaparse"
import {
  Filter,
  Sparkles,
  Diamond,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  BarChart3,
  PieChart,
  Activity,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Calendar,
  Globe,
  CreditCard,
  Building,
  Flag,
  Upload,
  RefreshCw,
  Download,
  Plus,
  Edit,
  Trash2,
  Save,
} from "lucide-react"

function parseNumber(val: string | number): number {
  if (val === null || val === undefined || val === '') return 0
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

interface SalesRow {
  date: string
  customer_name: string
  phone_number: string
  email: string
  amount: number
  user: string
  address: string
  sales_agent: string
  closing_agent: string
  team: string
  duration: string
  type_program: string
  type_service: string
  invoice: string
  device_id: string
  device_key: string
  comment: string
  no_user: string
  column1: string
  sales_agent_norm: string
  closing_agent_norm: string
  sales_agent_id: string
  closing_agent_id: string
  deal_id: string
  // Calculated fields
  duration_months: number
  monthly_amount: number
  payment_method: string
  status: string
}

function transformRow(row: any, index: number): SalesRow {
  // Handle duration conversion
  const duration = row.DURATION || row.duration || ""
  let durationMonths = 12 // default
  
  if (duration.toLowerCase().includes('year')) {
    const yearMatch = duration.match(/(\d+)\s*year/i)
    const monthMatch = duration.match(/(\d+)\s*month/i)
    durationMonths = (yearMatch ? parseInt(yearMatch[1]) * 12 : 12) + (monthMatch ? parseInt(monthMatch[1]) : 0)
  } else if (duration.toLowerCase().includes('month')) {
    const monthMatch = duration.match(/(\d+)\s*month/i)
    durationMonths = monthMatch ? parseInt(monthMatch[1]) : 12
  }

  const amount = parseNumber(row.AMOUNT || row.amount || 0)
  const monthlyAmount = amount > 0 ? amount / durationMonths : 0

  // Determine payment method
  const invoice = row.INVOICE || row.invoice || ""
  const paymentMethod = invoice.toLowerCase().includes("paypal") ? "PayPal" : "Website"

  // Determine status based on comment
  const comment = row["ANY COMMENT ?"] || row.comment || ""
  let status = "Active"
  if (comment.toLowerCase().includes("renewal")) {
    status = "Renewal"
  } else if (comment.toLowerCase().includes("new")) {
    status = "New"
  }

  return {
    date: row.date || new Date().toISOString().split('T')[0],
    customer_name: row.customer_name || row["customer_name"] || "",
    phone_number: row["Phone number"] || row.phone_number || "",
    email: row["Email address\n"] || row.email || "",
    amount: amount,
    user: row.USER || row.user || "",
    address: row.ADDRESS || row.address || "",
    sales_agent: row.sales_agent || "",
    closing_agent: row.closing_agent || "",
    team: row.TEAM || row.team || "",
    duration: duration,
    type_program: row["TYPE PROGRAM"] || row.type_program || "",
    type_service: row["TYPE SERVISE"] || row.type_service || "",
    invoice: invoice,
    device_id: row["DEVICE ID"] || row.device_id || "",
    device_key: row["DEVICE KEY \n"] || row.device_key || "",
    comment: comment,
    no_user: row["NO.USER"] || row.no_user || "",
    column1: row["Column 1"] || row.column1 || "",
    sales_agent_norm: row.sales_agent_norm || "",
    closing_agent_norm: row.closing_agent_norm || "",
    sales_agent_id: row.SalesAgentID || row.sales_agent_id || `Agent-${String(index + 1).padStart(3, '0')}`,
    closing_agent_id: row.ClosingAgentID || row.closing_agent_id || `Agent-${String(index + 1).padStart(3, '0')}`,
    deal_id: row.DealID || row.deal_id || `Deal-${String(index + 1).padStart(4, '0')}`,
    // Calculated fields
    duration_months: durationMonths,
    monthly_amount: monthlyAmount,
    payment_method: paymentMethod,
    status: status,
  }
}

const COLORS = [
  "#22D3EE", "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#14B8A6", "#F97316", "#84CC16"
]

interface ErrorState {
  hasError: boolean
  message: string
  details: string
}

const EnhancedSalesDashboard = () => {
  const [salesData, setSalesData] = useState<SalesRow[]>([])
  const [filteredData, setFilteredData] = useState<SalesRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: '',
    details: ''
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [filters, setFilters] = useState({
    customer_name: "",
    amount: "",
    sales_agent: "",
    closing_agent: "",
    type_program: "",
    type_service: "",
    team: "",
    address: "",
    payment_method: "",
    status: "",
  })

  const [activeTab, setActiveTab] = useState<"overview" | "sales-table" | "add-deal">("overview")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SalesRow | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })
  const [selectedDeal, setSelectedDeal] = useState<SalesRow | null>(null)
  const [editingDeal, setEditingDeal] = useState<SalesRow | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // New deal form state
  const [newDeal, setNewDeal] = useState<Partial<SalesRow>>({
    date: new Date().toISOString().split('T')[0],
    customer_name: "",
    phone_number: "",
    email: "",
    amount: 0,
    sales_agent: "",
    closing_agent: "",
    team: "",
    duration: "TWO YEAR",
    type_program: "IBO PLAYER",
    type_service: "SLIVER",
    address: "USA",
  })

  // Animated background effect
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

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    function animate() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(34, 211, 238, ${particle.opacity})`
        ctx.fill()

        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.strokeStyle = `rgba(34, 211, 238, ${0.1 * (1 - distance / 100)})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        })
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

  // Load data from CSV file
  const loadCSVData = useCallback(async () => {
    try {
      setLoading(true)
      setLoadingProgress(20)
      setLoadingMessage("Loading sales data...")

      // Fetch the CSV file from the public directory
      const response = await fetch('/data/aug-ids.csv')
      if (!response.ok) {
        throw new Error(`Failed to load CSV data: ${response.statusText}`)
      }

      const csvText = await response.text()
      setLoadingProgress(60)
      setLoadingMessage("Processing data...")

      // Parse the CSV data using PapaParse
      return new Promise<SalesRow[]>((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const parsedData = results.data
                .map((row: any, index: number) => transformRow(row, index))
                .filter((row): row is SalesRow => row !== null)
              resolve(parsedData)
            } catch (error) {
              reject(error)
            }
          },
          error: (error: Error) => reject(error)
        })
      })
    } catch (error) {
      console.error("Error loading CSV data:", error)
      setErrorState({
        hasError: true,
        message: "Failed to load sales data",
        details: error instanceof Error ? error.message : String(error)
      })
      return []
    } finally {
      setLoadingProgress(100)
      setLoading(false)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await loadCSVData()
        setSalesData(data)
        setFilteredData(data)
      } catch (error) {
        console.error("Error in loadInitialData:", error)
        setErrorState({
          hasError: true,
          message: "Failed to load sales data",
          details: error instanceof Error ? error.message : String(error)
        })
      } finally {
        setLoading(false)
        setLoadingProgress(100)
      }
    }

    loadInitialData()
  }, [loadCSVData])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setLoadingProgress(10)
    setLoadingMessage("Reading uploaded file...")

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        setLoadingProgress(40)
        setLoadingMessage("Parsing CSV data...")

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<any>) => {
            try {
              setLoadingProgress(70)
              setLoadingMessage("Processing new records...")

              const rows: SalesRow[] = results.data
                .map((row: any, index: number) => transformRow(row, index))
                .filter((row: SalesRow) => row.customer_name && row.amount > 0 && row.sales_agent)

              setSalesData(rows)
              setFilteredData(rows)

              setLoadingProgress(100)
              setLoadingMessage("Data updated successfully!")
              
              setTimeout(() => {
                setLoading(false)
                setErrorState({ hasError: false, message: '', details: '' })
              }, 500)
            } catch (error) {
              console.error("Error processing uploaded data:", error)
              setErrorState({
                hasError: true,
                message: "Failed to process uploaded data",
                details: String(error),
              })
              setLoading(false)
            }
          },
          error: (error: any) => {
            console.error("CSV parsing error:", error)
            setErrorState({
              hasError: true,
              message: "Failed to parse uploaded CSV",
              details: error.message,
            })
            setLoading(false)
          },
        })
      } catch (error) {
        console.error("File reading error:", error)
        setErrorState({
          hasError: true,
          message: "Failed to read uploaded file",
          details: String(error),
        })
        setLoading(false)
      }
    }

    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  const getUniqueValues = (field: keyof SalesRow): string[] => {
    if (!salesData || salesData.length === 0) return []

    const values: string[] = [
      ...new Set(
        salesData
          .map((item: SalesRow) => item[field]?.toString().trim())
          .filter((v: string | undefined): v is string => !!v && v !== "" && v !== "undefined" && v !== "null")
      ),
    ]

    return values.sort()
  }

  // Apply filters
  useEffect(() => {
    let filtered = salesData

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === "customer_name") {
          filtered = filtered.filter((item: SalesRow) =>
            item.customer_name?.toLowerCase().includes(value.toLowerCase())
          )
        } else {
          filtered = filtered.filter((item: SalesRow) => 
            String(item[key as keyof SalesRow])?.trim() === value
          )
        }
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [filters, salesData])

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.amount, 0)
    const totalDeals = filteredData.length
    const avgDealValue = filteredData.length > 0 ? totalRevenue / filteredData.length : 0

    // Agent performance
    const agentRevenue: Record<string, { revenue: number; deals: number }> = {}
    filteredData.forEach((item) => {
      const agent = item.sales_agent?.trim() || "Unknown"
      if (!agentRevenue[agent]) {
        agentRevenue[agent] = { revenue: 0, deals: 0 }
      }
      agentRevenue[agent].revenue += item.amount
      agentRevenue[agent].deals += 1
    })

    const agentPerformance = Object.entries(agentRevenue)
      .sort((a, b) => b[1].revenue - a[1].revenue)

    // Team performance
    const teamRevenue: Record<string, { revenue: number; deals: number }> = {}
    filteredData.forEach((item) => {
      const team = item.team?.trim() || "Unknown"
      if (!teamRevenue[team]) {
        teamRevenue[team] = { revenue: 0, deals: 0 }
      }
      teamRevenue[team].revenue += item.amount
      teamRevenue[team].deals += 1
    })

    const teamPerformance = Object.entries(teamRevenue)
      .sort((a, b) => b[1].revenue - a[1].revenue)

    // Product performance
    const productRevenue: Record<string, number> = {}
    filteredData.forEach((item) => {
      const product = item.type_program?.trim() || "Unknown"
      productRevenue[product] = (productRevenue[product] || 0) + item.amount
    })

    const productPerformance = Object.entries(productRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Monthly trends (based on date)
    const monthlyRevenue: Record<string, number> = {}
    filteredData.forEach((item) => {
      const date = new Date(item.date)
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + item.amount
    })

    const monthlyTrends = Object.entries(monthlyRevenue)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, revenue]) => ({ month, revenue }))

    return {
      totalRevenue,
      totalDeals,
      avgDealValue,
      agentPerformance,
      teamPerformance,
      productPerformance,
      monthlyTrends,
    }
  }, [filteredData])

  const handleSort = (key: keyof SalesRow) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key!]
      const bVal = b[sortConfig.key!]

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      
      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  const handleAddDeal = () => {
    if (!newDeal.customer_name || !newDeal.amount || !newDeal.sales_agent) {
      alert("Please fill in all required fields")
      return
    }

    const deal: SalesRow = {
      ...newDeal,
      deal_id: `Deal-${String(salesData.length + 1).padStart(4, '0')}`,
      sales_agent_id: `Agent-${String(salesData.length + 1).padStart(3, '0')}`,
      closing_agent_id: `Agent-${String(salesData.length + 1).padStart(3, '0')}`,
      duration_months: 24, // default
      monthly_amount: (newDeal.amount || 0) / 24,
      payment_method: "Website",
      status: "New",
    } as SalesRow

    const updatedData = [...salesData, deal]
    setSalesData(updatedData)
    setFilteredData(updatedData)
    setNewDeal({
      date: new Date().toISOString().split('T')[0],
      customer_name: "",
      phone_number: "",
      email: "",
      amount: 0,
      sales_agent: "",
      closing_agent: "",
      team: "",
      duration: "TWO YEAR",
      type_program: "IBO PLAYER",
      type_service: "SLIVER",
      address: "USA",
    })
    setShowAddForm(false)
  }

  const exportToCSV = () => {
    const csv = Papa.unparse(salesData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `sales-data-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 1) 100%)",
          }}
        />

        <div className="text-center relative z-10 max-w-md mx-auto px-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8"
          >
            <div className="w-24 h-24 border-4 border-slate-700 rounded-full mx-auto relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute inset-0 border-4 border-transparent border-t-cyan-500 border-r-cyan-400 rounded-full"
              />
              <div className="absolute inset-4 bg-slate-800/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-slate-100 mb-2"
          >
            Loading Sales Dashboard
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 mb-6"
          >
            {loadingMessage}
          </motion.p>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full relative"
              style={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-500"
          >
            {loadingProgress}% Complete
          </motion.p>
        </div>
      </div>
    )
  }

  if (errorState.hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 1) 100%)",
          }}
        />
        <div className="text-center max-w-md relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50"
          >
            <X className="w-10 h-10 text-red-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-100 mb-4">Error Loading Data</h2>
          <p className="text-slate-400 mb-2">{errorState.message}</p>
          <p className="text-sm text-slate-500 mb-6">{errorState.details}</p>
          <button
            onClick={() => {
              setErrorState({ hasError: false, message: '', details: '' })
              window.location.reload()
            }}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-300">
      <div className="p-6 max-w-7xl mx-auto">
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 1) 100%)",
          }}
        />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 text-cyan-500" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Sales Dashboard
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Diamond className="w-8 h-8 text-blue-500" />
            </motion.div>
          </div>
          <p className="text-xl text-slate-400 mb-6">Complete sales management and analytics platform</p>

          {/* Data Management Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deal</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            {[
              { id: "overview", label: "Analytics Overview", icon: BarChart3 },
              { id: "sales-table", label: "Sales Data Table", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl transform scale-105"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Smart Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Filter className="w-6 h-6 text-cyan-500" />
            <h3 className="text-2xl font-bold text-slate-100">Smart Filters</h3>
            <span className="text-sm text-slate-500">Advanced deal filtering system</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Object.entries(filters).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 capitalize">
                  {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                </label>
                {key === "customer_name" ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setFilters((prev: typeof filters) => ({ ...prev, [key]: e.target.value }))}
                      placeholder="Search customers..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                    />
                  </div>
                ) : (
                  <select
                    value={value}
                    onChange={(e) => setFilters((prev: typeof filters) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                  >
                    <option value="">All {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</option>
                    {getUniqueValues(key as keyof SalesRow).map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {activeTab === "overview" && (
          <>
            {/* KPI Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {[
                {
                  icon: DollarSign,
                  label: "Total Revenue",
                  value: `${analytics.totalRevenue.toLocaleString()}`,
                  color: "from-green-400 to-emerald-500",
                  bg: "bg-green-500/10",
                  border: "border-green-500/20",
                },
                {
                  icon: BarChart3,
                  label: "Total Deals",
                  value: analytics.totalDeals.toLocaleString(),
                  color: "from-blue-400 to-cyan-500",
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/20",
                },
                {
                  icon: TrendingUp,
                  label: "Avg Deal Value",
                  value: `${analytics.avgDealValue.toFixed(0)}`,
                  color: "from-purple-400 to-violet-500",
                  bg: "bg-purple-500/10",
                  border: "border-purple-500/20",
                },
                {
                  icon: Users,
                  label: "Active Agents",
                  value: analytics.agentPerformance.length.toString(),
                  color: "from-orange-400 to-red-500",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/20",
                },
              ].map((kpi, index) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`${kpi.bg} ${kpi.border} border backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${kpi.color} shadow-lg`}>
                      <kpi.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-slate-100">{kpi.value}</p>
                      <p className="text-sm text-slate-400">{kpi.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Monthly Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border mb-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Activity className="w-6 h-6 text-cyan-500" />
                <h3 className="text-2xl font-bold text-slate-100">Revenue Trends</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {analytics.monthlyTrends.map((monthData, index) => {
                  const maxRevenue = Math.max(...analytics.monthlyTrends.map((mt) => mt.revenue))
                  const percentage = maxRevenue > 0 ? (monthData.revenue / maxRevenue) * 100 : 0

                  return (
                    <div key={index} className="text-center">
                      <div className="mb-2">
                        <div className="h-32 bg-slate-800 rounded-lg flex items-end p-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${percentage}%` }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                            className="w-full bg-gradient-to-t from-cyan-500 to-blue-400 rounded"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{monthData.month}</p>
                      <p className="text-sm font-semibold text-slate-200">${monthData.revenue.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Top Performing Sales Agents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border mb-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-yellow-500" />
                <h3 className="text-2xl font-bold text-slate-100">Top Performing Sales Agents</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analytics.agentPerformance.slice(0, 10).map(([agent, data], index) => (
                  <motion.div
                    key={agent}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-amber-600"
                                : "bg-slate-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{agent}</p>
                        <p className="text-sm text-slate-400">{data.deals} deals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">${data.revenue.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">${(data.revenue / data.deals).toFixed(0)} avg</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Team Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border mb-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Building className="w-6 h-6 text-blue-500" />
                <h3 className="text-2xl font-bold text-slate-100">Team Performance Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.teamPerformance.map(([team, data], index) => {
                  const maxRevenue = analytics.teamPerformance[0][1].revenue
                  const percentage = (data.revenue / maxRevenue) * 100

                  return (
                    <motion.div
                      key={team}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                      className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-100 truncate">{team}</h4>
                        <span className="text-sm text-slate-400">#{index + 1}</span>
                      </div>
                      <div className="mb-2">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
                            className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-slate-100">${data.revenue.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">{data.deals} deals</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Product Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border"
            >
              <div className="flex items-center space-x-3 mb-6">
                <PieChart className="w-6 h-6 text-purple-500" />
                <h3 className="text-2xl font-bold text-slate-100">Product Performance Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.productPerformance.map(([product, revenue], index) => {
                  const maxRevenue = analytics.productPerformance[0][1]
                  const percentage = (revenue / maxRevenue) * 100

                  return (
                    <motion.div
                      key={product}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
                      className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-100 truncate">{product}</h4>
                        <span className="text-sm text-slate-400">#{index + 1}</span>
                      </div>
                      <div className="mb-2">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 1.0 + index * 0.1, duration: 0.8 }}
                            className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          />
                        </div>
                      </div>
                      <p className="text-lg font-bold text-slate-100">${revenue.toLocaleString()}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}

        {activeTab === "sales-table" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-500" />
                <h3 className="text-2xl font-bold text-slate-100">Sales Data Table</h3>
              </div>
              <div className="text-sm text-slate-400">
                Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} records
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-slate-300">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-slate-300">entries</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                  <tr>
                    {[
                      { key: "deal_id", label: "Deal ID" },
                      { key: "customer_name", label: "Customer" },
                      { key: "sales_agent", label: "Sales Agent" },
                      { key: "amount", label: "Amount" },
                      { key: "type_program", label: "Product" },
                      { key: "type_service", label: "Service" },
                      { key: "date", label: "Date" },
                      { key: "duration", label: "Duration" },
                      { key: "payment_method", label: "Payment" },
                      { key: "team", label: "Team" },
                      { key: "status", label: "Status" },
                    ].map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className="px-6 py-3 cursor-pointer hover:text-slate-200 transition-colors"
                        onClick={() => handleSort(column.key as keyof SalesRow)}
                      >
                        <div className="flex items-center">
                          {column.label}
                          {sortConfig.key === column.key && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((deal, index) => (
                    <motion.tr
                      key={deal.deal_id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs">{deal.deal_id}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{deal.customer_name}</td>
                      <td className="px-6 py-4">{deal.sales_agent}</td>
                      <td className="px-6 py-4 font-semibold text-green-400">
                        ${deal.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{deal.type_program}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                          {deal.type_service}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                          {new Date(deal.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                          {deal.duration}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <CreditCard className="w-3 h-3 mr-1 text-slate-400" />
                          {deal.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4">{deal.team}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          deal.status === 'New' ? 'bg-green-500/20 text-green-300' :
                          deal.status === 'Renewal' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedDeal(deal)}
                            className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-400">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-800/50 border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg border transition-colors ${
                        currentPage === pageNum
                          ? "bg-cyan-500 border-cyan-500 text-white"
                          : "bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-800/50 border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add New Deal Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-100">Add New Deal</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Customer Name *</label>
                    <input
                      type="text"
                      value={newDeal.customer_name || ''}
                      onChange={(e) => setNewDeal({...newDeal, customer_name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={newDeal.phone_number || ''}
                      onChange={(e) => setNewDeal({...newDeal, phone_number: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={newDeal.email || ''}
                      onChange={(e) => setNewDeal({...newDeal, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Amount *</label>
                    <input
                      type="number"
                      value={newDeal.amount || 0}
                      onChange={(e) => setNewDeal({...newDeal, amount: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Sales Agent *</label>
                    <input
                      type="text"
                      value={newDeal.sales_agent || ''}
                      onChange={(e) => setNewDeal({...newDeal, sales_agent: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Closing Agent</label>
                    <input
                      type="text"
                      value={newDeal.closing_agent || ''}
                      onChange={(e) => setNewDeal({...newDeal, closing_agent: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Team</label>
                    <select
                      value={newDeal.team || ''}
                      onChange={(e) => setNewDeal({...newDeal, team: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    >
                      <option value="">Select Team</option>
                      <option value="CS TEAM">CS TEAM</option>
                      <option value="ALI ASHRAF">ALI ASHRAF</option>
                      <option value="SAIF MOHAMED">SAIF MOHAMED</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                    <select
                      value={newDeal.duration || 'TWO YEAR'}
                      onChange={(e) => setNewDeal({...newDeal, duration: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    >
                      <option value="YEAR">1 Year</option>
                      <option value="TWO YEAR">2 Years</option>
                      <option value="2y+6m">2 Years + 6 Months</option>
                      <option value="2y+3m">2 Years + 3 Months</option>
                      <option value="2y+2m">2 Years + 2 Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Product Type</label>
                    <select
                      value={newDeal.type_program || 'IBO PLAYER'}
                      onChange={(e) => setNewDeal({...newDeal, type_program: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    >
                      <option value="IBO PLAYER">IBO PLAYER</option>
                      <option value="BOB PLAYER">BOB PLAYER</option>
                      <option value="IBO PRO">IBO PRO</option>
                      <option value="SMARTERS">SMARTERS</option>
                      <option value="IBOSS">IBOSS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Service Tier</label>
                    <select
                      value={newDeal.type_service || 'SLIVER'}
                      onChange={(e) => setNewDeal({...newDeal, type_service: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    >
                      <option value="SLIVER">SILVER</option>
                      <option value="GOLD">GOLD</option>
                      <option value="PERMIUM">PREMIUM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Address/Country</label>
                    <select
                      value={newDeal.address || 'USA'}
                      onChange={(e) => setNewDeal({...newDeal, address: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    >
                      <option value="USA">USA</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={newDeal.date || ''}
                      onChange={(e) => setNewDeal({...newDeal, date: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Comments</label>
                  <textarea
                    value={newDeal.comment || ''}
                    onChange={(e) => setNewDeal({...newDeal, comment: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
                    placeholder="Any additional notes or comments..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-700 flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDeal}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-colors"
                >
                  Add Deal
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Deal Detail Modal */}
        {selectedDeal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-100">Deal Details</h3>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="p-2 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Customer Information</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-lg text-slate-100 font-semibold mb-1">{selectedDeal.customer_name}</p>
                      <p className="text-slate-400 text-sm mb-1">{selectedDeal.email}</p>
                      <p className="text-slate-400 text-sm mb-2">{selectedDeal.phone_number}</p>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1 text-slate-400" />
                        <span className="text-slate-300 text-sm">{selectedDeal.address}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Deal Information</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Deal ID:</span>
                        <span className="text-slate-100 text-sm font-mono">{selectedDeal.deal_id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Date:</span>
                        <span className="text-slate-100 text-sm">
                          {new Date(selectedDeal.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Duration:</span>
                        <span className="text-slate-100 text-sm">{selectedDeal.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Status:</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          selectedDeal.status === 'New' ? 'bg-green-500/20 text-green-300' :
                          selectedDeal.status === 'Renewal' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {selectedDeal.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Financial Information</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-400">
                          ${selectedDeal.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Monthly Rate:</span>
                        <span className="text-slate-100">${selectedDeal.monthly_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Payment Method:</span>
                        <span className="text-slate-100">{selectedDeal.payment_method}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Product & Service</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Product Type:</span>
                        <span className="text-slate-100">{selectedDeal.type_program}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Service Tier:</span>
                        <span className="text-slate-100">{selectedDeal.type_service}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Device ID:</span>
                        <span className="text-slate-100 text-xs font-mono">{selectedDeal.device_id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Team Information</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Sales Agent:</span>
                        <span className="text-slate-100">{selectedDeal.sales_agent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Closing Agent:</span>
                        <span className="text-slate-100">{selectedDeal.closing_agent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Team:</span>
                        <span className="text-slate-100">{selectedDeal.team}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedDeal.comment && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Comments</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm">{selectedDeal.comment}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-700 flex justify-end">
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedSalesDashboard