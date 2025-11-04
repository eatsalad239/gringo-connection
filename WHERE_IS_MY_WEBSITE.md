# 🌐 Where's My Website?

## Website Location

Your Next.js website is located at:

```
/Users/danielsmith/gringo connection/apps/web/
```

## 🚀 How to Run It

### Option 1: From Root (Recommended)

```bash
cd "/Users/danielsmith/gringo connection"
pnpm dev
```

This will start the Next.js dev server at: **http://localhost:3000**

### Option 2: From Web Directory

```bash
cd "/Users/danielsmith/gringo connection/apps/web"
pnpm dev
```

## 📁 Website Structure

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (/)
│   ├── layout.tsx          # Root layout
│   ├── contact/            # Contact page
│   ├── services/           # Services listing
│   ├── tours/              # Tours page
│   ├── partners/           # Partners page
│   ├── verticals/[slug]/  # Dynamic vertical pages
│   ├── legal/              # Privacy & Terms
│   │   ├── privacy/
│   │   └── terms/
│   ├── success/            # Success page
│   ├── cancelled/          # Cancelled page
│   └── api/                # API routes
│       └── lead/            # Lead capture endpoint
├── components/             # React components
│   ├── Nav.tsx            # Navigation
│   ├── Footer.tsx         # Footer
│   ├── Hero.tsx           # Hero section
│   ├── Services.tsx       # Services grid
│   ├── Testimonials.tsx   # Testimonials
│   ├── FAQ.tsx            # FAQ section
│   └── WhatsAppFloat.tsx  # WhatsApp button
└── lib/                    # Utilities
    └── content.ts         # Content loader
```

## 🌍 Pages Available

- **Home**: `/` or `/es`
- **Services**: `/services` or `/es/services`
- **Tours**: `/tours` or `/es/tours`
- **Partners**: `/partners` or `/es/partners`
- **Contact**: `/contact` or `/es/contact`
- **Verticals**: `/verticals/[slug]` (e.g., `/verticals/law`)
- **Privacy**: `/legal/privacy`
- **Terms**: `/legal/terms`
- **Success**: `/success` (form submissions)
- **Cancelled**: `/cancelled` (payment cancellations)

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Config**: `apps/web/tailwind.config.js`
- **Global Styles**: `apps/web/app/globals.css`

## 🔧 Configuration

- **Next.js Config**: `apps/web/next.config.js`
- **TypeScript**: `apps/web/tsconfig.json`
- **Package**: `apps/web/package.json`

## 📦 Build for Production

```bash
# From root
pnpm build

# Output goes to: apps/web/.next/
```

## 🚢 Deploy

```bash
# Cloudflare Pages
pnpm deploy:cloudflare

# Netlify
pnpm deploy:netlify
```

## ✅ Quick Test

1. **Install dependencies** (if not done):
   ```bash
   pnpm install
   ```

2. **Start dev server**:
   ```bash
   pnpm dev
   ```

3. **Open browser**:
   ```
   http://localhost:3000
   ```

4. **Switch language**:
   Click "ES" or "EN" in the nav to toggle Spanish/English

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

**Build errors?**
```bash
cd apps/web
pnpm typecheck
pnpm lint
```

**Content not loading?**
- Check that `content/` directory exists at root
- Verify JSON files are valid
- Check console for errors

---

**Your website is ready to go!** 🎉

