# 🔐 Environment Variables Setup

## 📋 After Signups, Add These to `.env`

```bash
# API Keys - Add your actual keys to .env (never commit .env!)
RESEND_API_KEY=your_resend_key_here
GEMINI_API_KEY=your_gemini_key_here
GROK_API_KEY=your_grok_key_here
HUGGINGFACE_KEY=your_huggingface_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here
POE_API_KEY=your_poe_key_here
GHL_API_KEY=your_ghl_key_here
AIMLAPI_API_KEY=your_aimlapi_key_here

# NEW - Add After Signups
CALENDLY_URL=https://calendly.com/your-username
PLAUSIBLE_API_KEY=your_plausible_key_here
BUFFER_TOKEN=your_buffer_token_here
META_PAGE_ACCESS_TOKEN=your_meta_token_here
SLACK_WEBHOOK_URL=your_slack_webhook_here
NEXT_PUBLIC_WHATSAPP_NUMBER=+573001234567

# Cloudflare (set in Cloudflare dashboard)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

---

## 🔑 Where to Get Each Key

### Calendly
1. Sign in to Calendly
2. Go to Settings → Integrations
3. Copy your Calendly URL

### Plausible
1. Sign in to Plausible
2. Go to Settings → API
3. Generate API key

### Buffer
1. Sign in to Buffer
2. Go to Settings → API
3. Generate access token

### Meta (Facebook/Instagram)
1. Go to Facebook Developers
2. Create app
3. Get Page Access Token

### Slack
1. Create Slack app
2. Enable Incoming Webhooks
3. Copy webhook URL

---

## 📧 Email Credentials

Save these securely (password manager recommended):

```
Email: info@gringoconection.com (or info.gringoconection@gmail.com)
Password: [save securely]
```

---

## ✅ Next Steps

1. Complete signups
2. Get API keys/tokens
3. Add to `.env` file
4. Add to Vercel environment variables
5. Test connections

