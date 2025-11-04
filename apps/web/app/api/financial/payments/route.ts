import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Database automatically uses D1 in Cloudflare Pages, in-memory in dev

// Force dynamic rendering (required for searchParams)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoiceId = searchParams.get('invoiceId');
    const contactId = searchParams.get('contactId');

    const payments = await db.listPayments();
    let filtered = payments;
    
    if (invoiceId) filtered = filtered.filter(p => p.invoiceId === invoiceId);
    if (contactId) filtered = filtered.filter(p => p.contactId === contactId);

    return NextResponse.json({ payments: filtered });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payment = await db.createPayment(body);
    
    // Create transaction if account specified
    // Note: balanceAfter is calculated automatically by createTransaction
    if (body.accountId) {
      await db.createTransaction({
        accountId: body.accountId,
        type: 'income',
        category: 'payment',
        amount: body.amount,
        currency: body.currency,
        description: `Payment for invoice ${body.invoiceId}`,
        invoiceId: body.invoiceId,
        paymentId: payment.id,
        date: body.date,
        metadata: { paymentMethod: body.method },
      });
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

