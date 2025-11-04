import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/d1';

const db = getDatabase(process.env as any);

export async function GET() {
  try {
    const accounts = await db.listAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const account = await db.createAccount(body);
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

