# 🌟 Gringo Connection Ecosystem

> **AI that elevates your brand. Built in Medellín.** 🇨🇴

A production-ready, bilingual monorepo for building AI-powered websites with automated social media, content generation, and operator agents.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ **Features**

### 🌐 **Bilingual Next.js Website**
- ✅ EN/ES language support with route segments
- ✅ SEO-optimized with Open Graph
- ✅ Responsive design (Tailwind CSS)
- ✅ Contact forms with CRM integration
- ✅ WhatsApp integration

### 🤖 **AI-Powered Automation**
- ✅ **Social Media Posts**: Automated EN/ES post generation (30+ posts)
- ✅ **Media Creation**: SDXL images, SVD videos, ZeroScope fallback
- ✅ **Content Calendar**: 30-day rolling schedule
- ✅ **Ad Generation**: Bilingual ad sets

### 📅 **Smart Scheduling**
- ✅ **Buffer Integration**: Direct scheduling
- ✅ **Meta Graph API**: Facebook/Instagram posting
- ✅ **Manual Fallback**: ZIP posting packs
- ✅ **Auto-top-up**: Queue maintains 30+ days

### 👥 **Operator Agents**
- ✅ **Intake Agent**: Priority questions (09:15 & 14:00)
- ✅ **EOD Agent**: Daily reports (21:30)
- ✅ **Grant Agent**: Opportunity alerts (Mon/Thu 08:00)
- ✅ **QA Agent**: Post verification
- ✅ **Alert Agent**: Real-time notifications

### 🛠️ **V0-Clone Builder CLI**
- ✅ **Cloudflare Pages**: One-command deployment
- ✅ **Netlify**: One-command deployment
- ✅ **Auto-config**: Creates config files automatically

---

## 🚀 **Quick Start**

```bash
# Clone
git clone <your-repo>
cd gringo-connection

# Install
pnpm install

# Configure
cp env.example .env
# Add your API keys (see below)

# Run website
pnpm dev
# Visit http://localhost:3000

# Generate posts
pnpm social:generate

# Run scheduler
pnpm daily:schedule
```

---

## 🔑 **Required API Keys**

```bash
# Email (Required)
RESEND_API_KEY=re_xxxxx

# LLM (At least one required)
GEMINI_API_KEY=AIzaSy_xxxxx
# OR
GROK_API_KEY=xai-xxxxx
# OR
PERPLEXITY_API_KEY=pplx-xxxxx

# Media (Required)
HUGGINGFACE_KEY=hf_xxxxx
```

**See `env.example` for all options.**

---

## 📁 **Project Structure**

```
gringo-connection/
├── apps/
│   └── web/              # Next.js website
│       ├── app/          # Pages & API routes
│       ├── components/   # React components
│       └── lib/          # Utilities
├── automation/           # Automation scripts
│   ├── agents/           # Operator agents
│   ├── media/            # Media generation
│   └── templates/        # Email templates
├── content/              # JSON content files
├── packages/
│   └── builder-cli/      # V0-clone builder
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

---

## 📚 **Documentation**

- **[Complete Setup Guide](docs/COMPLETE_SETUP_GUIDE.md)** - Full setup instructions
- **[Function List](COMPLETE_FUNCTION_LIST.md)** - All 50+ functions
- **[Meta/Facebook Setup](docs/META_FACEBOOK_SETUP.md)** - Facebook integration
- **[Open Source Guide](OPEN_SOURCE.md)** - Open source details
- **[Contributing](CONTRIBUTING.md)** - How to contribute

---

## 🎯 **Daily Automation**

The system runs automatically via GitHub Actions:

1. **07:00 Bogota** - Daily automation starts
2. **Generate Posts** - Creates 30+ EN/ES posts
3. **QA Verification** - Verifies post safety
4. **Build Calendar** - Creates 30-day schedule
5. **Schedule Posts** - Posts via Buffer → Meta → Manual pack
6. **Send Summary** - Emails daily report

**Set up once, runs forever!**

---

## 🛠️ **Available Commands**

```bash
# Development
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm lint             # Run linter

# Automation
pnpm social:generate  # Generate social posts
pnpm daily:schedule   # Run daily scheduler
pnpm ads:generate     # Generate ad sets
pnpm tours:run        # Sync tours
pnpm grants:run       # Run grant radar

# Deployment
pnpm deploy:cloudflare  # Deploy to Cloudflare
pnpm deploy:netlify    # Deploy to Netlify
```

---

## 🎨 **Customization**

### **Content**
All content is in JSON files under `content/`:
- `i18n/en.json` & `i18n/es.json` - Translations
- `services.json` - Services
- `tours.json` - Tours
- `social/posts.seed.json` - Seed posts

### **Styling**
- Tailwind CSS - Modify `apps/web/tailwind.config.js`
- Components - Edit `apps/web/components/`

### **Automation**
- Agents - Customize `automation/agents/`
- Templates - Edit `automation/agents/templates/`
- Scheduler - Modify `automation/scheduler.ts`

---

## 🔧 **Tech Stack**

- **Next.js 14** - React framework
- **TypeScript 5.3** - Type safety
- **Tailwind CSS** - Styling
- **Hugging Face** - Media generation
- **Resend** - Email
- **GoHighLevel** - CRM
- **Buffer** - Social scheduling
- **Meta Graph API** - Facebook/Instagram

---

## 📊 **Status**

✅ **100% Functional**
- 50+ functions
- 93+ files
- ~6,900 lines of code
- Production-ready

---

## 🤝 **Contributing**

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 **License**

MIT License - Use freely for personal and commercial projects.

---

## 🙏 **Credits**

Built with love in Medellín, Colombia 🇨🇴

---

## 🆘 **Support**

- **Issues**: GitHub Issues
- **Docs**: See `docs/` folder
- **Setup Help**: See `docs/COMPLETE_SETUP_GUIDE.md`

---

**Ready to elevate your brand with AI?** 🚀

```bash
git clone <repo>
pnpm install
cp env.example .env
# Add your keys
pnpm dev
```

**That's it. You're live.** ✨
