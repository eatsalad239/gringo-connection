import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// In production (Cloudflare Pages), D1 will be bound via env.DB
// For now, using in-memory database that works everywhere

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
    };

    const contacts = await db.listContacts(filters);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contact = await db.createContact(body);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

