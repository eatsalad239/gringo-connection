/**
 * Free & Trusted API Integrations
 * All services have free tiers and are production-ready
 */

// Resend (Email) - Already configured, 3,000 emails/month free
export const emailService = {
  async send(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured');
      return { ok: false };
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Gringo Connection <info@gringoconnection.com>',
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();
    return { ok: res.ok, id: data.id };
  },
};

// Twilio (SMS) - Free trial, then $0.0075/SMS
// Using Twilio's trusted API
export const smsService = {
  async send(to: string, message: string) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('Twilio not configured');
      return { ok: false };
    }

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER || '',
          To: to,
          Body: message,
        }),
      }
    );

    const data = await res.json();
    return { ok: res.ok, sid: data.sid };
  },
};

// Plausible Analytics - Privacy-focused, free for < 10k pageviews/month
export const analyticsService = {
  async trackEvent(eventName: string, props?: Record<string, any>) {
    if (!process.env.PLAUSIBLE_DOMAIN) {
      return { ok: false };
    }

    // Plausible uses client-side tracking, but we can use their API for server-side events
    const res = await fetch('https://plausible.io/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Gringo-Connection/1.0',
      },
      body: JSON.stringify({
        domain: process.env.PLAUSIBLE_DOMAIN,
        name: eventName,
        url: `https://${process.env.PLAUSIBLE_DOMAIN}`,
        props,
      }),
    });

    return { ok: res.ok };
  },
};

// Cloudflare Workers KV - Free tier: 100k reads/day, 1k writes/day
// Perfect for caching and simple data storage
export const kvService = {
  async get(key: string, env?: { KV?: any }): Promise<any> {
    if (!env?.KV) {
      console.warn('KV not configured');
      return null;
    }

    const value = await env.KV.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key: string, value: any, env?: { KV?: any }): Promise<void> {
    if (!env?.KV) {
      console.warn('KV not configured');
      return;
    }

    await env.KV.put(key, JSON.stringify(value));
  },

  async delete(key: string, env?: { KV?: any }): Promise<void> {
    if (!env?.KV) {
      return;
    }

    await env.KV.delete(key);
  },
};

// Stripe (Payments) - Free API, only pay per transaction (2.9% + $0.30)
// Most trusted payment processor
export const paymentService = {
  async createPaymentIntent(amount: number, currency: string = 'USD', metadata?: Record<string, any>) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured');
      return { ok: false };
    }

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
      body: new URLSearchParams({
        amount: String(Math.round(amount * 100)), // Convert to cents
        currency: currency.toLowerCase(),
        ...(metadata && { metadata: JSON.stringify(metadata) }),
      }),
    });

    const data = await res.json();
    return { ok: res.ok, clientSecret: data.client_secret, id: data.id };
  },

  async retrievePaymentIntent(paymentIntentId: string) {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { ok: false };
    }

    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    const data = await res.json();
    return { ok: res.ok, paymentIntent: data };
  },
};

// Calendly (Scheduling) - Free tier available
// Using Calendly's Webhook API for integration
export const schedulingService = {
  async createEvent(contactEmail: string, eventType: string, startTime: string) {
    // Calendly uses webhooks primarily, but we can track events
    // For actual scheduling, redirect users to Calendly link
    if (!process.env.CALENDLY_URL) {
      return { ok: false };
    }

    return {
      ok: true,
      calendlyUrl: process.env.CALENDLY_URL,
      // Calendly handles the actual scheduling on their platform
    };
  },
};

// OpenWeatherMap (Weather) - Free tier: 1,000 calls/day
// Useful for location-based features
export const weatherService = {
  async getWeather(city: string, country?: string) {
    if (!process.env.OPENWEATHER_API_KEY) {
      return { ok: false };
    }

    const location = country ? `${city},${country}` : city;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const data = await res.json();
    return { ok: res.ok, weather: data };
  },
};

// GitHub API (Free) - For integrations
export const githubService = {
  async getRepoInfo(owner: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
      },
    });

    const data = await res.json();
    return { ok: res.ok, repo: data };
  },
};

// Free IP Geolocation - ipapi.co (Free tier: 1,000 requests/day)
export const geolocationService = {
  async getLocation(ip: string) {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return { ok: res.ok, location: data };
  },
};

// Summary of Free Services Available:
// ✅ Resend: 3,000 emails/month free
// ✅ Twilio: Free trial, then pay-per-use
// ✅ Plausible: Free for < 10k pageviews/month
// ✅ Cloudflare D1: Free SQLite database (5GB storage, 5M reads/month)
// ✅ Cloudflare KV: Free tier (100k reads/day, 1k writes/day)
// ✅ Stripe: Free API, pay per transaction
// ✅ Calendly: Free tier available
// ✅ OpenWeatherMap: 1,000 calls/day free
// ✅ GitHub API: Free
// ✅ ipapi.co: 1,000 requests/day free

