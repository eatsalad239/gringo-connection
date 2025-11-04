import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Database automatically uses D1 in Cloudflare Pages, in-memory in dev

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      contactId: searchParams.get('contactId') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const invoices = await db.listInvoices(filters);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Calculate totals
    const subtotal = body.items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const tax = body.items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0
    );
    const discount = body.discount || 0;
    const total = subtotal + tax - discount;

    // Generate invoice number
    const invoiceCount = (await db.listInvoices()).length;
    const number = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await db.createInvoice({
      ...body,
      number,
      subtotal,
      tax,
      discount,
      total,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

