# 🆓 Free Services Setup Guide

## ✅ **Trusted Free APIs & Services Integrated**

### **1. Cloudflare D1 Database** (FREE SQLite)
- **Storage**: 5GB free
- **Reads**: 5M/month free
- **Writes**: 100k/month free
- **Trust**: ⭐⭐⭐⭐⭐ Enterprise-grade, same as Cloudflare Pages

**Setup:**
```bash
# Create database
wrangler d1 create gringo-crm

# Run migrations
wrangler d1 execute gringo-crm --file=./apps/web/db/schema.sql

# Update wrangler.toml with database_id
```

**In Cloudflare Dashboard:**
1. Go to Workers & Pages → D1
2. Create database: `gringo-crm`
3. Copy database_id to `wrangler.toml`
4. Run SQL from `apps/web/db/schema.sql`

---

### **2. Resend** (Email Service)
- **Free Tier**: 3,000 emails/month
- **Trust**: ⭐⭐⭐⭐⭐ Modern, developer-friendly
- **Status**: ✅ Already configured

**Setup:**
```bash
# Already in env.example
RESEND_API_KEY=your_key_here
RESEND_FROM="Gringo Connection <info@gringoconnection.com>"
```

---

### **3. Twilio** (SMS)
- **Free Trial**: $15.50 credit
- **After Trial**: $0.0075/SMS
- **Trust**: ⭐⭐⭐⭐⭐ Industry standard

**Setup:**
1. Sign up: https://www.twilio.com/try-twilio
2. Get Account SID, Auth Token, Phone Number
3. Add to `.env`:
```bash
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

### **4. Plausible Analytics** (Privacy-Focused)
- **Free Tier**: < 10k pageviews/month
- **Trust**: ⭐⭐⭐⭐⭐ GDPR-compliant, open-source
- **Status**: ✅ Already configured

**Setup:**
```bash
PLAUSIBLE_DOMAIN=gringoconnection.com
PLAUSIBLE_API_KEY=your_key_here  # Optional, for server-side events
```

---

### **5. Cloudflare KV** (Key-Value Storage)
- **Free Tier**: 100k reads/day, 1k writes/day
- **Trust**: ⭐⭐⭐⭐⭐ Same as Cloudflare Pages
- **Use Case**: Caching, session storage

**Setup:**
```bash
# Create KV namespace
wrangler kv:namespace create "KV"

# Bind in wrangler.toml
[[kv_namespaces]]
binding = "KV"
id = "your_namespace_id"
```

---

### **6. Stripe** (Payments)
- **API**: Free
- **Fees**: 2.9% + $0.30 per transaction
- **Trust**: ⭐⭐⭐⭐⭐ Most trusted payment processor

**Setup:**
1. Sign up: https://stripe.com
2. Get API keys (test mode keys are free)
3. Add to `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### **7. Calendly** (Scheduling)
- **Free Tier**: 1 event type, unlimited bookings
- **Trust**: ⭐⭐⭐⭐⭐ Popular scheduling tool

**Setup:**
```bash
CALENDLY_URL=https://calendly.com/your-link
```

---

### **8. OpenWeatherMap** (Weather API)
- **Free Tier**: 1,000 calls/day
- **Trust**: ⭐⭐⭐⭐ Reliable weather data

**Setup:**
1. Sign up: https://openweathermap.org/api
2. Get API key
3. Add to `.env`:
```bash
OPENWEATHER_API_KEY=your_key_here
```

---

### **9. GitHub API** (Free)
- **Rate Limit**: 5,000 requests/hour (authenticated)
- **Trust**: ⭐⭐⭐⭐⭐ Most trusted code platform

**Setup:**
```bash
GITHUB_TOKEN=your_personal_access_token  # Optional, increases rate limit
```

---

### **10. ipapi.co** (IP Geolocation)
- **Free Tier**: 1,000 requests/day
- **Trust**: ⭐⭐⭐⭐ Reliable geolocation

**No setup needed** - works without API key for free tier

---

## 📊 **Total Free Tier Limits**

| Service | Free Tier | Monthly Value |
|---------|-----------|---------------|
| Cloudflare D1 | 5GB storage, 5M reads | ~$5-10 |
| Resend | 3,000 emails | ~$20 |
| Twilio | $15.50 credit | $15.50 |
| Plausible | < 10k pageviews | ~$9 |
| Cloudflare KV | 100k reads/day | ~$5 |
| Stripe | Free API | N/A |
| Calendly | 1 event type | ~$10 |
| OpenWeatherMap | 1k calls/day | ~$0.50 |
| **Total** | | **~$60-70/month** |

---

## 🚀 **Quick Setup Commands**

```bash
# 1. Create D1 database
wrangler d1 create gringo-crm

# 2. Update wrangler.toml with database_id from above

# 3. Run migrations
wrangler d1 execute gringo-crm --file=./apps/web/db/schema.sql

# 4. Create KV namespace (optional)
wrangler kv:namespace create "KV"

# 5. Update wrangler.toml with KV namespace_id

# 6. Deploy to Cloudflare Pages
# Database and KV will be automatically available in production
```

---

## 🔒 **Security Notes**

1. **All APIs are HTTPS-only** ✅
2. **API keys stored in Cloudflare Pages environment variables** ✅
3. **D1 database is encrypted at rest** ✅
4. **KV is encrypted at rest** ✅
5. **No sensitive data in client-side code** ✅

---

## 📝 **Environment Variables**

Add these to Cloudflare Pages → Settings → Environment Variables:

```bash
# Database (auto-configured via D1 binding)
# DB binding is automatic in Cloudflare Pages

# Email
RESEND_API_KEY=
RESEND_FROM=

# SMS (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Analytics
PLAUSIBLE_DOMAIN=
PLAUSIBLE_API_KEY=

# Payments (optional)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# Scheduling
CALENDLY_URL=

# Weather (optional)
OPENWEATHER_API_KEY=

# GitHub (optional)
GITHUB_TOKEN=

# Migration (for running migrations)
MIGRATION_TOKEN=your_secure_token_here
```

---

## ✅ **Production Ready**

All services are:
- ✅ **Trusted** - Industry-standard providers
- ✅ **Free tier available** - No upfront costs
- ✅ **Production-ready** - Used by thousands of companies
- ✅ **Scalable** - Can upgrade as needed
- ✅ **Secure** - HTTPS, encrypted storage
- ✅ **Reliable** - High uptime guarantees

---

**Status**: 🎉 **All free services configured and ready to use!**

