# 🍎 MacBook Pro 2025 - Optimized Agent Swarm

## 🎯 **Optimized for 24GB RAM**

Your MacBook Pro can handle **much better models** than Windows/low-spec machines, but we'll keep it fast and responsive.

---

## 🚀 **Model Strategy (MacBook Pro 2025)**

### **Fast Tasks** (Frequent, Need Speed)
- **Model**: `llama3.2:3b` (4.7GB) or `qwen2.5:7b` (4.6GB)
- **RAM Usage**: ~6GB total
- **Speed**: 2-5 seconds per task
- **Use For**: Lead scoring, follow-ups, daily checks

### **Quality Tasks** (Important, Need Quality)
- **Model**: `llama3:8b` (4.7GB) or `qwen2.5:14b` (8.4GB)
- **RAM Usage**: ~10-12GB total
- **Speed**: 5-15 seconds per task
- **Use For**: Proposals, code generation, complex analysis

### **Avoid**
- ❌ `llama3:70b` - Too slow, needs 40GB+ RAM
- ❌ `qwen2.5:72b` - Too slow, needs 40GB+ RAM
- ✅ **Sweet Spot**: `llama3:8b` or `qwen2.5:14b` for quality, `llama3.2:3b` for speed

---

## ⚙️ **Mac Configuration**

### **Environment Variables** (`.env`)

```bash
# Enable local LLM
LOCAL_LLM=true
OLLAMA_URL=http://localhost:11434

# Mac-optimized models (leverages your 24GB RAM)
OLLAMA_MODEL_FAST=llama3.2:3b          # Fast tasks (4.7GB, ~6GB RAM)
OLLAMA_MODEL_QUALITY=llama3:8b         # Quality tasks (4.7GB, ~10GB RAM)

# OR use better quality for everything (still fast with 24GB RAM)
# OLLAMA_MODEL_FAST=llama3:8b
# OLLAMA_MODEL_QUALITY=llama3:8b

# OR maximum quality (if you want best results)
# OLLAMA_MODEL_FAST=qwen2.5:7b         # Fast tasks (4.6GB)
# OLLAMA_MODEL_QUALITY=qwen2.5:14b     # Quality tasks (8.4GB, ~12GB RAM)
```

---

## 📊 **Performance Expectations**

### **With llama3.2:3b (Fast Model)**
- Lead scoring: **1-3 seconds** per lead
- Code generation: **3-8 seconds** per component
- Daily reports: **20-40 seconds** total
- RAM usage: **~6GB** (plenty of headroom)

### **With llama3:8b (Quality Model)**
- Lead scoring: **2-5 seconds** per lead
- Code generation: **5-15 seconds** per component
- Daily reports: **30-60 seconds** total
- RAM usage: **~10GB** (still plenty of headroom)

### **System Impact**
- ✅ **CPU**: Moderate (20-40% during runs)
- ✅ **RAM**: 6-12GB (out of 24GB)
- ✅ **Disk**: Minimal (models cached)
- ✅ **Battery**: Low impact (agents run briefly)
- ✅ **Heat**: Minimal (short bursts)

---

## 🎯 **Mac-Optimized Agent Setup**

### **Step 1: Install Ollama (Mac)**

```bash
# Install via Homebrew (recommended)
brew install ollama

# OR download from https://ollama.ai/download/mac
```

### **Step 2: Pull Mac-Optimized Models**

```bash
# Fast model (for frequent tasks)
ollama pull llama3.2:3b        # 4.7GB - Fast and efficient

# Quality model (for important tasks)
ollama pull llama3:8b          # 4.7GB - Better quality

# OR use Qwen for even better quality
# ollama pull qwen2.5:7b       # 4.6GB - Fast alternative
# ollama pull qwen2.5:14b      # 8.4GB - Maximum quality
```

### **Step 3: Start Ollama**

```bash
# Start Ollama (usually auto-starts)
ollama serve

# Keep running in background
```

### **Step 4: Configure**

Add to `.env`:
```bash
LOCAL_LLM=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL_FAST=llama3.2:3b
OLLAMA_MODEL_QUALITY=llama3:8b
```

---

## ⚡ **Performance Optimizations**

### **1. Concurrent Agent Runs**
Your Mac can handle **multiple agents simultaneously**:
- Run 2-3 agents in parallel
- Faster overall execution
- Still responsive

### **2. Model Caching**
- Ollama caches models in RAM
- First run: slower (loads model)
- Subsequent runs: **much faster**
- Keep Ollama running!

### **3. Smart Scheduling**
- Light tasks use fast model
- Important tasks use quality model
- Batch similar tasks together

### **4. Resource Management**
- Agents run in short bursts
- No long-running processes
- System stays responsive

---

## 🐝 **Mac-Optimized Agent Swarm**

### **Fast Agents** (use `llama3.2:3b`)
- Lead Qualification (every 2 hours)
- Follow-up Agent (daily)
- Workflow Automation (daily)
- Client Retention (daily)
- Competitor Intelligence (daily)

### **Quality Agents** (use `llama3:8b`)
- Proposal Generator (on-demand)
- Code Generator (on-demand)
- Upsell Agent (weekly)
- Dev Helper (daily)
- Content Performance (weekly)

