import { NextRequest, NextResponse } from 'next/server';
import { kpiCalculator } from '@/lib/kpi/calculator';

// Force dynamic rendering (required for searchParams)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'month') as 'day' | 'week' | 'month' | 'quarter' | 'year';
    const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    const metrics = await kpiCalculator.calculateMetrics(period, startDate, endDate);
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 });
  }
}

