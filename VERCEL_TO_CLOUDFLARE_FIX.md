# 🔧 FIXING VERCEL → CLOUDFLARE MIGRATION

## ✅ **COMPLETED**
- ✅ Domain added to Cloudflare (`gringoconnection.com`)
- ✅ Email Routing set up (`info@gringoconnection.com` → `dan@doorknockingsucks.com`)
- ✅ Found Vercel NS records: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

## ⚠️ **IN PROGRESS**
- ⏳ Creating Cloudflare Pages project (`gringo-connection`)
- ⏳ Removing Vercel NS records from DNS
- ⏳ Updating nameservers at domain registrar

## 📋 **ACTION ITEMS**

### **1. Create Cloudflare Pages Project**
- Project name: `gringo-connection`
- Connect to GitHub: `eatsalad239/gringo-connection`
- Branch: `main`
- Build command: `pnpm install && pnpm build`
- Build output: `.next` (Next.js server mode)

### **2. Remove Vercel DNS Records**
- ❌ Delete NS records: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- ⚠️ These are informational - actual nameservers set at registrar

### **3. Update Nameservers at Domain Registrar**
**Cloudflare Nameservers:**
- `frida.ns.cloudflare.com`
- `lamar.ns.cloudflare.com`

**Steps:**
1. Log into domain registrar (where `gringoconnection.com` is registered)
2. Find DNS/Nameserver settings
3. Replace Vercel nameservers with Cloudflare nameservers above
4. Wait 24-48 hours for propagation

### **4. Connect Custom Domain to Pages**
- After Pages project is created:
  1. Go to Pages project → Custom domains
  2. Add `gringoconnection.com`
  3. Cloudflare will auto-configure DNS

### **5. Clean Up Old Vercel A Records**
After nameservers are updated, remove old Vercel A records:
- All A records pointing to `216.150.x.x` (Vercel IPs)
- Replace with CNAME to Cloudflare Pages or remove (Pages handles routing)

---

## 🎯 **STATUS**
- Domain: Added to Cloudflare ✅
- Email: Routing configured ✅
- Pages: Creating project... ⏳
- DNS: Needs cleanup ⏳
- Nameservers: Need update at registrar ⏳

