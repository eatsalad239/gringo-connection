import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/d1';

const db = getDatabase(process.env as any);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      accountId: searchParams.get('accountId') || undefined,
      type: searchParams.get('type') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const transactions = await db.listTransactions(filters);
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transaction = await db.createTransaction(body);
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

