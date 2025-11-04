# 🚀 DEPLOY TO CLOUDFLARE PAGES - RIGHT NOW

## ⚠️ **CURRENT STATUS: NOT LIVE**

The site is **NOT deployed**. Domain still points to Vercel (404 error).

---

## ✅ **QUICK DEPLOYMENT (5 MINUTES)**

### **Step 1: Go to Cloudflare Dashboard**

1. **Login**: https://dash.cloudflare.com/login
2. **Account**: dan@doorknockingsucks.com
3. **Go to**: Workers & Pages → https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/workers-and-pages

### **Step 2: Create Pages Project**

1. Click **"Create application"** → **"Pages"** → **"Connect to Git"**
2. **Authorize GitHub** (if needed)
3. **Select repository**: `eatsalad239/gringo-connection`
4. **Click "Begin setup"**

### **Step 3: Configure Build Settings**

**Project name**: `gringo-connection`

**Framework preset**: `Next.js` (auto-detected)

**Production branch**: `main`

**Root directory**: `apps/web`

**Build command**: 
```bash
pnpm install && pnpm build
```

**Build output directory**: `.next` (Cloudflare auto-detects Next.js)

**Node.js version**: `18` (or latest)

### **Step 4: Add Environment Variables**

Click **"Environment variables"** and add:

```
NEXT_PUBLIC_SITE_URL=https://gringoconnection.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=gringoconnection.com
RESEND_API_KEY=re_JsmayKyb_47gTHYN32ANWcQwMR9etFDF1
GEMINI_API_KEY=(your key)
GROK_API_KEY=(your key)
PERPLEXITY_API_KEY=(your key)
GHL_API_KEY=(your key)
BUFFER_API_KEY=(your key)
BUFFER_ACCESS_TOKEN=(your token)
META_APP_ID=(your app id)
META_APP_SECRET=(your secret)
META_ACCESS_TOKEN=(your token)
EOD_TO=dan@doorknockingsucks.com,Eddy@doorknockingsucks.com
ALERT_TO=dan@doorknockingsucks.com,Eddy@doorknockingsucks.com
LEAD_FORWARD_TO=dan@doorknockingsucks.com,Eddy@doorknockingsucks.com
```

### **Step 5: Deploy**

1. Click **"Save and Deploy"**
2. Wait for build (~3-5 minutes)
3. Check build logs for errors

### **Step 6: Connect Custom Domain**

1. After deployment succeeds, go to **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter: `gringoconnection.com`
4. Cloudflare will configure DNS automatically
5. Wait for SSL certificate (~5 minutes)

---

## 🔧 **IF BUILD FAILS**

### **Common Issues:**

1. **"pnpm not found"**
   - Change build command to: `npm install -g pnpm && pnpm install && pnpm build`

2. **"Build output not found"**
   - Make sure **Root directory** is `apps/web`
   - Build output should be `.next` (auto-detected)

3. **"Module not found"**
   - Make sure **Root directory** is set to `apps/web`

---

## ✅ **VERIFY IT'S LIVE**

After deployment:

1. **Check deployment URL**: `https://gringo-connection.pages.dev`
2. **Check custom domain**: `https://gringoconnection.com`
3. **Test grants page**: `https://gringoconnection.com/grants`
4. **Test API**: `https://gringoconnection.com/api/status`

---

## 🎯 **AFTER DEPLOYMENT**

Once live, you can:
- Test all pages
- Verify APIs work
- Check grants page
- Test contact form

---

**Status**: ⏳ **Ready to deploy - just follow steps above**

