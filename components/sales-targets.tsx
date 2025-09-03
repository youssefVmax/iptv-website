"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Target, TrendingUp, Calendar, Award, Edit, Plus, Users, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSalesData } from "@/hooks/useSalesData"

interface SalesTarget {
  id: string
  agentId: string
  agentName: string
  team: string
  monthlyTarget: number
  currentSales: number
  dealsTarget: number
  currentDeals: number
  period: string
  status: 'on-track' | 'behind' | 'exceeded'
}

interface SalesTargetsProps {
  userRole: 'manager' | 'salesman' | 'customer-service'
  user: { name: string; username: string; id: string }
}

export function SalesTargets({ userRole, user }: SalesTargetsProps) {
  const { toast } = useToast()
  const { sales, metrics } = useSalesData(userRole, user.id, user.name)
  const [targets, setTargets] = useState<SalesTarget[]>([
    {
      id: '1',
      agentId: 'Agent-001',
      agentName: 'ahmed atef',
      team: 'CS TEAM',
      monthlyTarget: 15000,
      currentSales: 12500,
      dealsTarget: 20,
      currentDeals: 16,
      period: 'January 2025',
      status: 'on-track'
    },
    {
      id: '2',
      agentId: 'Agent-002',
      agentName: 'ali team',
      team: 'ALI ASHRAF',
      monthlyTarget: 18000,
      currentSales: 16200,
      dealsTarget: 25,
      currentDeals: 22,
      period: 'January 2025',
      status: 'on-track'
    },
    {
      id: '3',
      agentId: 'Agent-008',
      agentName: 'mohsen sayed',
      team: 'ALI ASHRAF',
      monthlyTarget: 20000,
      currentSales: 22500,
      dealsTarget: 30,
      currentDeals: 28,
      period: 'January 2025',
      status: 'exceeded'
    },
    {
      id: '4',
      agentId: 'Agent-005',
      agentName: 'marwan khaled',
      team: 'ALI ASHRAF',
      monthlyTarget: 16000,
      currentSales: 11800,
      dealsTarget: 22,
      currentDeals: 15,
      period: 'January 2025',
      status: 'behind'
    }
  ])

  const [newTarget, setNewTarget] = useState({
    agentId: '',
    monthlyTarget: '',
    dealsTarget: '',
    period: 'January 2025'
  })

  const [editingTarget, setEditingTarget] = useState<SalesTarget | null>(null)

  const isManager = userRole === 'manager'

  // Update targets with real sales data
  useEffect(() => {
    if (sales && sales.length > 0) {
      setTargets(prevTargets => 
        prevTargets.map(target => {
          const agentSales = sales.filter(sale => 
            sale.sales_agent_norm?.toLowerCase() === target.agentName.toLowerCase() ||
            sale.SalesAgentID === target.agentId
          )
          
          const currentSales = agentSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
          const currentDeals = agentSales.length
          
          const salesProgress = (currentSales / target.monthlyTarget) * 100
          const dealsProgress = (currentDeals / target.dealsTarget) * 100
          
          let status: 'on-track' | 'behind' | 'exceeded' = 'on-track'
          if (salesProgress >= 100 || dealsProgress >= 100) {
            status = 'exceeded'
          } else if (salesProgress < 70 || dealsProgress < 70) {
            status = 'behind'
          }

          return {
            ...target,
            currentSales,
            currentDeals,
            status
          }
        })
      )
    }
  }, [sales])

  const handleCreateTarget = () => {
    if (!newTarget.agentId || !newTarget.monthlyTarget || !newTarget.dealsTarget) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    const target: SalesTarget = {
      id: Date.now().toString(),
      agentId: newTarget.agentId,
      agentName: newTarget.agentId.replace('Agent-', '').toLowerCase(),
      team: 'CS TEAM', // Default team
      monthlyTarget: parseInt(newTarget.monthlyTarget),
      currentSales: 0,
      dealsTarget: parseInt(newTarget.dealsTarget),
      currentDeals: 0,
      period: newTarget.period,
      status: 'on-track'
    }

    setTargets(prev => [...prev, target])
    setNewTarget({ agentId: '', monthlyTarget: '', dealsTarget: '', period: 'January 2025' })
    
    toast({
      title: "Target Created",
      description: `Sales target created for ${target.agentName}.`
    })
  }

  const handleUpdateTarget = () => {
    if (!editingTarget) return

    setTargets(prev => 
      prev.map(target => 
        target.id === editingTarget.id ? editingTarget : target
      )
    )
    
    setEditingTarget(null)
    toast({
      title: "Target Updated",
      description: "Sales target has been updated successfully."
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-green-100 text-green-800'
      case 'on-track': return 'bg-blue-100 text-blue-800'
      case 'behind': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    return 'bg-red-500'
  }

  // Filter targets for non-managers
  const visibleTargets = isManager 
    ? targets 
    : targets.filter(target => 
        target.agentName.toLowerCase() === user.name.toLowerCase() ||
        target.agentId === user.id
      )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {isManager ? 'Team Sales Targets' : 'My Sales Targets'}
          </h2>
          <p className="text-muted-foreground">
            {isManager 
              ? 'Set and monitor sales targets for your team members'
              : 'Track your personal sales targets and progress'}
          </p>
        </div>
        {isManager && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Set New Target
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Sales Target</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent">Sales Agent</Label>
                  <Select value={newTarget.agentId} onValueChange={(value) => setNewTarget(prev => ({ ...prev, agentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agent-001">Ahmed Atef</SelectItem>
                      <SelectItem value="Agent-002">Ali Team</SelectItem>
                      <SelectItem value="Agent-008">Mohsen Sayed</SelectItem>
                      <SelectItem value="Agent-005">Marwan Khaled</SelectItem>
                      <SelectItem value="Agent-003">Sherif Ashraf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="monthly-target">Monthly Revenue Target ($)</Label>
                  <Input
                    id="monthly-target"
                    type="number"
                    value={newTarget.monthlyTarget}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, monthlyTarget: e.target.value }))}
                    placeholder="15000"
                  />
                </div>

                <div>
                  <Label htmlFor="deals-target">Monthly Deals Target</Label>
                  <Input
                    id="deals-target"
                    type="number"
                    value={newTarget.dealsTarget}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, dealsTarget: e.target.value }))}
                    placeholder="20"
                  />
                </div>

                <div>
                  <Label htmlFor="period">Period</Label>
                  <Select value={newTarget.period} onValueChange={(value) => setNewTarget(prev => ({ ...prev, period: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January 2025">January 2025</SelectItem>
                      <SelectItem value="February 2025">February 2025</SelectItem>
                      <SelectItem value="March 2025">March 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateTarget} className="w-full">
                  Create Target
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Targets Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTargets.map((target) => {
          const salesProgress = (target.currentSales / target.monthlyTarget) * 100
          const dealsProgress = (target.currentDeals / target.dealsTarget) * 100

          return (
            <Card key={target.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg capitalize">{target.agentName}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline">{target.team}</Badge>
                      <span className="ml-2 text-xs">{target.period}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(target.status)}>
                      {target.status.replace('-', ' ')}
                    </Badge>
                    {isManager && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingTarget(target)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Revenue Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Revenue Target</span>
                    <span className="text-sm text-muted-foreground">
                      ${target.currentSales.toLocaleString()} / ${target.monthlyTarget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={Math.min(salesProgress, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {salesProgress.toFixed(1)}% complete
                  </p>
                </div>

                {/* Deals Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Deals Target</span>
                    <span className="text-sm text-muted-foreground">
                      {target.currentDeals} / {target.dealsTarget}
                    </span>
                  </div>
                  <Progress value={Math.min(dealsProgress, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {dealsProgress.toFixed(1)}% complete
                  </p>
                </div>

                {/* Performance Indicators */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${Math.round(target.currentSales / Math.max(target.currentDeals, 1)).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Deal Size</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {target.dealsTarget - target.currentDeals}
                    </p>
                    <p className="text-xs text-muted-foreground">Deals Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Team Performance Summary (Manager Only) */}
      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Team Performance Summary
            </CardTitle>
            <CardDescription>Overall team performance against targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {targets.filter(t => t.status === 'exceeded').length}
                </p>
                <p className="text-sm text-muted-foreground">Agents Exceeding Targets</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {targets.filter(t => t.status === 'on-track').length}
                </p>
                <p className="text-sm text-muted-foreground">Agents On Track</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {targets.filter(t => t.status === 'behind').length}
                </p>
                <p className="text-sm text-muted-foreground">Agents Behind Target</p>
              </div>
            </div>

            <div className="space-y-3">
              {['CS TEAM', 'ALI ASHRAF', 'SAIF MOHAMED', 'OTHER'].map(team => {
                const teamTargets = targets.filter(t => t.team === team)
                const teamRevenue = teamTargets.reduce((sum, t) => sum + t.currentSales, 0)
                const teamTarget = teamTargets.reduce((sum, t) => sum + t.monthlyTarget, 0)
                const teamProgress = teamTarget > 0 ? (teamRevenue / teamTarget) * 100 : 0

                return (
                  <div key={team} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{team}</h4>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${teamRevenue.toLocaleString()} / ${teamTarget.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {teamTargets.length} agents
                        </p>
                      </div>
                    </div>
                    <Progress value={Math.min(teamProgress, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {teamProgress.toFixed(1)}% of team target
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Performance (Salesman View) */}
      {!isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              My Performance
            </CardTitle>
            <CardDescription>Your current performance against targets</CardDescription>
          </CardHeader>
          <CardContent>
            {visibleTargets.length > 0 ? (
              <div className="space-y-6">
                {visibleTargets.map(target => {
                  const salesProgress = (target.currentSales / target.monthlyTarget) * 100
                  const dealsProgress = (target.currentDeals / target.dealsTarget) * 100

                  return (
                    <div key={target.id} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-medium">Revenue Progress</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Current: ${target.currentSales.toLocaleString()}</span>
                              <span>Target: ${target.monthlyTarget.toLocaleString()}</span>
                            </div>
                            <Progress value={Math.min(salesProgress, 100)} className="h-3" />
                            <p className="text-xs text-muted-foreground">
                              {salesProgress.toFixed(1)}% complete
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Deals Progress</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Current: {target.currentDeals}</span>
                              <span>Target: {target.dealsTarget}</span>
                            </div>
                            <Progress value={Math.min(dealsProgress, 100)} className="h-3" />
                            <p className="text-xs text-muted-foreground">
                              {dealsProgress.toFixed(1)}% complete
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">
                            ${Math.round(target.currentSales / Math.max(target.currentDeals, 1)).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Avg Deal Size</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">
                            {target.dealsTarget - target.currentDeals}
                          </p>
                          <p className="text-xs text-muted-foreground">Deals Remaining</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-purple-600">
                            ${(target.monthlyTarget - target.currentSales).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Revenue Remaining</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-orange-600">
                            {Math.round((target.monthlyTarget - target.currentSales) / Math.max(target.dealsTarget - target.currentDeals, 1))}
                          </p>
                          <p className="text-xs text-muted-foreground">Avg Needed/Deal</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No targets set</h3>
                <p className="text-muted-foreground">Contact your manager to set up sales targets</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Target Dialog */}
      {editingTarget && (
        <Dialog open={!!editingTarget} onOpenChange={() => setEditingTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Sales Target</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Agent: {editingTarget.agentName}</Label>
              </div>
              
              <div>
                <Label htmlFor="edit-monthly-target">Monthly Revenue Target ($)</Label>
                <Input
                  id="edit-monthly-target"
                  type="number"
                  value={editingTarget.monthlyTarget}
                  onChange={(e) => setEditingTarget(prev => 
                    prev ? { ...prev, monthlyTarget: parseInt(e.target.value) || 0 } : null
                  )}
                />
              </div>

              <div>
                <Label htmlFor="edit-deals-target">Monthly Deals Target</Label>
                <Input
                  id="edit-deals-target"
                  type="number"
                  value={editingTarget.dealsTarget}
                  onChange={(e) => setEditingTarget(prev => 
                    prev ? { ...prev, dealsTarget: parseInt(e.target.value) || 0 } : null
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateTarget} className="flex-1">
                  Update Target
                </Button>
                <Button variant="outline" onClick={() => setEditingTarget(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}