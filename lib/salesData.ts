import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export interface Sale {
  date: string;
  customer_name: string;
  amount: number;
  sales_agent: string;
  closing_agent: string;
  team: string;
  type_service: string;
  sales_agent_norm: string;
  closing_agent_norm: string;
  SalesAgentID: string;
  ClosingAgentID: string;
  DealID: string;
}

interface SalesMetrics {
  totalSales: number;
  totalDeals: number;
  averageDealSize: number;
  salesByAgent: Record<string, number>;
  salesByService: Record<string, number>;
  recentSales: Sale[];
}

// CSV data as a string (truncated for brevity, in real implementation use full CSV)
const CSV_DATA = `date,customer_name,Phone number,"Email address
",AMOUNT,USER,ADDRESS,sales_agent,closing_agent,TEAM,DURATION,TYPE PROGRAM,TYPE SERVISE,"INVOICE
",DEVICE ID,"DEVICE KEY 
",ANY COMMENT ?,NO.USER,Column 1,sales_agent_norm,closing_agent_norm,SalesAgentID,ClosingAgentID,DealID
01/08/2025,Huda kashif,20677333680/2538863215,hudaali.1992.3.23@gmail.com,79,Hudakashif@1,CA,Ahmed Atef,Ahmed Atef,CS TEAM,TWO YEAR,IBO PLAYER,SLIVER,Website - 100,4d:7f:40:3f:14:2f,368631,Renewal,USER = 1 ACC,Done,ahmed atef,ahmed atef,Agent-001,Agent-001,Deal-0001
... (rest of your CSV data)`;

export function useSalesData(userRole: string, userId?: string) {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const processData = () => {
      try {
        setLoading(true);
        
        // Parse CSV data
        Papa.parse(CSV_DATA, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let data = results.data as any[];
            
            // Filter data based on user role
            if (userRole === 'salesman' && userId) {
              data = data.filter(row => 
                row.SalesAgentID === userId || 
                row.sales_agent_norm === userId
              );
            } else if (userRole === 'customer-service' && userId) {
              data = data.filter(row => 
                row.ClosingAgentID === userId || 
                row.closing_agent_norm === userId
              );
            }
            // Manager sees all data (no filter)
            
            // Transform data to match Sale interface
            const sales: Sale[] = data.map(row => ({
              date: row.date,
              customer_name: row.customer_name,
              amount: parseFloat(row.AMOUNT) || 0,
              sales_agent: row.sales_agent,
              closing_agent: row.closing_agent,
              team: row.TEAM,
              type_service: row.TYPE_SERVISE || row['TYPE SERVISE'],
              sales_agent_norm: row.sales_agent_norm,
              closing_agent_norm: row.closing_agent_norm,
              SalesAgentID: row.SalesAgentID,
              ClosingAgentID: row.ClosingAgentID,
              DealID: row.DealID
            }));
            
            setSalesData(sales);
            
            // Calculate metrics
            const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
            const totalDeals = sales.length;
            const averageDealSize = totalDeals > 0 ? totalSales / totalDeals : 0;
            
            // Group by agent
            const salesByAgent = sales.reduce((acc, sale) => {
              const agent = sale.sales_agent || 'Unknown';
              acc[agent] = (acc[agent] || 0) + (sale.amount || 0);
              return acc;
            }, {} as Record<string, number>);
            
            // Group by service
            const salesByService = sales.reduce((acc, sale) => {
              const service = sale.type_service || 'Other';
              acc[service] = (acc[service] || 0) + (sale.amount || 0);
              return acc;
            }, {} as Record<string, number>);
            
            // Get recent sales (last 5)
            const recentSales = [...sales]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5);
            
            setMetrics({
              totalSales,
              totalDeals,
              averageDealSize,
              salesByAgent,
              salesByService,
              recentSales,
            });
            
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV data:', error);
            setError(new Error('Failed to parse sales data'));
            setLoading(false);
          }
        });
        
      } catch (err) {
        console.error('Error processing sales data:', err);
        setError(err instanceof Error ? err : new Error('Failed to process sales data'));
        setLoading(false);
      }
    };

    processData();
  }, [userRole, userId]);

  return {
    sales: salesData,
    metrics,
    loading,
    error,
    refresh: async () => {
      setLoading(true);
      setError(null);
      try {
        // Re-process the data on refresh
        processData();
        return salesData;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to refresh data'));
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };
}