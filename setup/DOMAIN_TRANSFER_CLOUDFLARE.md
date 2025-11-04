# 🔄 Moving Domain from Vercel to Cloudflare

## 🎯 **Goal**

Move `gringoconnection.com` from Vercel to Cloudflare for:
- ✅ Hosting (Cloudflare Pages)
- ✅ DNS management
- ✅ Email routing

---

## 📋 **Transfer Process**

### **Step 1: Add Domain to Cloudflare**

1. Sign up/login to Cloudflare
2. Click **"Add a Site"**
3. Enter: `gringoconnection.com`
4. Select **Free plan**
5. Cloudflare will scan existing DNS records

### **Step 2: Get Cloudflare Nameservers**

After adding domain, Cloudflare will show:
- `ns1.cloudflare.com`
- `ns2.cloudflare.com`

**Copy these!**

### **Step 3: Update Nameservers**

**If domain is registered with Vercel:**
1. In Vercel: Domain settings → gringoconnection.com
2. Look for nameserver settings
3. Update to Cloudflare nameservers
4. Or transfer domain to Cloudflare completely

**If domain is at registrar (Namecheap, GoDaddy, etc.):**
1. Login to registrar
2. Find DNS/Nameserver settings
3. Update to Cloudflare nameservers
4. Save

### **Step 4: Wait for Propagation**

- DNS propagation: 15 minutes - 48 hours
- Usually takes 1-2 hours
- Check: https://www.whatsmydns.net/

### **Step 5: Deploy to Cloudflare Pages**

Once DNS propagates:
1. Deploy via `pnpm deploy:cloudflare`
2. Or use Cloudflare Pages dashboard
3. Website will be live on Cloudflare!

---

## ⚠️ **Important Notes**

- ✅ **Email will keep working** (Resend doesn't need domain)
- ✅ **No downtime** if done correctly
- ✅ **SSL is automatic** on Cloudflare
- ✅ **Free forever** on Cloudflare

---

## 🎯 **Current Status**

- Domain: On Vercel (needs to move to Cloudflare)
- Hosting: Will be Cloudflare Pages
- Email: Cloudflare Email Routing (info@gringoconnection.com)
- DNS: Will be Cloudflare

**Once nameservers are updated, everything moves to Cloudflare!**

