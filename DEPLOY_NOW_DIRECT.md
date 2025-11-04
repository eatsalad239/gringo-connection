# 🚀 DEPLOY NOW - DIRECT INSTRUCTIONS

## ⚡ **IMMEDIATE ACTION REQUIRED**

The site is **NOT live**. Here's exactly what to do RIGHT NOW:

---

## **METHOD 1: Cloudflare Dashboard (FASTEST - 3 minutes)**

### **Step 1: Login**
1. Go to: https://dash.cloudflare.com/login
2. Login with: **dan@doorknockingsucks.com**

### **Step 2: Create Pages Project**
1. Go to: https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/workers-and-pages
2. Click: **"Create application"** → **"Pages"** → **"Connect to Git"**
3. Authorize GitHub if needed
4. Select: **`eatsalad239/gringo-connection`**
5. Click: **"Begin setup"**

### **Step 3: Build Settings**
```
Project name: gringo-connection
Framework preset: Next.js (auto-detected)
Production branch: main
Root directory: apps/web
Build command: pnpm install && pnpm build
Build output directory: .next
Node.js version: 18
```

### **Step 4: Environment Variables**
Click **"Environment variables"** → **"Add variable"** for each:

```
NEXT_PUBLIC_SITE_URL = https://gringoconnection.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN = gringoconnection.com
RESEND_API_KEY = re_JsmayKyb_47gTHYN32ANWcQwMR9etFDF1
```

(Add all other API keys from your .env file)

### **Step 5: Deploy**
1. Click **"Save and Deploy"**
2. Wait 3-5 minutes
3. Check build logs

### **Step 6: Connect Domain**
1. After successful deployment → **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter: **`gringoconnection.com`**
4. Cloudflare will auto-configure DNS
5. Wait 5 minutes for SSL

---

## **METHOD 2: GitHub Actions (Auto-Deploy)**

### **Add GitHub Secrets:**

1. Go to: https://github.com/eatsalad239/gringo-connection/settings/secrets/actions
2. Click **"New repository secret"**

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: Get from https://dash.cloudflare.com/profile/api-tokens
  - Click **"Create Token"**
  - Use **"Edit Cloudflare Workers"** template
  - Account Resources: Include **Account** → **Workers & Pages** → **Edit**
  - Click **"Continue to summary"** → **"Create Token"**
  - Copy the token

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: `38e10c60356f1836dc65116ac92ae0ef`

### **Trigger Deployment:**
1. Go to: https://github.com/eatsalad239/gringo-connection/actions
2. Click **"Deploy to Cloudflare Pages"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for deployment

---

## **METHOD 3: Wrangler CLI (Local)**

```bash
# Install wrangler
npm install -g wrangler

# Login
wrangler login

# Navigate to app
cd apps/web

# Build
pnpm install && pnpm build

# Deploy
wrangler pages deploy .next \
  --project-name=gringo-connection \
  --compatibility-date=2024-01-01
```

---

## ✅ **VERIFY IT'S LIVE**

After deployment:

```bash
curl -I https://gringoconnection.com
```

Look for: `server: cloudflare` ✅  
NOT: `server: Vercel` ❌

---

## 🎯 **RECOMMENDED: Use METHOD 1 (Dashboard)**

It's the fastest and most reliable way to get it live RIGHT NOW.

**Status**: ⏳ **WAITING FOR DEPLOYMENT**

