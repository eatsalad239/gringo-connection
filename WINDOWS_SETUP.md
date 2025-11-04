# 🪟 Windows Setup Guide - Eddy's Development Agents

## 🎯 **Optimized for Windows & Low-Spec Machines**

All agents work perfectly on Windows with lightweight models that run on 4GB+ RAM.

---

## 🚀 **Quick Setup (Windows)**

### **Step 1: Install Ollama**

1. **Download**: https://ollama.ai/download/windows
2. **Run installer** - It will install and start Ollama automatically
3. **Verify**: Open PowerShell and run:
   ```powershell
   ollama --version
   ```

### **Step 2: Pull Lightweight Models**

Open PowerShell and run:

```powershell
# BEST for Windows/low-spec (1.3GB, works on 4GB RAM)
ollama pull phi3:mini

# Optional: Better quality if you have 8GB+ RAM (4.7GB)
ollama pull llama3.2:3b
```

**Recommended**: Start with `phi3:mini` - it's fast and works great!

### **Step 3: Configure Environment**

Create/edit `.env` file:

```bash
# Enable local LLM
LOCAL_LLM=true
OLLAMA_URL=http://localhost:11434

# Use lightweight models (Windows-friendly)
OLLAMA_MODEL_FAST=phi3:mini
OLLAMA_MODEL_QUALITY=phi3:mini
```

### **Step 4: Test It**

```powershell
# Test Ollama is working
ollama run phi3:mini "Hello, can you help me?"

# Test agent
pnpm agents:dev-helper
```

---

## 💻 **Model Recommendations by RAM**

### **4GB RAM** (Minimum)
```bash
OLLAMA_MODEL_FAST=phi3:mini        # 1.3GB - BEST choice
OLLAMA_MODEL_QUALITY=phi3:mini     # Same model
```
**Performance**: ⚡ Fast, good for scoring/classification

### **8GB RAM** (Recommended)
```bash
OLLAMA_MODEL_FAST=phi3:mini        # 1.3GB - Fast tasks
OLLAMA_MODEL_QUALITY=llama3.2:3b   # 4.7GB - Better quality
```
**Performance**: ⚡⚡ Fast + better quality for proposals

### **16GB+ RAM** (If Available)
```bash
OLLAMA_MODEL_FAST=llama3.2:3b      # 4.7GB
OLLAMA_MODEL_QUALITY=llama3.2:3b   # Same model
```
**Performance**: ⚡⚡⚡ Great quality across the board

---

## 🚫 **Models to AVOID on Windows/Low-Spec**

❌ **llama3:8b** - Needs 16GB+ RAM, too slow on low-spec
❌ **llama3:70b** - Needs 40GB+ RAM, only for high-end servers
❌ **qwen2:72b** - Needs 40GB+ RAM, too large

✅ **Stick with**: phi3:mini, llama3.2:1b, llama3.2:3b

---

## 🔧 **Windows-Specific Tips**

### **1. PowerShell vs CMD**
Use **PowerShell** (recommended) or **CMD** - both work fine.

### **2. Path Issues**
If you get "command not found":
```powershell
# Make sure you're in the project directory
cd "C:\path\to\gringo connection"

# Or use full path
npx tsx automation/agents/devHelperAgent.ts
```

### **3. Keep Ollama Running**
- Ollama should auto-start after install
- Check if running: Look for "Ollama" in Task Manager
- If not running: Open PowerShell and run `ollama serve`

### **4. Monitor Performance**
- **Task Manager** → Check RAM usage
- If RAM is high, close other apps
- Use `phi3:mini` to keep RAM usage low (~2GB total)

### **5. Node.js Version**
Make sure you have Node.js 18+:
```powershell
node --version
# Should be v18 or higher
```

---

## 📋 **Available Commands (Windows)**

```powershell
# Development agents
pnpm agents:dev-helper          # Daily dev suggestions
pnpm agents:workflow            # Workflow checks
pnpm agents:qualify-leads        # Lead qualification

# Code generation
pnpm generate:code component Button "Button component" components/Button.tsx
pnpm generate:code api users "Users API" app/api/users/route.ts
pnpm generate:code hook useAuth "Auth hook" hooks/useAuth.ts

# Check Ollama models
ollama list                     # See installed models
ollama run phi3:mini "test"     # Test model
```

---

## ⚡ **Performance Optimization**

### **For Faster Responses**
1. Use `phi3:mini` for everything (fastest)
2. Close unnecessary apps
3. Use SSD if available
4. Keep Ollama running (don't restart)

### **For Better Quality**
1. Use `llama3.2:3b` for proposals/docs
2. Keep `phi3:mini` for quick tasks
3. Make sure you have 8GB+ RAM

---

## 🐛 **Troubleshooting (Windows)**

### **"Ollama not found"**
```powershell
# Reinstall Ollama from https://ollama.ai/download/windows
# Or add to PATH manually
```

### **"Model not found"**
```powershell
# Pull the model first
ollama pull phi3:mini
```

### **"Out of memory"**
- Use `phi3:mini` instead of larger models
- Close other apps
- Restart computer

### **"Port 11434 already in use"**
- Ollama is already running (good!)
- If issue persists, restart Ollama:
  ```powershell
  # Kill Ollama process in Task Manager
  # Then restart: ollama serve
  ```

### **Slow responses**
- Use `phi3:mini` (fastest model)
- Check RAM usage in Task Manager
- Close other apps

---

## ✅ **Windows Checklist**

- [ ] Ollama installed and running
- [ ] `phi3:mini` model pulled
- [ ] `.env` configured with `LOCAL_LLM=true`
- [ ] `.env` has `OLLAMA_MODEL_FAST=phi3:mini`
- [ ] Test: `ollama run phi3:mini "test"`
- [ ] Test: `pnpm agents:dev-helper`
- [ ] Check RAM usage is reasonable (<4GB for phi3:mini)

---

## 🎯 **Expected Performance**

### **With phi3:mini (1.3GB)**
- ✅ Lead scoring: 2-5 seconds per lead
- ✅ Code generation: 5-15 seconds per component
- ✅ Daily reports: 30-60 seconds total
- ✅ RAM usage: ~2GB total (Ollama + Node)

### **With llama3.2:3b (4.7GB)**
- ✅ Lead scoring: 3-8 seconds per lead
- ✅ Code generation: 10-30 seconds per component
- ✅ Daily reports: 60-120 seconds total
- ✅ RAM usage: ~6GB total (Ollama + Node)

---

## 🚀 **You're Ready!**

Once setup is complete:
1. Run `pnpm agents:dev-helper` daily
2. Generate code with `pnpm generate:code`
3. Check workflow with `pnpm agents:workflow`

**Everything works perfectly on Windows with lightweight models!** 🎉

---

**Recommended Setup for Eddy**: `phi3:mini` for everything - fast, works on any Windows machine!

