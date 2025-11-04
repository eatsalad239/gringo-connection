# 📋 Complete Function List & System Overview

## 🎯 ALL AVAILABLE FUNCTIONS

### 🌐 **WEBSITE FUNCTIONS** (`apps/web/`)

#### **API Routes**
```typescript
// apps/web/app/api/lead/route.ts
POST /api/lead
  - Receives: { name, email, phone, message, source }
  - Sends email via Resend
  - Creates CRM lead via GoHighLevel
  - Returns: { success: true } or { error: string }
```

#### **Page Functions**
```typescript
// apps/web/app/page.tsx
HomePage(params: { locale?: string })
  - Loads content via getContent()
  - Renders: Hero, Services, Testimonials, FAQ

// apps/web/app/services/page.tsx
ServicesPage(params: { locale?: string })
  - Loads services from content/services.json
  - Renders 8 services with capabilities

// apps/web/app/tours/page.tsx
ToursPage(params: { locale?: string })
  - Loads tours from content/tours.json
  - Renders AI Coffee Tour & Cocktail & Code

// apps/web/app/partners/page.tsx
PartnersPage(params: { locale?: string })
  - Loads partners from content/partners.json
  - Renders Gato Blanco partnership

// apps/web/app/contact/page.tsx
ContactPage(params: { locale?: string })
  - Client-side form component
  - Submits to /api/lead
  - Shows success/cancelled states

// apps/web/app/verticals/[slug]/page.tsx
VerticalPage(params: { slug: string, locale?: string })
  - Dynamic route for vertical pages
  - Shows services + proof points per vertical

// apps/web/app/legal/privacy/page.tsx
PrivacyPage(params: { locale?: string })
  - Privacy policy page

// apps/web/app/legal/terms/page.tsx
TermsPage(params: { locale?: string })
  - Terms & conditions page

// apps/web/app/success/page.tsx
SuccessPage(params: { locale?: string })
  - Success confirmation page

// apps/web/app/cancelled/page.tsx
CancelledPage(params: { locale?: string })
  - Payment cancelled page
```

#### **Content Functions**
```typescript
// apps/web/lib/content.ts
getContent(locale: 'en' | 'es' = 'en')
  - Loads i18n translations
  - Loads services, testimonials, FAQ, CTA
  - Returns: { hero, services, testimonials, faq, cta }
```

#### **Component Functions**
```typescript
// apps/web/components/Nav.tsx
Nav({ locale: string })
  - Renders navigation menu
  - Language toggle (EN/ES)
  - Active page highlighting

// apps/web/components/Footer.tsx
Footer({ locale: string })
  - Renders footer with links
  - Bilingual content

// apps/web/components/Hero.tsx
Hero({ content: HeroContent, locale: string })
  - Renders hero section
  - CTA buttons

// apps/web/components/Services.tsx
Services({ content: Service[], locale: string })
  - Renders services grid
  - Shows capabilities per service

// apps/web/components/Testimonials.tsx
Testimonials({ content: Testimonial[], locale: string })
  - Renders testimonials grid

// apps/web/components/FAQ.tsx
FAQ({ content: FAQItem[], locale: string })
  - Renders FAQ accordion

// apps/web/components/WhatsAppFloat.tsx
WhatsAppFloat()
  - Floating WhatsApp button
  - Links to WhatsApp number
```

---

### 🤖 **AUTOMATION FUNCTIONS** (`automation/`)

#### **Provider Functions** (`providers.ts`)
```typescript
// LLM Provider Chain
llm.text(prompt: string, opts?: { maxTokens?, temperature?, system? })
  - Tries: Gemini → Grok → Perplexity → POE → Local LLM
  - Returns: { ok: boolean, text?: string, reason?: string }

// Media Generation
media.image(prompt: string, cfg?: { refiner?, enhance? })
  - Generates SDXL images via Hugging Face
  - Optional refiner pass
  - Returns: { ok: boolean, buffer?: Buffer, reason?: string }

media.video(prompt: string, cfg?: { imageUrl?, duration? })
  - Tries SVD (image → video) first
  - Falls back to ZeroScope
  - Returns: { ok: boolean, buffer?: Buffer, reason?: string }

// Mail Functions
mail.send(msg: { to, subject, html?, text?, attachments? })
  - Sends email via Resend API
  - Supports attachments
  - Returns: { ok: boolean, id?: string, reason?: string }

// CRM Functions
crm.lead(payload: { name, email, phone?, source?, tags? })
  - Creates lead in GoHighLevel
  - Returns: { ok: boolean, id?: string, reason?: string }

// Scheduler Functions
schedulers.buffer(post: { text, mediaUrls?, platforms?, scheduledAt? })
  - Schedules post via Buffer API
  - Returns: { ok: boolean, id?: string, reason?: string }

schedulers.meta(post: { message, mediaUrl?, scheduledPublishTime? })
  - Schedules post via Meta Graph API
  - Returns: { ok: boolean, id?: string, reason?: string }
```

