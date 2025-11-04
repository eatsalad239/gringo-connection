# 🎬 Live Demo - Gringo Ecosystem

## ✅ Server Status

**Development server is starting...**

The Next.js dev server is launching in the background. It will be available at:

🌐 **http://localhost:3000**

## 🎯 What You'll See

### Home Page (`/`)
- ✅ Bilingual hero section (EN/ES toggle)
- ✅ Services grid (8 services)
- ✅ Testimonials section
- ✅ FAQ accordion
- ✅ WhatsApp float button (bottom right)

### Available Pages

1. **Home** - `/` or `/es`
   - Hero: "AI that elevates your brand. Built in Medellín."
   - Services showcase
   - Client testimonials
   - FAQ section

2. **Services** - `/services` or `/es/services`
   - 8 service cards with capabilities
   - Law, Clinics, AI Website, Restaurants, Education, Startups, Real Estate, Accounting

3. **Tours** - `/tours` or `/es/tours`
   - AI Coffee Tour
   - Cocktail & Code
   - Capacity, pricing, descriptions

4. **Partners** - `/partners` or `/es/partners`
   - Gato Blanco partnership
   - Partner cards with links

5. **Contact** - `/contact` or `/es/contact`
   - Contact form
   - Name, email, phone, message
   - Submits to `/api/lead`

6. **Verticals** - `/verticals/[slug]`
   - Dynamic pages for each vertical
   - Examples: `/verticals/law`, `/verticals/clinics`
   - Shows services + proof points

7. **Legal** - `/legal/privacy`, `/legal/terms`
   - Privacy policy
   - Terms & conditions

## 🎨 Features to Test

### 1. Language Toggle
- Click "ES" or "EN" in navigation
- All content switches language
- URLs update: `/` → `/es`

### 2. Responsive Design
- Resize browser window
- Mobile-friendly navigation
- Tailwind CSS styling

### 3. WhatsApp Button
- Green button bottom-right
- Links to WhatsApp (if configured)
- Always visible

### 4. Contact Form
- Fill out form
- Submit triggers API call
- Success page redirect

### 5. Navigation
- All nav links work
- Smooth scrolling
- Active page highlighting

## 🔧 If Server Doesn't Start

Check terminal for errors. Common fixes:

```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart server
cd "/Users/danielsmith/gringo connection"
npx pnpm --filter @app/web dev
```

## 📊 What's Running

- ✅ Next.js 14 dev server
- ✅ React 18
- ✅ Tailwind CSS
- ✅ TypeScript
- ✅ Bilingual routing

## 🚀 Next Steps After Demo

1. **Generate Posts**:
   ```bash
   npx pnpm social:generate
   ```

2. **Run Scheduler**:
   ```bash
   npx pnpm daily:schedule
   ```

3. **Test Agents**:
   ```bash
   npx pnpm tsx automation/agents/intakeAgent.ts
   ```

4. **Build for Production**:
   ```bash
   npx pnpm build
   ```

---

**Server should be ready in 30-60 seconds!** 🎉

Visit: **http://localhost:3000**

