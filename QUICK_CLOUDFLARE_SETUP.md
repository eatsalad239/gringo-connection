# 🚀 QUICK CLOUDFLARE SETUP - DO THIS NOW

## ⚡ **FASTEST WAY TO DEPLOY**

**The GitHub Actions approach is failing because secrets aren't set. Use Cloudflare Dashboard instead - it's easier and faster!**

---

## 📋 **STEP-BY-STEP (5 MINUTES)**

### **Step 1: Go to Cloudflare Pages**

**URL**: https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/workers-and-pages

### **Step 2: Create Pages Project**

1. Click **"Create application"** button
2. Click **"Pages"** tab
3. Click **"Connect to Git"**

### **Step 3: Connect GitHub**

1. **Authorize Cloudflare** (if needed)
2. **Select repository**: `eatsalad239/gringo-connection`
3. Click **"Begin setup"**

### **Step 4: Configure Build**

**Project name**: `gringo-connection`

**Build settings**:
- **Framework preset**: `Next.js` (auto-detected)
- **Production branch**: `main`
- **Root directory**: `apps/web`
- **Build command**: `pnpm install && pnpm build`
- **Build output directory**: `.next` (Cloudflare auto-detects this)

**Node.js version**: `18` (or latest)

### **Step 5: Add Environment Variables**

Click **"Environment variables"** and add these (copy from your `.env`):

```
NEXT_PUBLIC_SITE_URL=https://gringoconnection.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=gringoconnection.com
RESEND_API_KEY=re_JsmayKyb_47gTHYN32ANWcQwMR9etFDF1
```

(Add all other keys from `.env` as needed)

### **Step 6: Deploy**

1. Click **"Save and Deploy"**
2. Wait ~3-5 minutes for build
3. Check build logs for any errors

### **Step 7: Add Custom Domain**

1. After deployment succeeds, go to **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter: `gringoconnection.com`
4. Cloudflare will configure DNS automatically
5. Wait for SSL certificate (~5 minutes)

---

## ✅ **WHY THIS IS BETTER**

- ✅ **No GitHub secrets needed** - Cloudflare handles authentication
- ✅ **Automatic deployments** - Deploys on every push to `main`
- ✅ **Cloudflare builds it** - No need to configure build output
- ✅ **Free SSL** - Automatic HTTPS
- ✅ **Global CDN** - Fast worldwide

---

## 🎯 **AFTER DEPLOYMENT**

Your site will be live at:
- **Preview URL**: `https://gringo-connection.pages.dev` (immediate)
- **Custom Domain**: `https://gringoconnection.com` (after DNS/SSL)

---

**That's it! Much simpler than GitHub Actions.** 🚀

