import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Database automatically uses D1 in Cloudflare Pages, in-memory in dev

// Force dynamic rendering (required for searchParams)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      stage: searchParams.get('stage') || undefined,
      contactId: searchParams.get('contactId') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
    };

    const deals = await db.listDeals(filters);
    return NextResponse.json({ deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deal = await db.createDeal(body);
    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}