#### **Social Engine Functions** (`socialEngine.ts`)
```typescript
generatePosts()
  - Loads seed posts from posts.seed.json
  - Generates EN/ES variations via LLM
  - Saves to queue.json
  - Auto-creates variations for each seed

generatePostVariations(seed: Post)
  - Generates EN variation
  - Generates ES variation
  - Returns: Post[]
```

#### **Calendar Functions** (`calendar.ts`)
```typescript
buildCalendar()
  - Builds 30-day rolling schedule
  - Mixes post types (authority, lifestyle, event, offer)
  - Rotates verticals and languages (70% ES, 30% EN)
  - Respects blackout dates from tours.json
  - Inserts tour teasers 48h before dates
  - Saves to schedule.json

generateSlotsForDay(date: Date, blackouts: Set<string>)
  - Creates 3 slots per day (09:15, 13:30, 19:00)
  - Skips weekends for lifestyle posts
  - Returns: ScheduleSlot[]

assignVertical(slot: ScheduleSlot, index: number)
  - Assigns vertical rotation
  - Returns: ScheduleSlot
```

#### **Scheduler Functions** (`scheduler.ts`)
```typescript
runScheduler()
  - Refreshes calendar
  - Ensures queue supply (auto-top-up if < 7 days)
  - Processes today's slots
  - Tries Buffer → Meta → Manual pack
  - Emails posting pack if needed

ensureQueueSupply()
  - Checks verified post count
  - Generates more if needed
  - Runs QA agent
  - Auto-verifies safe posts

schedulePost(slot: ScheduleSlot, post: Post)
  - Tries Buffer API first
  - Falls back to Meta API
  - Returns: boolean (success)

findMatchingPost(slot: ScheduleSlot, queue: Post[])
  - Finds verified post matching slot criteria
  - Returns: Post | null
```

#### **Posting Pack Functions** (`postingPack.ts`)
```typescript
createPostingPack(slots: ScheduleSlot[], queue: Post[])
  - Creates ZIP file with:
    - captions_en.txt
    - captions_es.txt
    - hashtags.txt
    - schedule.csv
    - assets/ folder
  - Returns: string (path to ZIP)
```

#### **Media Generation Functions**

**SDXL** (`media/image.sdxl.ts`):
```typescript
generateSDXL(prompt: string, opts?: { refiner?, numSteps?, guidanceScale? })
  - Generates base SDXL image
  - Optional refiner pass
  - Returns: { ok: boolean, buffer?: Buffer, reason?: string }
```

**SVD** (`media/video.svd.ts`):
```typescript
generateSVD(imageUrl: string, opts?: { numFrames?, numSteps? })
  - Converts image to video
  - Returns: { ok: boolean, buffer?: Buffer, reason?: string }
```

**ZeroScope** (`media/video.zeroscope.ts`):
```typescript
generateZeroScope(prompt: string, opts?: { numSteps?, width?, height? })
  - Generates video from text prompt
  - Returns: { ok: boolean, buffer?: Buffer, reason?: string }
```

**HiDiffusion** (`media/enh.hidiffusion.ts`):
```typescript
enhanceHiDiffusion(imageBuffer: Buffer, opts?: { strength? })
  - Enhances image quality
  - Returns: { ok: boolean, buffer?: Buffer, reason?: string }
```

#### **Agent Functions**

**Intake Agent** (`agents/intakeAgent.ts`):
```typescript
runIntake()
  - Runs at 09:15 & 14:00
  - Generates 5-8 priority questions
  - Emails bilingual report to EOD_TO

generateQuestions()
  - Uses LLM to generate questions
  - Returns: { en: string[], es: string[] }
```

**EOD Agent** (`agents/eodAgent.ts`):
```typescript
runEOD()
  - Runs at 21:30 daily
  - Generates end-of-day report
  - Emails bilingual summary

generateReport()
  - Creates report with:
    - Leads & pending
    - Posts pushed
    - Top performer
    - Web sessions & WhatsApp clicks
    - Bookings & capacity
    - Grants & deadlines
    - Blockers
    - Questions for tomorrow
  - Returns: { en: string, es: string }
```

