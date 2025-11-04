# 🚀 AIMLAPI Models Guide - 300+ AI Models Available!

## 🎯 **Best Models for Different Tasks**

AIMLAPI provides access to **300+ AI models** from leading providers. Here are the best models for each task:

### 📝 **Content Generation (Social Media Posts)**

**Recommended Models:**
- `gpt-4-turbo` - Fast, creative, great for social posts
- `claude-3-opus` - Best quality, natural language
- `claude-3-sonnet` - Balanced quality/speed
- `gpt-4` - Reliable fallback

**Current Setting**: `gpt-4-turbo` (default)

### 📊 **Agent Reports (EOD, Intake, Grants)**

**Recommended Models:**
- `claude-3-opus` - Best for structured reports
- `gpt-4-turbo` - Fast, good quality
- `gemini-pro` - Good for summaries

**Usage**: Automatically uses best model for agent tasks

### 🎨 **Creative Content (Ad Copy, Marketing)**

**Recommended Models:**
- `claude-3-opus` - Most creative, best tone
- `gpt-4-turbo` - Fast, creative
- `claude-3-sonnet` - Balanced

### 🔍 **QA & Verification**

**Recommended Models:**
- `gpt-4-turbo` - Fast verification
- `claude-3-opus` - Most thorough
- `gpt-4` - Reliable

### 📧 **Email Content**

**Recommended Models:**
- `claude-3-opus` - Best for professional tone
- `gpt-4-turbo` - Good balance
- `claude-3-sonnet` - Fast, professional

---

## ⚙️ **Configuration**

### **Default Model**
Set in `.env`:
```bash
AIMLAPI_MODEL=gpt-4-turbo
```

### **Per-Task Model Selection**
The system automatically selects the best model:
- **Social Posts**: `gpt-4-turbo` (creative, fast)
- **Agent Reports**: `claude-3-opus` (structured, thorough)
- **QA Verification**: `gpt-4-turbo` (fast, reliable)
- **Ad Generation**: `claude-3-opus` (creative, persuasive)

---

## 🌟 **Available Model Categories**

### **OpenAI Models**
- `gpt-4-turbo` ⭐ **Recommended**
- `gpt-4`
- `gpt-3.5-turbo`
- `gpt-4-32k`

### **Anthropic Models**
- `claude-3-opus` ⭐ **Best Quality**
- `claude-3-sonnet` ⭐ **Balanced**
- `claude-3-haiku` (fastest)
- `claude-2`

### **Google Models**
- `gemini-pro`
- `gemini-pro-vision`
- `palm-2`

### **Meta Models**
- `llama-3-70b`
- `llama-2-70b`

### **Other Models**
- `mistral-large`
- `mixtral-8x7b`
- `cohere-command`
- And 280+ more!

---

## 🔧 **How to Use Different Models**

### **Option 1: Set Default Model**
```bash
# In .env
AIMLAPI_MODEL=claude-3-opus
```

### **Option 2: Specify Per Call**
```typescript
// In your code
const result = await llm.text(prompt, {
  model: 'claude-3-opus',
  temperature: 0.7,
});
```

### **Option 3: Task-Specific Models**
The system automatically uses:
- **Social Posts**: Creative models (gpt-4-turbo, claude-3-opus)
- **Reports**: Structured models (claude-3-opus, gpt-4-turbo)
- **QA**: Fast models (gpt-4-turbo)

---

## 💡 **Recommendations**

### **For Best Quality**
```bash
AIMLAPI_MODEL=claude-3-opus
```
- Best for: Reports, professional content, complex tasks
- Slower but highest quality

### **For Best Speed**
```bash
AIMLAPI_MODEL=gpt-4-turbo
```
- Best for: Social posts, quick tasks
- Fast and still great quality

### **For Best Balance**
```bash
AIMLAPI_MODEL=claude-3-sonnet
```
- Best for: Mixed workloads
- Good speed + quality balance

---

## 🎯 **Current Implementation**

Your system now uses:
- **Default**: `gpt-4-turbo` (fast, creative)
- **Fallback Chain**: Gemini → Grok → Perplexity → **AIMLAPI** → POE
- **Model Selection**: Automatic based on task type

---

## 🚀 **Try Different Models**

Experiment with different models to find what works best:

```bash
# Try Claude Opus (best quality)
AIMLAPI_MODEL=claude-3-opus

# Try Claude Sonnet (balanced)
AIMLAPI_MODEL=claude-3-sonnet

# Try GPT-4 Turbo (fast)
AIMLAPI_MODEL=gpt-4-turbo
```

**The system will automatically use your chosen model!**

---

## 📚 **Full Model List**

See AIMLAPI docs for complete list of 300+ models:
- OpenAI models
- Anthropic models
- Google models
- Meta models
- Specialized models
- And more!

**Your AIMLAPI key gives you access to ALL of them!** 🎉

