import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await db.getDeal(params.id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }
    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Handle stage changes
    if (body.stage === 'closed-won' && !body.wonAt) {
      body.wonAt = new Date().toISOString();
    }
    if (body.stage === 'closed-lost' && !body.lostAt) {
      body.lostAt = new Date().toISOString();
    }

    const deal = await db.updateDeal(params.id, body);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Update contact metrics if deal closed
    if (deal.stage === 'closed-won' && deal.contactId) {
      const contact = await db.getContact(deal.contactId);
      if (contact) {
        await db.updateContact(deal.contactId, {
          totalDeals: contact.totalDeals + 1,
          totalRevenue: contact.totalRevenue + deal.value,
          lifetimeValue: contact.lifetimeValue + deal.value,
        });
      }
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  }
}

