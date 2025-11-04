# 🚀 Revenue Agents Setup - Local AI (Ollama)

## ✅ **What We Built**

1. **Lead Qualification Agent** - Scores leads 0-100, prioritizes HOT leads
2. **Revenue Agents Plan** - 10 agents ranked by ROI

---

## 🔧 **Setup Ollama (Local AI) - Windows & Low-Spec Friendly**

### **Step 1: Install Ollama (Windows)**

**Download**: https://ollama.ai/download/windows

**Or use installer**:
```powershell
# Download and run the installer from ollama.ai
# It will install and start Ollama automatically
```

### **Step 2: Start Ollama**

**Windows**: Ollama usually runs automatically after install, or:
```powershell
ollama serve
```

Keep this running in a terminal/PowerShell window.

### **Step 3: Pull Models (Lightweight for Windows)**

Open a NEW terminal/PowerShell (keep `ollama serve` running):

```powershell
# Lightweight model (BEST for Windows/low-spec) - Only 1.3GB!
ollama pull phi3:mini

# Small fast model (good balance) - 2.3GB
ollama pull llama3.2:1b

# Medium model (if you have 8GB+ RAM) - 4.7GB
ollama pull llama3.2:3b

# Skip large models (70b) - they need 40GB+ RAM
```

**Recommended for Windows/Low-Spec**:
- **phi3:mini** (1.3GB) - Fastest, works on 4GB RAM
- **llama3.2:1b** (2.3GB) - Good balance, needs 4GB RAM
- **llama3.2:3b** (4.7GB) - Better quality, needs 8GB RAM

**Avoid**: llama3:8b (needs 16GB RAM), llama3:70b (needs 40GB+ RAM)

---

## ⚙️ **Configure Environment**

Add to your `.env`:

```bash
# Enable local LLM
LOCAL_LLM=true
OLLAMA_URL=http://localhost:11434

# Model preferences (Windows/Low-Spec Friendly)
OLLAMA_MODEL_FAST=phi3:mini       # Fast tasks (1.3GB - BEST for Windows)
OLLAMA_MODEL_QUALITY=llama3.2:3b  # Quality tasks (4.7GB - if you have 8GB+ RAM)

# OR use smaller models for everything:
# OLLAMA_MODEL_FAST=phi3:mini
# OLLAMA_MODEL_QUALITY=phi3:mini   # Same model for everything (faster)
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

## 💡 **Tips (Windows/Low-Spec)**

- **Start with `phi3:mini`** - Only 1.3GB, works on 4GB RAM Windows machines
- **Use `llama3.2:1b` or `3b`** if you have 8GB+ RAM and want better quality
- **Skip large models** - Don't use llama3:8b or 70b on low-spec machines
- **Keep Ollama running** - It needs to be running for agents to work
- **Monitor RAM** - Check Task Manager if things get slow
- **Close other apps** - Free up RAM when running agents
- **Use SSD if possible** - Faster model loading

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

