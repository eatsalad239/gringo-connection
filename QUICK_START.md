# ⚡ Quick Start Guide

## 🎯 Your Website Location

```
/Users/danielsmith/gringo connection/apps/web/
```

## 🚀 Run Your Website (3 Steps)

### 1. Install pnpm (if needed)
```bash
npm install -g pnpm
# OR use npx (no install)
npx pnpm install
```

### 2. Install Dependencies
```bash
cd "/Users/danielsmith/gringo connection"
pnpm install
```

### 3. Start Dev Server
```bash
pnpm dev
```

**Open**: http://localhost:3000

## ✅ What You Have

### ✅ Complete Website
- ✅ Home page with hero, services, testimonials, FAQ
- ✅ Services page (`/services`)
- ✅ Tours page (`/tours`)
- ✅ Partners page (`/partners`)
- ✅ Contact page (`/contact`)
- ✅ Vertical pages (`/verticals/[slug]`)
- ✅ Legal pages (`/legal/privacy`, `/legal/terms`)
- ✅ Success/Cancelled pages
- ✅ WhatsApp float button
- ✅ Bilingual EN/ES support

### ✅ Automation System
- ✅ Social post generation
- ✅ 30-day content calendar
- ✅ Daily scheduler (Buffer → Meta → Manual pack)
- ✅ Operator agents (Intake, EOD, Grants, QA, Alerts)
- ✅ Media generation (SDXL, SVD, ZeroScope)

### ✅ Content Files
- ✅ 20+ seed social posts
- ✅ 8 services with capabilities
- ✅ 5 verticals
- ✅ Tours (AI Coffee, Cocktail & Code)
- ✅ Grants matrix
- ✅ FAQ, testimonials, partners

## 📋 Pages Checklist

✅ `/` - Home  
✅ `/services` - Services listing  
✅ `/tours` - Tours page  
✅ `/partners` - Partners page  
✅ `/contact` - Contact form  
✅ `/verticals/[slug]` - Dynamic vertical pages  
✅ `/legal/privacy` - Privacy policy  
✅ `/legal/terms` - Terms & conditions  
✅ `/success` - Form success page  
✅ `/cancelled` - Payment cancelled page  

## 🎨 Features

- ✅ Bilingual (EN/ES-CO)
- ✅ Responsive design (Tailwind CSS)
- ✅ WhatsApp integration
- ✅ Lead capture API
- ✅ SEO-ready (OG tags, metadata)
- ✅ TypeScript
- ✅ Next.js 14 App Router

## 🔧 Quick Commands

```bash
# Development
pnpm dev              # Start website
pnpm build            # Build for production
pnpm lint             # Lint code
pnpm typecheck        # Type check

# Content Generation
pnpm social:generate  # Generate posts
pnpm daily:schedule   # Run scheduler
pnpm ads:generate     # Generate ads

# Agents
pnpm tsx automation/agents/intakeAgent.ts
pnpm tsx automation/agents/eodAgent.ts

# Deployment
pnpm deploy:cloudflare
pnpm deploy:netlify
```

## 📍 Key Files

- **Website**: `apps/web/`
- **Content**: `content/`
- **Automation**: `automation/`
- **Config**: `.env` (API keys)

## 🐛 Troubleshooting

**Can't find pnpm?**
```bash
npm install -g pnpm
```

**Port 3000 in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Build errors?**
```bash
pnpm install
pnpm typecheck
```

---

**Everything is ready!** Just run `pnpm dev` and visit http://localhost:3000 🎉

