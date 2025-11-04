# Gringo Ecosystem - Setup Guide

## ✅ System Created

The complete monorepo has been created with:

1. ✅ **Next.js Bilingual Website** (`apps/web`)
   - EN/ES-CO language support
   - Pages: Home, Services, Tours, Contact, Legal
   - API routes for lead capture
   - WhatsApp float button
   - Tailwind CSS + shadcn/ui styling

2. ✅ **Builder CLI** (`packages/builder-cli`)
   - V0-clone builder for Cloudflare/Netlify
   - Deployment automation

3. ✅ **Automation Engine** (`automation/`)
   - Provider dispatch (LLM/media/mail/CRM)
   - Social engine (post generation)
   - Calendar engine (30-day rolling queue)
   - Scheduler (Buffer → Meta → Manual pack fallback)
   - Media generation (SDXL, SVD, ZeroScope, HiDiffusion)
   - Operator agents (Intake, EOD, Grants, QA, Alerts)

4. ✅ **Content Files** (`content/`)
   - i18n translations (EN/ES)
   - Services, verticals, tours
   - 20+ seed social posts
   - Grants matrix
   - FAQ, testimonials, partners

5. ✅ **GitHub Actions**
   - Daily automation workflow (07:00 Bogota)
   - CI workflow (lint/typecheck/build)

6. ✅ **Docker Compose**
   - Optional services (n8n, OpenWebUI, ComfyUI, Qdrant, Plausible)

## 🚀 Quick Start

### 1. Install pnpm (if not installed)

```bash
npm install -g pnpm
```

### 2. Install Dependencies

```bash
cd "/Users/danielsmith/gringo connection"
pnpm install
```

### 3. Configure Environment

The `.env` file has been created with your API keys. Verify all keys are present:

- ✅ RESEND_API_KEY
- ✅ GEMINI_API_KEY
- ✅ GROK_API_KEY
- ✅ HUGGINGFACE_KEY
- ✅ PERPLEXITY_API_KEY
- ✅ POE_API_KEY
- ✅ GHL_API_KEY

### 4. Generate Initial Posts

```bash
pnpm social:generate
```

This will:
- Load 20 seed posts
- Generate variations (EN/ES)
- Save to `content/social/queue.json`

### 5. Run QA Agent

```bash
pnpm tsx automation/agents/qaAgent.ts
```

Marks safe posts as `verified: true`

### 6. Build Calendar

```bash
pnpm tsx automation/calendar.ts
```

Creates 30-day posting schedule in `content/social/schedule.json`

### 7. Run Scheduler

```bash
pnpm daily:schedule
```

This will:
- Try Buffer API (if BUFFER_TOKEN set)
- Else try Meta Graph API (if META_PAGE_ACCESS_TOKEN set)
- Else create posting pack ZIP and email it

### 8. Generate Ads

```bash
pnpm ads:generate
```

Creates 3 bilingual ad sets → `dist/ads.json`

### 9. Test Agents

```bash
# Intake agent
pnpm tsx automation/agents/intakeAgent.ts

# EOD agent
pnpm tsx automation/agents/eodAgent.ts

# Grant agent
pnpm tsx automation/agents/grantAgent.ts
```

### 10. Start Dev Server

```bash
pnpm dev
```

Visit http://localhost:3000

## 📁 Key Files & Paths

### Content Editing

- **Hero/Services**: `content/i18n/en.json`, `content/i18n/es.json`
- **Services**: `content/services.json`
- **Verticals**: `content/verticals.json`
- **Tours**: `content/tours.json`
- **Social Posts**: `content/social/posts.seed.json`
- **Queue**: `content/social/queue.json` (auto-managed)
- **Schedule**: `content/social/schedule.json` (auto-managed)

### Automation

- **Providers**: `automation/providers.ts`
- **Social Engine**: `automation/socialEngine.ts`
- **Calendar**: `automation/calendar.ts`
- **Scheduler**: `automation/scheduler.ts`
- **Agents**: `automation/agents/*.ts`

### Web App

- **Pages**: `apps/web/app/**/*.tsx`
- **Components**: `apps/web/components/*.tsx`
- **API Routes**: `apps/web/app/api/**/*.ts`

## 🔄 Daily Automation

The system runs daily at **07:00 Bogota time** via GitHub Actions (`.github/workflows/daily.yml`):

1. Generate/refresh posts
2. Run QA agent
3. Build calendar
4. Schedule posts (Buffer → Meta → Manual pack)
5. Email summary

### Manual Trigger

```bash
pnpm daily:schedule
```

## 🚢 Deployment

### Cloudflare Pages

```bash
pnpm deploy:cloudflare
```

Requires:
- `wrangler.toml` (sample provided)
- Cloudflare account + API token

### Netlify

```bash
pnpm deploy:netlify
```

Requires:
- `netlify.toml` (created)
- Netlify account + CLI auth

## 📧 Email Agents

All agents send bilingual emails via Resend:

- **Intake Agent**: 09:15 & 14:00 daily
- **EOD Agent**: 21:30 daily
- **Grant Agent**: Mon & Thu 08:00
- **Alert Agent**: Real-time (deadlines, deploy fails, etc.)

## 🎨 Media Generation

Media generation uses Hugging Face Inference API:

- **Images**: SDXL (base + optional refiner)
- **Videos**: SVD (img→video) or ZeroScope fallback
- **Enhancement**: Optional HiDiffusion

Configure `HUGGINGFACE_KEY` in `.env`

## ⚠️ Important Notes

1. **Graceful Degradation**: System works even if some API keys are missing
2. **Never Lies**: No fabricated metrics or grant amounts
3. **Bilingual**: All content/outputs support EN/ES-CO
4. **Timezone**: Defaults to `America/Bogota` (configurable via `DEFAULT_TZ`)

## 🔧 Troubleshooting

### pnpm not found

```bash
npm install -g pnpm
```

### Type errors

```bash
pnpm typecheck
```

### Build fails

```bash
pnpm build
```

Check `apps/web/.next` for build output.

### Posts not generating

Check:
- LLM API keys in `.env`
- `content/social/posts.seed.json` exists
- Console logs for errors

## 📞 Support

- Review logs in console
- Check GitHub Actions workflow runs
- Verify `.env` keys are correct
- Check email delivery via Resend dashboard

---

**Status**: ✅ System Ready
**Version**: 1.0.0
**Last Updated**: ${new Date().toISOString()}