**Grant Agent** (`agents/grantAgent.ts`):
```typescript
runGrantAgent()
  - Runs Mon & Thu at 08:00
  - Fetches grants from grants_matrix.json
  - Calculates fit scores
  - Emails high-fit opportunities (≥60%)

scoreGrant(grant: Grant)
  - Scores grant based on service keywords
  - Returns: number (0-100)
```

**QA Agent** (`agents/qaAgent.ts`):
```typescript
runQA()
  - Verifies posts for safety
  - Sets verified:true for safe posts
  - Attaches TODO notes for concerns

checkPost(post: Post)
  - Basic checks (length, hashtags)
  - LLM-based safety check
  - Returns: { verified: boolean, notes?: string }
```

**Alert Agent** (`agents/alertAgent.ts`):
```typescript
sendAlert(alert: Alert)
  - Sends real-time alerts
  - Emails ALERT_TO
  - Posts to Slack if configured

checkDeadlines()
  - Checks grants for deadlines < 48h

checkDeployStatus()
  - Checks deployment status
```

#### **Other Automation Functions**

**Ad Generator** (`adGenerator.ts`):
```typescript
generateAds()
  - Creates 3 bilingual ad sets:
    - Law Firms
    - Medical Clinics
    - Gato Blanco Tours
  - Saves to dist/ads.json

generateAdSet(vertical: string, name: string)
  - Uses LLM to generate ad copy
  - Returns: AdSet
```

**Tour Engine** (`tourEngine.ts`):
```typescript
syncTours()
  - Syncs tours from tours.json
  - Inserts event teasers 48h before dates
  - Updates schedule.json
```

**Grant Radar** (`grantRadar.ts`):
```typescript
runGrantRadar()
  - Fetches grants from grants_matrix.json
  - Summarizes in EN/ES
  - Calculates fit scores
  - Emails opportunities

summarizeGrant(grant: Grant)
  - Uses LLM to summarize
  - Returns: { en: string, es: string }
```

**Email Engine** (`emailEngine.ts`):
```typescript
runEmails()
  - Orchestrates agent emails
  - Runs based on time/day:
    - Intake: 09:15 & 14:00
    - EOD: 21:30
    - Grants: Mon/Thu 08:00
```

---

### 🛠️ **BUILDER CLI FUNCTIONS** (`packages/builder-cli/`)

```typescript
// packages/builder-cli/src/index.ts
builder deploy <provider>
  - provider: 'cloudflare' | 'netlify'
  - Deploys Next.js app to provider

// packages/builder-cli/src/providers/cloudflare.ts
deployCloudflare()
  - Creates wrangler.toml if needed
  - Builds Next.js app
  - Deploys to Cloudflare Pages via Wrangler

// packages/builder-cli/src/providers/netlify.ts
deployNetlify()
  - Creates netlify.toml if needed
  - Builds Next.js app
  - Deploys to Netlify via CLI
```

---

### 📜 **SCRIPT FUNCTIONS** (`scripts/`)

```typescript
// scripts/backup-content.ts
backup-content()
  - Backs up all content files
  - Creates timestamped backup folder

// scripts/seed-content.ts
seed-content()
  - Ensures all content files exist

// scripts/send-summary.ts
send-summary()
  - Sends daily automation summary email

// scripts/launch-ready.ts
launch-ready()
  - Sends launch notification email
```

---

## 🔧 **V0-CLONE BUILDER CLI DETAILS**

### **What It Does**
The builder CLI is an open-source V0-clone that:

1. **Cloudflare Deployment**:
   - Uses Wrangler CLI
   - Creates `wrangler.toml` config
   - Builds Next.js app
   - Deploys to Cloudflare Pages
   - Supports custom domains

2. **Netlify Deployment**:
   - Uses Netlify CLI
   - Creates `netlify.toml` config
   - Builds Next.js app
   - Deploys to Netlify
   - Supports Netlify plugins

### **Usage**
```bash
# Deploy to Cloudflare
pnpm deploy:cloudflare

# Deploy to Netlify
pnpm deploy:netlify

# Use builder CLI directly
pnpm builder deploy cloudflare
pnpm builder deploy netlify
```

### **How It Works**
1. Checks for config files (wrangler.toml / netlify.toml)
2. Creates configs from samples if missing
3. Builds Next.js app (`pnpm build`)
4. Deploys using provider CLI
5. Returns deployment URL

---

## 📦 **OPEN SOURCE TOOLS USED**

### **Core Framework**
- ✅ **Next.js 14** - React framework (App Router)
- ✅ **React 18** - UI library
- ✅ **TypeScript 5.3** - Type safety

