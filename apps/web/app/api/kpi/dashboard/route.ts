import { NextResponse } from 'next/server';
import { kpiCalculator } from '@/lib/kpi/calculator';

export async function GET() {
  try {
    const metrics = await kpiCalculator.getDashboardMetrics();
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error calculating KPIs:', error);
    return NextResponse.json({ error: 'Failed to calculate KPIs' }, { status: 500 });
  }
}

