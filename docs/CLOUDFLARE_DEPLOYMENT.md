# ☁️ Cloudflare Pages Deployment Guide

## 🎯 **Complete Cloudflare Setup**

You're hosting on **Cloudflare Pages** (not Vercel). Here's everything you need:

---

## 📋 **Prerequisites**

1. ✅ Cloudflare account (free)
2. ✅ Domain: gringoconnection.com
3. ✅ GitHub repo with your code
4. ✅ API keys in environment variables

---

## 🚀 **Step-by-Step Deployment**

### **1. Sign Up for Cloudflare**

1. Go to: https://dash.cloudflare.com/sign-up
2. Sign up with: info.gringoconnection@gmail.com
3. Verify email
4. Complete account setup

### **2. Add Domain to Cloudflare**

1. In Cloudflare dashboard: Click **"Add a Site"**
2. Enter: `gringoconnection.com`
3. Select **Free plan**
4. Cloudflare will scan existing DNS records
5. Review and confirm

### **3. Update Nameservers**

**Domain Setup**
1. Go to your domain registrar (where you bought it)
2. Update nameservers to Cloudflare's:
   - `ns1.cloudflare.com`
   - `ns2.cloudflare.com`
3. Wait for propagation

### **4. Deploy via Cloudflare Pages**

#### **Method A: Using Builder CLI** (Recommended)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
pnpm deploy:cloudflare
```

#### **Method B: Via Cloudflare Dashboard**

1. In Cloudflare: **Pages** → **Create a project**
2. **Connect to Git** → Select GitHub repo
3. Configure:
   - **Project name**: `gringo-connection`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Build command**: `cd apps/web && pnpm install && pnpm build`
   - **Build output directory**: `apps/web/.next`
   - **Root directory**: `apps/web`
4. **Environment variables**: Add all from `.env`
5. **Save and Deploy**

### **5. Configure Custom Domain**

1. In Cloudflare Pages: **Custom domains** → **Set up a custom domain**
2. Enter: `gringoconnection.com`
3. Cloudflare will automatically configure DNS
4. Wait for SSL certificate (automatic, ~5 min)

---

## 📧 **Email Routing Setup**

### **Enable Email Routing**

1. In Cloudflare: **Email** → **Email Routing** → **Get started**
2. Add destination address (your main email)
3. Create routing address: `info@gringoconnection.com`
4. Forward to: your-main-email@gmail.com

**Done!** Now you have info@gringoconnection.com forwarding to your email.

---

## 🔑 **Environment Variables**

Add to Cloudflare Pages:

1. In Pages project: **Settings** → **Environment variables**
2. Add all variables from `.env`:
   - `RESEND_API_KEY`
   - `GEMINI_API_KEY`
   - `GROK_API_KEY`
   - `PERPLEXITY_API_KEY`
   - `AIMLAPI_API_KEY`
   - `AIMLAPI_MODEL`
   - `HUGGINGFACE_KEY`
   - `GHL_API_KEY`
   - `EOD_TO`
   - `ALERT_TO`
   - `DEFAULT_TZ`
   - And all others

---

## 🔄 **Auto-Deployments**

Cloudflare Pages automatically deploys on:
- Push to `main` branch
- Pull requests (preview deployments)

**No manual deployment needed!**

---

## 🛠️ **Wrangler Configuration**

Your `wrangler.toml` will be auto-generated, or create manually:

```toml
name = "gringo-connection"
compatibility_date = "2024-01-01"

[env.production]
account_id = "your-cloudflare-account-id"
pages_build_output_dir = "apps/web/.next"
```

---

## ✅ **Verification**

After deployment:

1. ✅ Visit: `https://gringoconnection.com`
2. ✅ Check SSL certificate (automatic)
3. ✅ Test contact form
4. ✅ Verify environment variables work
5. ✅ Check GitHub Actions deploy

---

## 🎯 **Status**

**Hosting**: Cloudflare Pages ✅
**Domain**: gringoconnection.com ✅
**Email**: Cloudflare Email Routing ✅
**DNS**: Cloudflare ✅
**SSL**: Automatic ✅

**Everything on Cloudflare - no Vercel needed!**

