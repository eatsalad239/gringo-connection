# 🐝 Creative Swarm - Complete Guide

## 🎯 **What It Is**

A powerful swarm of 6 specialized agents you can activate **on-demand** to automate nearly everything:

1. **🎨 Art Generation** - AI images for ads, social, websites
2. **🎬 Video Generation** - AI videos for ads, social, presentations
3. **📢 Ad Automation** - Complete ad campaigns (copy + media)
4. **🌐 Website Builder** - Build complete websites from scratch
5. **💻 Coding Assistant** - Write, debug, refactor, explain code
6. **💡 Advice Agent** - Business, technical, strategic advice

**All use your local Ollama or cloud LLMs!**

---

## 🚀 **Quick Start**

### **Command Line Usage**

```bash
# Generate art
pnpm swarm:art "A modern office space, professional, clean"

# Generate video
pnpm swarm:video "A dynamic product showcase, 15 seconds"

# Create ad campaign
pnpm swarm:ads "New Product Launch" facebook

# Build website
pnpm swarm:website "My Company" landing

# Get coding help
pnpm swarm:code "Create a React component for user profile"

# Get advice
pnpm swarm:advice "How do I optimize my pricing strategy?" business
```

### **Programmatic Usage**

```typescript
import { activateSwarm, SwarmCommands } from './automation/agents/creativeSwarm.js';

// Simple commands
await SwarmCommands.art('A sunset over mountains', 'realistic');
await SwarmCommands.video('A product demo', 15);
await SwarmCommands.ads('Summer Sale', 'instagram');
await SwarmCommands.website('Portfolio Site', 'portfolio');
await SwarmCommands.code('Write a TypeScript API route', 'typescript');
await SwarmCommands.advice('How to improve conversion rates?', 'marketing');

// Full control
await activateSwarm({
  type: 'art',
  task: 'Generate images for social media',
  options: {
    batch: true,
    campaign: 'Social Media Campaign',
    requests: [
      { prompt: 'Coffee shop interior', style: 'modern', useCase: 'social' },
      { prompt: 'Happy team working', style: 'realistic', useCase: 'social' },
    ],
  },
});
```

---

## 🎨 **1. Art Generation Agent**

**What it does:** Creates AI-generated images using SDXL, HiDiffusion

**Use cases:**
- Social media posts
- Ad creatives
- Website hero images
- Presentation graphics

**Example:**
```bash
pnpm swarm:art "A modern tech office, clean, professional" modern square ad
```

**Options:**
- `style`: realistic, cartoon, abstract, modern, vintage
- `dimensions`: square, landscape, portrait
- `useCase`: ad, social, website, presentation
- `language`: en, es

**Batch generation:**
```typescript
await batchGenerateArt('Campaign Name', [
  { prompt: 'Image 1', style: 'modern', useCase: 'ad' },
  { prompt: 'Image 2', style: 'realistic', useCase: 'social' },
]);
```

---

## 🎬 **2. Video Generation Agent**

**What it does:** Creates AI-generated videos using SVD, ZeroScope

**Use cases:**
- Social media videos
- Ad videos
- Presentation animations
- Website hero videos

**Example:**
```bash
pnpm swarm:video "A dynamic product showcase" 15 dynamic ad
```

**Options:**
- `prompt`: Text description
- `imageUrl`: Generate from image (img2vid)
- `duration`: Seconds (default: 4)
- `style`: cinematic, smooth, dynamic, professional
- `useCase`: ad, social, presentation, website

**From image:**
```typescript
await generateVideo({
  imageUrl: 'https://example.com/image.jpg',
  duration: 15,
  style: 'smooth',
  useCase: 'ad',
});
```

---

## 📢 **3. Ad Automation Agent**

**What it does:** Creates complete ad campaigns - copy + images + videos

**Use cases:**
- Facebook/Instagram ads
- Google ads
- LinkedIn ads
- TikTok ads

**Example:**
```bash
pnpm swarm:ads "Summer Sale Campaign" facebook awareness "small business owners" 1000
```

**Options:**
- `platform`: facebook, instagram, google, linkedin, tiktok
- `objective`: awareness, traffic, conversions, engagement
- `targetAudience`: Description of target audience
- `budget`: Optional budget amount
- `duration`: Campaign duration in days
- `language`: en, es

**What you get:**
- 3 ad copy variations (headline, description, CTA)
- Generated images for each creative
- Generated videos (for Instagram/TikTok)
- Campaign summary email

---

## 🌐 **4. Website Builder Agent**

**What it does:** Builds complete websites from scratch - pages, components, configs

**Use cases:**
- Landing pages
- Portfolio sites
- E-commerce sites
- Blog sites
- SaaS sites

**Example:**
```bash
pnpm swarm:website "My Company" landing "home,about,services,contact" "contact-form,blog"
```

**Options:**
- `type`: landing, portfolio, ecommerce, blog, saas
- `pages`: Array of page names
- `features`: Array of features
- `style`: modern, minimal, bold, elegant
- `language`: en, es
- `destination`: Output path (default: `./generated-websites/{name}`)

**What you get:**
- Complete Next.js 14 project
- All pages with proper code
- Components (Nav, Footer, Hero)
- Config files (package.json, next.config.js, tailwind.config.js)
- README with setup instructions

