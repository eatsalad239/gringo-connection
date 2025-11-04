# 🚀 DEPLOY NOW - Quick Guide

## ⚡ **Fastest Way to Go Live (5 minutes)**

### **Step 1: Go to Cloudflare** (1 min)
1. Open: https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/workers-and-pages
2. Click: **"Create application"** → **Pages** → **Connect to Git**

### **Step 2: Connect GitHub** (1 min)
1. Select repo: `eatsalad239/gringo-connection`
2. Branch: `main`
3. Click **"Begin setup"**

### **Step 3: Configure Build** (1 min)
```
Framework preset: Next.js (Static HTML Export)
Root directory: apps/web
Build command: pnpm install && pnpm build
Build output directory: out
```

### **Step 4: Add Environment Variables** (1 min)
Click **"Environment variables"** and add:
```
NEXT_PUBLIC_SITE_URL=https://gringoconnection.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=gringoconnection.com
```

### **Step 5: Deploy** (1 min)
1. Click **"Save and Deploy"**
2. Wait ~2-3 minutes for build
3. Site will be live at: `https://gringo-connection.pages.dev`

### **Step 6: Connect Domain** (1 min)
1. In Pages project → **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter: `gringoconnection.com`
4. Follow DNS instructions

**Done!** 🎉

---

## ✅ **Everything is Fixed**

- ✅ Build configuration correct
- ✅ GitHub Actions workflow ready
- ✅ Static export configured
- ✅ All files in place

**Just follow the steps above and you're live!**

