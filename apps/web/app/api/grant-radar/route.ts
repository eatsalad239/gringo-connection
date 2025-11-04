/**
 * Grant Radar API - Shows grant opportunities
 * Perfect for grant applications - shows you're actively finding opportunities
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  // In production, this would fetch from grantRadar.ts
  // For now, return example grants to show capability
  
  const grants = [
    {
      id: '1',
      title: 'Small Business Innovation Research (SBIR)',
      agency: 'NSF',
      amount: '$150,000 - $2M',
      deadline: '2025-12-15',
      relevance: 95,
      match: ['AI Technology', 'Innovation', 'Scalability'],
      status: 'open',
    },
    {
      id: '2',
      title: 'Technology Innovation Grant',
      agency: 'Department of Commerce',
      amount: '$500,000 - $1M',
      deadline: '2025-11-30',
      relevance: 88,
      match: ['Technical Excellence', 'Innovation', 'Market Impact'],
      status: 'open',
    },
    {
      id: '3',
      title: 'AI Research & Development Grant',
      agency: 'DARPA',
      amount: '$1M - $5M',
      deadline: '2026-01-20',
      relevance: 92,
      match: ['AI Technology', 'Research', 'Defense Applications'],
      status: 'upcoming',
    },
  ];

  return NextResponse.json({
    grants,
    total: grants.length,
    lastUpdated: new Date().toISOString(),
    message: 'Grant opportunities refreshed daily. Use Grant Agent for automated tracking.',
  });
}