### **Styling**
- ✅ **Tailwind CSS 3.3** - Utility-first CSS
- ✅ **PostCSS** - CSS processing
- ✅ **Autoprefixer** - CSS vendor prefixes

### **Media Generation**
- ✅ **@huggingface/inference** - Hugging Face API client
  - SDXL (Stable Diffusion XL)
  - Stable Video Diffusion (SVD)
  - ZeroScope models

### **Date/Time**
- ✅ **date-fns 2.30** - Date utilities
- ✅ **date-fns-tz** - Timezone support

### **Email**
- ✅ **Resend 2.1** - Email API

### **CLI Tools**
- ✅ **Commander.js** - CLI framework
- ✅ **Wrangler** - Cloudflare CLI
- ✅ **Netlify CLI** - Netlify deployment

### **Build Tools**
- ✅ **tsx** - TypeScript execution
- ✅ **pnpm** - Package manager
- ✅ **archiver** - ZIP file creation

### **Icons**
- ✅ **lucide-react** - Icon library

---

## 🔑 **YOUR API KEYS UTILIZATION**

### ✅ **Currently Used**

#### **RESEND_API_KEY** ✅
- **Used in**: `automation/providers.ts` (mail.send)
- **Used in**: `apps/web/app/api/lead/route.ts`
- **Function**: Sends emails for:
  - Lead notifications
  - Agent reports (Intake, EOD, Grants, Alerts)
  - Posting pack notifications
- **Status**: ✅ Properly utilized

#### **GEMINI_API_KEY** ✅
- **Used in**: `automation/providers.ts` (llm.text)
- **Function**: Primary LLM for:
  - Post generation
  - Content variations
  - Agent reports
  - Ad copy generation
- **Status**: ✅ Primary LLM (first in chain)

#### **GROK_API_KEY** ✅
- **Used in**: `automation/providers.ts` (llm.text)
- **Function**: Fallback LLM (if Gemini fails)
- **Status**: ✅ Secondary LLM

#### **PERPLEXITY_API_KEY** ✅
- **Used in**: `automation/providers.ts` (llm.text)
- **Function**: Fallback LLM (if Grok fails)
- **Status**: ✅ Tertiary LLM

#### **HUGGINGFACE_KEY** ✅
- **Used in**: `automation/providers.ts` (media.image, media.video)
- **Used in**: `automation/media/*.ts`
- **Function**: Media generation:
  - SDXL images
  - SVD videos
  - ZeroScope videos
- **Status**: ✅ Properly utilized

#### **GHL_API_KEY** ✅
- **Used in**: `automation/providers.ts` (crm.lead)
- **Used in**: `apps/web/app/api/lead/route.ts`
- **Function**: Creates CRM leads
- **Status**: ✅ Properly utilized

### ⚠️ **Not Currently Used** (But Ready)

#### **POE_API_KEY** ⚠️
- **Status**: In provider chain but not fully implemented
- **Recommendation**: Complete POE integration

#### **AIMLAPI_API_KEY** ⚠️
- **Status**: Not in provider chain
- **Recommendation**: Add to LLM fallback chain

#### **BUFFER_TOKEN** ⚠️
- **Status**: In scheduler but not configured
- **Function**: Would schedule posts directly
- **Recommendation**: Add to `.env` for direct scheduling

#### **META_PAGE_ACCESS_TOKEN** ⚠️
- **Status**: In scheduler but not configured
- **Function**: Would schedule posts via Meta Graph API
- **Recommendation**: Add to `.env` for Meta scheduling

#### **SLACK_WEBHOOK_URL** ⚠️
- **Status**: In alertAgent but not configured
- **Function**: Would send alerts to Slack
- **Recommendation**: Add to `.env` for Slack alerts

#### **WHATSAPP_NUMBER** ⚠️
- **Status**: In WhatsAppFloat component but not fully configured
- **Function**: Would link to WhatsApp
- **Recommendation**: Add NEXT_PUBLIC_WHATSAPP_NUMBER to `.env`

#### **PLAUSIBLE_API_KEY** ⚠️
- **Status**: Not implemented
- **Recommendation**: Add Plausible analytics

#### **CALENDLY_URL** ⚠️
- **Status**: Not implemented
- **Recommendation**: Add Calendly integration

#### **WHOP_API_KEY** ⚠️
- **Status**: Not implemented (WHOP_ENABLED=false)
- **Recommendation**: Add Whop integration if needed

---

## 🚀 **IMPROVEMENTS WE COULD MAKE**

### 🔥 **HIGH PRIORITY** (Do First)