### **Smart Agent Scheduling**
```
Morning (07:00-09:00):
  - 07:00: Competitor Intel (fast model)
  - 08:00: Dev Helper (quality model)
  - 08:30: Analytics (fast model)
  - 09:00: Follow-up (fast model) + Workflow (fast model) [parallel]

Daytime (10:00-18:00):
  - Every 2 hours: Lead Qualification (fast model)
  - 11:00: Client Retention (fast model)
  - 14:00: Lead Qualification (fast model)

Evening (20:00-21:00):
  - 20:00: Content Performance (quality model)
  - 21:00: SEO Optimizer (quality model)
```

---

## 💡 **Mac-Specific Tips**

### **1. Keep Ollama Running**
```bash
# Start Ollama in background
brew services start ollama

# OR keep terminal open with:
ollama serve
```

### **2. Monitor Performance**
```bash
# Check Ollama status
ollama list

# Monitor RAM usage
top -l 1 | grep ollama

# Or use Activity Monitor (GUI)
```

### **3. Optimize Model Loading**
- First run is slower (model loads)
- Keep Ollama running = instant responses
- Models stay in RAM for fast access

### **4. Battery Impact**
- Agents run briefly (seconds)
- Minimal battery impact
- Consider running when plugged in for best performance

### **5. Heat Management**
- Short agent runs = minimal heat
- MacBook handles it easily
- No throttling needed

---

## 🎯 **Recommended Setup**

### **Conservative** (Fastest, Lowest Impact)
```bash
OLLAMA_MODEL_FAST=llama3.2:3b      # 4.7GB
OLLAMA_MODEL_QUALITY=llama3.2:3b   # Same model
```
- ✅ Fastest responses
- ✅ Lowest RAM usage (~6GB)
- ✅ No slowdowns
- ✅ Great for daily tasks

### **Balanced** (Recommended)
```bash
OLLAMA_MODEL_FAST=llama3.2:3b      # 4.7GB - Fast tasks
OLLAMA_MODEL_QUALITY=llama3:8b     # 4.7GB - Quality tasks
```
- ✅ Fast for frequent tasks
- ✅ Quality for important tasks
- ✅ ~10GB RAM usage (plenty of headroom)
- ✅ Best balance

### **Maximum Quality** (If You Want Best Results)
```bash
OLLAMA_MODEL_FAST=qwen2.5:7b       # 4.6GB - Fast tasks
OLLAMA_MODEL_QUALITY=qwen2.5:14b   # 8.4GB - Maximum quality
```
- ✅ Best quality output
- ✅ ~12GB RAM usage (still plenty)
- ✅ Slightly slower but better results
- ✅ Great for proposals/docs

---

## ⚠️ **What to Avoid**

### **Don't Use**
- ❌ `llama3:70b` - Too slow, needs 40GB+ RAM
- ❌ `qwen2.5:72b` - Too slow, needs 40GB+ RAM
- ❌ Running 5+ agents simultaneously - May slow down

### **Best Practices**
- ✅ Use `llama3:8b` or `qwen2.5:14b` max
- ✅ Run 2-3 agents max in parallel
- ✅ Keep Ollama running
- ✅ Monitor RAM usage if running many agents

---

## 📊 **Expected Performance**

### **Daily Agent Runs**
- **Total Time**: 2-5 minutes (all agents combined)
- **Peak RAM**: 10-12GB (out of 24GB)
- **CPU Impact**: 20-40% during runs
- **System Impact**: **Minimal** - stays responsive

### **On-Demand Agents**
- **Code Generation**: 5-15 seconds
- **Proposal Generation**: 10-30 seconds
- **Lead Scoring**: 2-5 seconds per lead

### **System Responsiveness**
- ✅ **No slowdowns** - Agents run in short bursts
- ✅ **Fast switching** - Models load quickly
- ✅ **Low heat** - Brief CPU usage
- ✅ **Battery friendly** - Short runs

---

## 🚀 **Quick Start (Mac)**

```bash
# 1. Install Ollama
brew install ollama

# 2. Start Ollama
brew services start ollama

# 3. Pull models
ollama pull llama3.2:3b        # Fast model
ollama pull llama3:8b          # Quality model

# 4. Configure .env
LOCAL_LLM=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL_FAST=llama3.2:3b
OLLAMA_MODEL_QUALITY=llama3:8b

# 5. Test
pnpm agents:dev-helper
```

---

## ✅ **Mac Checklist**

- [ ] Ollama installed and running
- [ ] `llama3.2:3b` pulled (fast model)
- [ ] `llama3:8b` pulled (quality model)
- [ ] `.env` configured with Mac settings
- [ ] Test: `ollama run llama3:8b "test"`
- [ ] Test: `pnpm agents:dev-helper`
- [ ] RAM usage reasonable (<12GB)
- [ ] System stays responsive

---

## 🎯 **Result**

**Perfect balance** - Better quality than Windows setup, but still fast and responsive. Your MacBook Pro 2025 handles it easily!

**Recommended**: Use `llama3.2:3b` for fast tasks, `llama3:8b` for quality tasks. Best of both worlds! 🚀

