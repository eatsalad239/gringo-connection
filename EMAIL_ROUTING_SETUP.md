# 📧 EMAIL ROUTING SETUP GUIDE

## ✅ **Status**
- Cloudflare account: **Already logged in** (`dan@doorknockingsucks.com`)
- Domain: **gringoconnection.com** - Needs to be added to Cloudflare first

---

## 🔧 **Step 1: Add Domain to Cloudflare**

1. Go to: https://dash.cloudflare.com/38e10c60356f1836dc65116ac92ae0ef/home/domains
2. Enter domain: `gringoconnection.com`
3. Click **"Continue"**
4. Cloudflare will scan for DNS records
5. Update nameservers at your domain registrar to Cloudflare's nameservers

---

## 📧 **Step 2: Set Up Email Routing**

Once the domain is added:

1. Navigate to: `https://dash.cloudflare.com/[account-id]/[zone-id]/email/routing`
2. Or go to: **Email** → **Email Routing** in the domain sidebar
3. Click **"Get Started"** or **"Enable Email Routing"**
4. Add destination address:
   - **Send from:** `info@gringoconnection.com`
   - **Send to:** `dan@doorknockingsucks.com`
5. Click **"Create address"**

---

## 🎯 **What This Does**

- **Incoming emails** to `info@gringoconnection.com` will be forwarded to `dan@doorknockingsucks.com`
- **Free** - Cloudflare Email Routing is free for up to 5 addresses
- **No Gmail needed** - You'll receive emails at your existing email address

---

## ⚠️ **Important Notes**

- Domain must be fully added to Cloudflare (nameservers updated)
- Email Routing requires DNS records to be managed by Cloudflare
- Can take up to 24 hours for DNS changes to propagate

---

**Need help?** Once the domain is added, I can help set up the Email Routing rules!

