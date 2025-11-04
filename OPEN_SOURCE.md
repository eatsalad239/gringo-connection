# 🌟 Gringo Ecosystem - Open Source

## 🎯 **What This Is**

A **production-ready, bilingual monorepo** for building AI-powered websites with automated social media, content generation, and operator agents.

**Built for**: Agencies, freelancers, and businesses who want enterprise-grade automation without the enterprise price tag.

---

## ✨ **Features**

### 🌐 **Bilingual Next.js Website**
- EN/ES language support
- SEO-optimized
- Responsive design
- Contact forms with CRM integration
- WhatsApp integration

### 🤖 **AI-Powered Content Generation**
- **Social Media Posts**: Automated EN/ES post generation
- **Media Creation**: SDXL images, SVD videos, ZeroScope fallback
- **Content Calendar**: 30-day rolling schedule
- **Ad Generation**: Bilingual ad sets

### 📅 **Automated Scheduling**
- **Buffer Integration**: Direct scheduling
- **Meta Graph API**: Facebook/Instagram posting
- **Manual Fallback**: ZIP posting packs
- **Smart Queue**: Auto-top-up when low

### 👥 **Operator Agents**
- **Intake Agent**: Priority questions (09:15 & 14:00)
- **EOD Agent**: Daily reports (21:30)
- **Grant Agent**: Opportunity alerts (Mon/Thu 08:00)
- **QA Agent**: Post verification
- **Alert Agent**: Real-time notifications

### 🛠️ **V0-Clone Builder CLI**
- **Cloudflare Pages**: One-command deployment
- **Netlify**: One-command deployment
- **Auto-config**: Creates config files automatically

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
# Add your API keys

# Run
pnpm dev
```

**That's it!** Visit `http://localhost:3000`

---

## 📦 **Tech Stack**

### **Core**
- **Next.js 14** - React framework (App Router)
- **TypeScript 5.3** - Type safety
- **Tailwind CSS** - Styling
- **pnpm** - Package manager

### **AI/ML**
- **Gemini** - Primary LLM
- **Grok** - Fallback LLM
- **Perplexity** - Fallback LLM
- **AIMLAPI** - Fallback LLM
- **POE** - Fallback LLM
- **Hugging Face** - Media generation (SDXL, SVD, ZeroScope)

### **Services**
- **Resend** - Email sending
- **GoHighLevel** - CRM integration
- **Buffer** - Social scheduling
- **Meta Graph API** - Facebook/Instagram
- **Plausible** - Privacy-friendly analytics

---

## 📁 **Project Structure**

```
gringo-connection/
├── apps/
│   └── web/              # Next.js website
│       ├── app/          # Pages & API routes
│       ├── components/   # React components
│       └── lib/          # Utilities
├── automation/          # Automation scripts
│   ├── agents/          # Operator agents
│   ├── media/          # Media generation
│   └── templates/      # Email templates
├── content/            # JSON content files
├── packages/
│   └── builder-cli/   # V0-clone builder
├── scripts/           # Utility scripts
└── docs/              # Documentation
```

---

## 🔧 **Configuration**

### **Required API Keys**

```bash
# Email
RESEND_API_KEY=re_xxxxx

# LLM (at least one)
GEMINI_API_KEY=AIzaSy_xxxxx
# OR
GROK_API_KEY=xai-xxxxx
# OR
PERPLEXITY_API_KEY=pplx-xxxxx

# Media
HUGGINGFACE_KEY=hf_xxxxx

# CRM (optional)
GHL_API_KEY=eyJ_xxxxx
```

### **Optional Integrations**

```bash
# Social Media
BUFFER_TOKEN=xxxxx
META_PAGE_ACCESS_TOKEN=xxxxx
META_PAGE_ID=xxxxx

# Analytics
PLAUSIBLE_DOMAIN=yourdomain.com

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=+573001234567

# Calendly
CALENDLY_URL=https://calendly.com/username
```

---

## 📚 **Documentation**

- **[Complete Setup Guide](docs/COMPLETE_SETUP_GUIDE.md)** - Full setup instructions
- **[Function List](COMPLETE_FUNCTION_LIST.md)** - All available functions
- **[Meta/Facebook Setup](docs/META_FACEBOOK_SETUP.md)** - Facebook integration guide
- **[Improvements](IMPROVEMENTS.md)** - Enhancement ideas

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

## 🔄 **Daily Automation**

The system runs automatically via GitHub Actions:

1. **07:00 Bogota** - Daily automation starts
2. **Generate Posts** - Creates 30+ EN/ES posts
3. **QA Verification** - Verifies post safety
4. **Build Calendar** - Creates 30-day schedule
5. **Schedule Posts** - Posts via Buffer → Meta → Manual pack
6. **Send Summary** - Emails daily report

**No manual work needed!**

---

## 🤝 **Contributing**

We welcome contributions! Areas we'd love help with:

- **Additional LLM providers**
- **More media generation models**
- **New operator agents**
- **UI/UX improvements**
- **Documentation**

See `CONTRIBUTING.md` for guidelines.

---

## 📄 **License**

MIT License - Use freely for personal and commercial projects.

---

## 🙏 **Credits**

Built with:
- Next.js by Vercel
- Hugging Face models
- Resend for email
- Tailwind CSS
- And many more open-source tools

---

## 🆘 **Support**

- **Issues**: GitHub Issues
- **Docs**: See `docs/` folder
- **Setup Help**: See `docs/COMPLETE_SETUP_GUIDE.md`

---

## ⭐ **Why Open Source?**

We believe automation shouldn't be locked behind enterprise paywalls. This is production-ready code you can use today, customize for your needs, and contribute back to.

**Built in Medellín, Colombia. For the world.** 🌎

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