**Setup generated website:**
```bash
cd generated-websites/my-company
npm install
npm run dev
```

---

## 💻 **5. Coding Assistant Agent**

**What it does:** Helps with coding tasks - write, debug, refactor, explain, optimize

**Use cases:**
- Write new code
- Debug errors
- Refactor existing code
- Explain complex code
- Optimize performance

**Example:**
```bash
pnpm swarm:code "Create a React component for user profile with TypeScript" typescript write ./components/UserProfile.tsx
```

**Options:**
- `action`: write, debug, refactor, explain, optimize
- `language`: typescript, javascript, python, bash
- `context`: File paths or code snippets for context
- `outputPath`: Where to save generated code

**Debug example:**
```typescript
await handleCodingTask({
  task: 'Fix the error in this code',
  context: './src/components/Button.tsx',
  language: 'typescript',
  action: 'debug',
});
```

**Refactor example:**
```typescript
await handleCodingTask({
  task: 'Refactor this code to be more maintainable',
  context: './src/utils/helpers.ts',
  language: 'typescript',
  action: 'refactor',
});
```

---

## 💡 **6. Advice Agent**

**What it does:** Provides expert advice on business, technical, strategy, marketing, operations

**Use cases:**
- Business strategy questions
- Technical decisions
- Marketing tactics
- Operational improvements
- Strategic planning

**Example:**
```bash
pnpm swarm:advice "How do I optimize my pricing strategy?" business high
```

**Options:**
- `category`: business, technical, strategy, marketing, operations
- `context`: Previous conversations, business info
- `urgency`: low, medium, high

**Example questions:**
- "How do I improve my conversion rates?" (marketing)
- "What's the best tech stack for a SaaS?" (technical)
- "How do I scale my operations?" (operations)
- "What's my competitive advantage?" (strategy)

---

## 🐝 **Full Swarm Mode**

Activate all agents at once:

```typescript
await activateSwarm({
  type: 'all',
  task: 'Complete marketing campaign',
  options: {
    campaign: 'Summer Sale',
    platform: 'facebook',
    // ... other options
  },
});
```

---

## 📋 **Integration with Existing Agents**

The Creative Swarm works alongside your existing agents:

- **Lead Qualification** → Uses ad creatives
- **Follow-up Agent** → Uses advice for messaging
- **Proposal Generator** → Uses website builder for client portals
- **Dev Helper** → Uses coding assistant
- **Content Performance** → Uses art/video for better content

---

## 🔧 **Configuration**

Add to `.env`:

```bash
# Creative Swarm
ART_AGENT_TO=dan@doorknockingsucks.com,eddy@doorknockingsucks.com
VIDEO_AGENT_TO=dan@doorknockingsucks.com,eddy@doorknockingsucks.com
AD_AGENT_TO=dan@doorknockingsucks.com,eddy@doorknockingsucks.com
WEBSITE_AGENT_TO=dan@doorknockingsucks.com,eddy@doorknockingsucks.com
CODING_AGENT_TO=dan@doorknockingsucks.com,eddy@doorknockingsucks.com
ADVICE_AGENT_TO=dan@doorknockingsucks.com,eddy@doorknockingsucks.com
SWARM_TO=dan@doorknockingsucks.com,eddy@doorknockingsucks.com
```

---

## 💰 **Cost & Performance**

- **Art Generation**: Uses Hugging Face (included in your plan)
- **Video Generation**: Uses Hugging Face (included in your plan)
- **Ad/Website/Coding/Advice**: Uses your LLM (Ollama local or cloud)

**Local**: FREE (Ollama)
**Cloud**: Uses your existing LLM credits

---

## 🎯 **Common Workflows**

### **Complete Ad Campaign**
```bash
# 1. Generate ad campaign
pnpm swarm:ads "Product Launch" facebook conversions "tech enthusiasts"

# 2. Generate additional images
pnpm swarm:art "Product showcase" modern square ad

# 3. Generate video
pnpm swarm:video "Product demo" 15 dynamic ad
```

### **Website + Content**
```bash
# 1. Build website
pnpm swarm:website "Client Site" landing "home,about,services"

# 2. Generate hero image
pnpm swarm:art "Modern office space" modern landscape website

# 3. Get advice on features
pnpm swarm:advice "What features should I add?" technical
```

### **Coding Project**
```bash
# 1. Get advice
pnpm swarm:advice "Best architecture for this project?" technical

# 2. Generate code
pnpm swarm:code "Create API routes for user management" typescript write

# 3. Debug issues
pnpm swarm:code "Fix this error" typescript debug ./src/api/users.ts
```

---

## 🚀 **Next Steps**

1. **Test each agent:**
   ```bash
   pnpm swarm:art "Test image"
   pnpm swarm:video "Test video"
   pnpm swarm:advice "Test question" business
   ```

2. **Integrate into workflows:**
   - Add to proposal generator
   - Use in lead qualification
   - Enhance follow-up messages

3. **Customize for your needs:**
   - Adjust prompts
   - Add custom styles
   - Integrate with your tools

---

**The Creative Swarm is ready to automate nearly everything! 🐝**

