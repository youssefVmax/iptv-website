import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSalesData } from "@/hooks/useSalesData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from "./ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function SalesDashboard({ userRole, userId }: { userRole: string; userId?: string }) {
  const { sales, metrics, loading, error } = useSalesData(userRole, userId);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
        Error loading sales data: {error.message}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-yellow-600 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        No sales data available
      </div>
    );
  }

  // Prepare data for charts
  const topAgents = Object.entries(metrics.salesByAgent || {})
    .map(([agent, amount]) => ({ agent, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const serviceData = Object.entries(metrics.salesByService || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">across {metrics.totalDeals} deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Deal</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">per deal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Agent</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">👤</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topAgents[0]?.agent || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              ${topAgents[0]?.amount?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Service</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceData[0]?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              ${serviceData[0]?.value?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Deal</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.averageDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">per deal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold">Sales by Agent</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topAgents}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="agent" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                  <Bar dataKey="amount" fill="#8884d8" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold">Sales by Service</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceData.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
