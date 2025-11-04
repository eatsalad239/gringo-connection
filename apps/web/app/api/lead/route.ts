import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Simple in-memory rate limiting (for production, use Redis or a service like Upstash)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
  // Try to get IP from headers (works with most proxies/CDNs)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function sanitizeInput(input: string | undefined | null, maxLength: number = 1000): string {
  if (!input) return '';
  return String(input)
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string | undefined | null): boolean {
  if (!phone) return true; // Phone is optional
  // Basic phone validation - allows international format
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Sanitize and validate inputs
    const name = sanitizeInput(body.name, 100);
    const email = sanitizeInput(body.email, 255).toLowerCase();
    const phone = sanitizeInput(body.phone, 20);
    const message = sanitizeInput(body.message, 2000);
    const source = sanitizeInput(body.source, 50) || 'website';

    // Validation
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Valid name is required (min 2 characters)' }, { status: 400 });
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Send email via Resend
    if (resend) {
      const recipients = process.env.LEAD_FORWARD_TO?.split(',').map((e) => e.trim()).filter(Boolean) || [];
      if (recipients.length > 0) {
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'Gringo Connection <info@gringoconnection.com>',
          to: recipients,
          subject: `New Lead: ${name}`,
          html: `
            <h2>New Lead</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${message ? `<p><strong>Message:</strong> ${message.replace(/\n/g, '<br>')}</p>` : ''}
            <p><strong>Source:</strong> ${source}</p>
            <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
          `,
        });
      }
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