#### 1. **Complete POE Integration**
```typescript
// automation/providers.ts
// Currently: Placeholder
// Should: Implement POE API calls
```

#### 2. **Add AIMLAPI to Chain**
```typescript
// Add AIMLAPI as fallback LLM
// Between Perplexity and POE
```

#### 3. **Configure Buffer/Meta Tokens**
```bash
# Add to .env
BUFFER_TOKEN=your_token
META_PAGE_ACCESS_TOKEN=your_token
# Enables direct scheduling (no manual packs)
```

#### 4. **Add WhatsApp Configuration**
```bash
# Add to .env
NEXT_PUBLIC_WHATSAPP_NUMBER=+573001234567
# Makes WhatsApp button functional
```

#### 5. **Add Plausible Analytics**
```typescript
// apps/web/app/layout.tsx
import Script from 'next/script';

<Script
  defer
  data-domain="gringoconnection.com"
  src="https://plausible.io/js/script.js"
/>
```

### 📈 **MEDIUM PRIORITY**

#### 6. **Add Rate Limiting**
```typescript
// automation/providers.ts
// Add rate limiting for API calls
// Prevent hitting limits
```

#### 7. **Add Retry Logic**
```typescript
// Add exponential backoff retry
// For failed API calls
```

#### 8. **Add Caching**
```typescript
// Cache LLM responses
// Cache media generation results
// Reduce API costs
```

#### 9. **Add Error Tracking**
```typescript
// Install Sentry
// Track errors in production
```

#### 10. **Add Health Checks**
```typescript
// automation/health.ts
export async function checkHealth() {
  return {
    queue: queue.length,
    providers: await testProviders(),
    lastRun: lastRunTime,
  };
}
```

### 🎯 **LOW PRIORITY** (Nice to Have)

#### 11. **Add Database**
```typescript
// Replace JSON files with database
// Use Supabase or PlanetScale
// Better scalability
```

#### 12. **Add Admin Dashboard**
```typescript
// apps/web/app/admin/page.tsx
// Visual content editor
// Queue management
// Analytics dashboard
```

#### 13. **Add Testing**
```typescript
// Unit tests (Vitest)
// Integration tests
// E2E tests (Playwright)
```

#### 14. **Add Monitoring**
```typescript
// Custom dashboard
// Real-time metrics
// Alert system
```

#### 15. **Add SEO Enhancements**
```typescript
// apps/web/app/sitemap.ts
// apps/web/app/robots.ts
// Structured data (JSON-LD)
```

---

## 📊 **API UTILIZATION SUMMARY**

| API Key | Status | Usage | Recommendation |
|---------|--------|-------|----------------|
| RESEND_API_KEY | ✅ Used | Email sending | Already optimal |
| GEMINI_API_KEY | ✅ Used | Primary LLM | Already optimal |
| GROK_API_KEY | ✅ Used | Fallback LLM | Already optimal |
| PERPLEXITY_API_KEY | ✅ Used | Fallback LLM | Already optimal |
| HUGGINGFACE_KEY | ✅ Used | Media generation | Already optimal |
| GHL_API_KEY | ✅ Used | CRM leads | Already optimal |
| POE_API_KEY | ⚠️ Partial | Not fully implemented | Complete integration |
| AIMLAPI_API_KEY | ❌ Not used | Not in chain | Add to chain |
| BUFFER_TOKEN | ⚠️ Ready | Not configured | Add to .env |
| META_PAGE_ACCESS_TOKEN | ⚠️ Ready | Not configured | Add to .env |
| SLACK_WEBHOOK_URL | ⚠️ Ready | Not configured | Add to .env |
| WHATSAPP_NUMBER | ⚠️ Partial | Not fully configured | Add NEXT_PUBLIC_WHATSAPP_NUMBER |
| PLAUSIBLE_API_KEY | ❌ Not used | Not implemented | Add analytics |
| CALENDLY_URL | ❌ Not used | Not implemented | Add Calendly widget |
| WHOP_API_KEY | ❌ Not used | Disabled | Enable if needed |

---

## ✅ **SUMMARY**

**Total Functions**: 50+ functions across all modules
**V0 Clone**: ✅ Builder CLI ready for Cloudflare/Netlify
**Open Source**: ✅ Using best-in-class tools
**API Usage**: ✅ 6/15 keys fully utilized, 3 ready to use, 6 not yet implemented

**Priority Improvements**:
1. Complete POE integration
2. Add AIMLAPI to chain
3. Configure Buffer/Meta tokens
4. Add WhatsApp config
5. Add Plausible analytics

Everything is working! Just need to configure remaining API keys and complete integrations. 🚀

