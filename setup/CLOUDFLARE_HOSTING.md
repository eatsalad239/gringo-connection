# ☁️ Cloudflare Hosting Setup - Primary Hosting

## 🎯 **Cloudflare Hosting (Not Vercel)**

You're hosting on **Cloudflare Pages** (not Vercel). Here's the complete setup:

---

## ✅ **What Cloudflare Provides**

### **1. Cloudflare Pages** (Hosting)
- ✅ Free Next.js hosting
- ✅ Automatic deployments from GitHub
- ✅ Global CDN
- ✅ Custom domain support
- ✅ Environment variables

### **2. Cloudflare Email Routing** (Email)
- ✅ Free email forwarding
- ✅ Create: info@gringoconnection.com
- ✅ Forward to any email
- ✅ No email server needed

### **3. Cloudflare DNS** (Domain Management)
- ✅ DNS management
- ✅ Move domain from Vercel to Cloudflare
- ✅ Full control

---

## 🚀 **Setup Steps**

### **Step 1: Cloudflare Account**
1. Sign up at https://dash.cloudflare.com/sign-up
2. Use: info.gringoconnection@gmail.com (or create new)
3. Complete verification

### **Step 2: Add Domain**
1. In Cloudflare dashboard: "Add a Site"
2. Enter: gringoconnection.com
3. Choose Free plan
4. Get nameservers from Cloudflare

### **Step 3: Add Domain to Cloudflare**
1. In Cloudflare dashboard: "Add a Site"
2. Enter: gringoconnection.com
3. Cloudflare will scan existing DNS records
4. Update nameservers at your domain registrar to Cloudflare nameservers
5. Wait for DNS propagation (15 min - 48 hours)

### **Step 4: Cloudflare Pages Deployment**
1. In Cloudflare: Pages → Create Project
2. Connect GitHub repo
3. Configure:
   - Framework: Next.js
   - Build command: `pnpm build`
   - Build output: `.next`
   - Root directory: `apps/web`
4. Add environment variables
5. Deploy!

### **Step 5: Cloudflare Email Routing**
1. In Cloudflare: Email → Email Routing
2. Enable Email Routing
3. Create address: info@gringoconnection.com
4. Forward to: your-main-email@gmail.com

---

## 📋 **Domain Setup Process**

### **Add Domain to Cloudflare**
1. In Cloudflare dashboard: "Add a Site"
2. Enter: gringoconnection.com
3. Choose Free plan
4. Update nameservers at your domain registrar to Cloudflare nameservers
5. Wait for DNS propagation (15 min - 48 hours)

**Cloudflare will manage DNS and hosting - everything in one place!**

---

## 🔧 **Builder CLI Already Configured**

Your builder CLI already supports Cloudflare:

```bash
# Deploy to Cloudflare Pages
pnpm deploy:cloudflare

# Or use builder directly
pnpm builder deploy cloudflare
```

---

## 📧 **Email Setup**

### **Cloudflare Email Routing (Free)**
- ✅ Create: info@gringoconnection.com
- ✅ Forward to: your-main-email@gmail.com
- ✅ No email server needed
- ✅ Free forever

### **Alternative: Gmail Alias**
- Use: info.gringoconnection@gmail.com
- Works for all signups

---

## 🎯 **Final Setup**

1. ✅ Sign up for Cloudflare
2. ✅ Add domain
3. ✅ Update nameservers
4. ✅ Deploy via Cloudflare Pages
5. ✅ Set up Email Routing
6. ✅ Done!

**Everything will be on Cloudflare - no Vercel needed!**

