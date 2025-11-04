# 🚀 Revenue Agents Setup - Local AI (Ollama)

## ✅ **What We Built**

1. **Lead Qualification Agent** - Scores leads 0-100, prioritizes HOT leads
2. **Revenue Agents Plan** - 10 agents ranked by ROI

---

## 🔧 **Setup Ollama (Local AI)**

### **Step 1: Install Ollama**

```bash
# macOS
brew install ollama

# OR download from https://ollama.ai/download
```

### **Step 2: Start Ollama**

```bash
ollama serve
```

Keep this running in a terminal.

### **Step 3: Pull Models**

Open a NEW terminal (keep `ollama serve` running):

```bash
# Fast model (for scoring, classification)
ollama pull llama3:8b

# Better quality model (for proposals, complex tasks)
ollama pull llama3:70b

# Alternative fast model
ollama pull qwen2:7b

# Alternative quality model
ollama pull qwen2:72b
```

**Note**: `llama3:8b` is ~4.7GB, `llama3:70b` is ~40GB. Start with 8b!

---

## ⚙️ **Configure Environment**

Add to your `.env`:

```bash
# Enable local LLM
LOCAL_LLM=true
OLLAMA_URL=http://localhost:11434

# Model preferences
OLLAMA_MODEL_FAST=llama3:8b      # Fast tasks (scoring, classification)
OLLAMA_MODEL_QUALITY=llama3:70b   # Quality tasks (proposals, documents)
```

---

## 🚀 **Run Lead Qualification Agent**

```bash
# Run once
pnpm agents:qualify-leads

# Or directly
npx tsx automation/agents/leadQualificationAgent.ts
```

**What it does**:
1. Fetches leads from GoHighLevel CRM
2. Scores each lead 0-100 using local AI
3. Categorizes: HOT (80+), Warm (60-79), Cold (<60)
4. Suggests best service fit
5. Generates personalized pitch
6. Emails report to team

---

## 📊 **Expected Output**

You'll get an email with:

- **🔥 HOT Leads** - Score 80+, contact immediately
- **Warm Leads** - Score 60-79, follow up this week
- **Cold Leads** - Score <60, consider nurturing

Each lead includes:
- Score & reasoning
- Best service matches
- Suggested pitch opening
- Urgency level

---

## 🔄 **Schedule It**

Add to `.github/workflows/ci.yml` or cron:

```yaml
# Every 2 hours: 08:00, 10:00, 12:00, 14:00, 16:00, 18:00
- name: Qualify Leads
  run: pnpm agents:qualify-leads
  env:
    LOCAL_LLM: true
    OLLAMA_URL: http://localhost:11434
    GHL_API_KEY: ${{ secrets.GHL_API_KEY }}
    RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

---

## ✅ **Test It**

1. Make sure Ollama is running: `ollama serve`
2. Test model: `ollama run llama3:8b "Hello"`
3. Run agent: `pnpm agents:qualify-leads`
4. Check email inbox for report

---

## 🎯 **Next Agents to Build**

See `REVENUE_AGENTS_PLAN.md` for full list. Priority:

1. ✅ **Lead Qualification** (DONE)
2. **Follow-up Agent** - Auto-follow up on stale leads
3. **Upsell Agent** - Find upsell opportunities
4. **Proposal Generator** - Auto-generate proposals

---

## 💡 **Tips**

- **Start with `llama3:8b`** - Fast enough, good quality
- **Use `llama3:70b`** for proposals/documents when needed
- **Keep Ollama running** - It needs to be running for agents to work
- **Monitor RAM** - `llama3:8b` uses ~6GB, `llama3:70b` uses ~40GB

---

## 🐛 **Troubleshooting**

**Error: "Connection refused"**
- Make sure `ollama serve` is running
- Check `OLLAMA_URL` in `.env`

**Error: "Model not found"**
- Run `ollama pull llama3:8b` first

**Slow responses**
- Use `llama3:8b` instead of `llama3:70b` for faster tasks
- Check RAM usage

**No leads found**
- Check `GHL_API_KEY` is set
- Verify GoHighLevel API is working

---

**Status**: ✅ Lead Qualification Agent ready to use!

