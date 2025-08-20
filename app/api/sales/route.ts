import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'aug-ids.csv');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    
    // Skip header row
    const rows = lines.slice(1);
    
    const sales: Sale[] = rows.map(row => {
      const [
        date,
        customer_name,
        amount,
        sales_agent,
        closing_agent,
        team,
        type_service,
        sales_agent_norm,
        closing_agent_norm,
        SalesAgentID,
        ClosingAgentID,
        DealID
      ] = row.split(',');
      
      return {
        date,
        customer_name,
        amount: parseFloat(amount) || 0,
        sales_agent,
        closing_agent,
        team,
        type_service,
        sales_agent_norm,
        closing_agent_norm,
        SalesAgentID,
        ClosingAgentID,
        DealID
      };
    });
    
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error loading sales data:', error);
    return NextResponse.json(
      { error: 'Failed to load sales data' },
      { status: 500 }
    );
  }
}
