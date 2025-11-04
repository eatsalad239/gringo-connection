import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, source } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    // Send email via Resend
    if (resend) {
      await resend.emails.send({
        from: process.env.RESEND_FROM || 'Gringo Connection <info@gringoconnection.com>',
        to: process.env.LEAD_FORWARD_TO?.split(',').map((e) => e.trim()) || [],
        subject: `New Lead: ${name}`,
        html: `
          <h2>New Lead</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p><strong>Source:</strong> ${source || 'website'}</p>
        `,
      });
    }

    // Create CRM lead (GHL integration)
    if (process.env.GHL_API_KEY) {
      try {
        const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            source: source || 'website',
          }),
        });
        // Don't fail if GHL fails
        if (!ghlRes.ok) {
          console.warn('GHL lead creation failed:', await ghlRes.text());
        }
      } catch (e) {
        console.warn('GHL lead creation error:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json({ error: 'Failed to process lead' }, { status: 500 });
  }
}

