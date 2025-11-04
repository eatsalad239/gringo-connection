# 📋 Agent Swarm - All Commands

## One-Line Launch 🚀

```bash
pnpm swarm:outreach
```

This runs the complete 4-phase campaign automatically.

---

## Full Command List

### Main Commands

| Command | What It Does | Time |
|---------|------------|------|
| `pnpm swarm:outreach` | **🚀 Full campaign** - All 4 phases | 2-5 min |
| `pnpm swarm:launch` | **Interactive menu** - Choose what to run | Manual |

### Component Commands

| Command | What It Does | Time |
|---------|------------|------|
| `pnpm swarm:discover` | 🔍 Business discovery only | 30s |
| `pnpm swarm:targets` | 🎯 Show high-priority targets | 10s |
| `pnpm swarm:forms` | ⚡ Rapid form filling only | 60s |
| `pnpm swarm:agents` | 📝 Form filling agents | 60s |

### Shell Script

```bash
bash launch-agent-swarm.sh
```

Launches interactive menu with options.

---

## Detailed Command Reference

### 🚀 Full Campaign (RECOMMENDED)
```bash
pnpm swarm:outreach
```

**What it does:**
1. Discovers 20+ Medellín businesses
2. Selects high-priority targets
3. Fills intake forms rapidly
4. Sends follow-up emails
5. Generates final report

**Output files:**
- `AGENT_SWARM_FINAL_REPORT.md`
- `AGENT_SWARM_FINAL_REPORT.json`
- `content/discovered-businesses.json`
- `content/swarm-targets.json`
- `content/rapid-form-results.json`

**Time:** ~2:30 minutes

---

### 🔍 Business Discovery Only
```bash
pnpm swarm:discover
```

**What it does:**
1. Discovers 20+ businesses in Medellín
2. Validates contact forms
3. Calculates priority scores
4. Saves to database

**Output files:**
- `content/discovered-businesses.json` (20+ businesses)
- `content/business-discovery-report.json`

**Time:** ~30 seconds

**Example output:**
```
🔍 Discovering Medellín businesses...
✅ Found 2 Restaurantes y Cafés
✅ Found 2 Belleza y Salones
... (8 more categories)
Total: 20 businesses discovered
```

---

### 🎯 Show High-Priority Targets
```bash
pnpm swarm:targets
```

**What it does:**
1. Loads discovered businesses
2. Filters by priority (7+)
3. Verifies contact forms exist
4. Shows list of targets

**Output:**
Displays on screen (example):
```
🎯 HIGH PRIORITY TARGETS (Priority >= 8)

✅ Andrés Carne de Res (Restaurantes y Cafés) - Priority: 9
   Website: https://www.andrecarner.com
   Form: https://www.andrecarner.com/contacto

✅ Diego Velasco Salon (Belleza y Salones) - Priority: 9
   Website: https://www.diegovelasco.com
   Form: https://www.diegovelasco.com/contacto
```

**Time:** ~10 seconds

---

### ⚡ Rapid Form Filling Only
```bash
pnpm swarm:forms
```

**What it does:**
1. Opens Playwright browser
2. Fills forms at maximum speed
3. Submits with auto-detection
4. Tracks results

**Output files:**
- `content/rapid-form-results.json`

**Time:** ~60 seconds

**Example output:**
```
⚡ RAPID FORM FILLING - Processing 16 websites
📊 Concurrency: 10 forms simultaneously

📤 Batch 1: Processing 10 forms...
✅ restaurante.com (120ms)
✅ salondebelleza.co (95ms)
✅ inmobiliaria.co (150ms)
...

✅ Batch 2: Processing 6 forms...
...

========================================
📊 RAPID FORM FILLING REPORT
========================================
Total Forms: 16
Successful: 15 (93.8%)
Avg Time per Form: 110ms
Speed: 14.5 forms/second
Total Time: 1.10s
```

---

### 📝 Form Filling Agents
```bash
pnpm swarm:agents
```

**What it does:**
1. Creates 20 autonomous agents
2. Each targets 3 businesses
3. Fills forms simultaneously
4. Sends follow-up emails

**Output files:**
- `content/agent-form-filling-results.json`
- `content/form-filling-agents.log`

**Time:** ~90 seconds

---

### 📋 Interactive Menu
```bash
pnpm swarm:launch
```

or

```bash
bash launch-agent-swarm.sh
```

**What it shows:**
```
╔════════════════════════════════════════════════════════════╗
║                   LAUNCH OPTIONS                           ║
├────────────────────────────────────────────────────────────┤
│ 1) 🚀 LAUNCH FULL CAMPAIGN (Recommended)                   │
│ 2) 🔍 DISCOVERY ONLY                                        │
│ 3) 🎯 TARGETING ONLY                                        │
│ 4) ⚡ RAPID FORM FILLING ONLY                                │
│ 5) 📊 SHOW REPORT                                            │
│ 6) 📋 SHOW LOGS                                              │
│ 0) EXIT                                                     │
└────────────────────────────────────────────────────────────┘

Select option (0-6): 
```

**Time:** Interactive (user selects)

---

## Monitoring & Reporting Commands

### View Latest Report
```bash
cat AGENT_SWARM_FINAL_REPORT.md
```

Shows executive summary with all metrics.

---

### View Report as JSON
```bash
cat AGENT_SWARM_FINAL_REPORT.json | jq '.'
```

Shows structured data for processing.

---

### Watch Live Agent Activity
```bash
tail -f content/form-filling-agents.log
```

Shows real-time agent logs as campaign runs.

**Example output:**
```
[2024-11-04T15:30:45.123Z] [AGENT-01] ✅ Browser initialized
[2024-11-04T15:30:46.456Z] [AGENT-01] 🔍 Found 3 target websites
[2024-11-04T15:30:47.789Z] [AGENT-01] 📄 Opening https://restaurante.com
[2024-11-04T15:30:49.012Z] [AGENT-01] 📝 Form detected using selector: form
[2024-11-04T15:30:50.345Z] [AGENT-01] ✍️ Filled field: input[name="name"]
[2024-11-04T15:30:51.678Z] [AGENT-01] ✅ Form submitted
```

---

### View Form Results Summary
```bash
cat content/rapid-form-results.json | jq '.summary'
```

Shows key metrics from form filling.

**Example output:**
```json
{
  "totalProcessed": 16,
  "successfulSubmissions": 15,
  "successRate": "93.8%",
  "averageSubmissionTime": "110ms",
  "formsPerSecond": "14.5"
}
```

---

### View Discovered Businesses
```bash
cat content/discovered-businesses.json | jq '.[].{name, type, website, priority}'
```

Lists all discovered businesses with details.

---

### Export Leads to CSV
```bash
cat content/discovered-businesses.json | jq -r '.[] | [.name, .type, .website, .businessEmail] | @csv' > leads.csv
```

Exports to spreadsheet format.

---

### Count Businesses by Type
```bash
cat content/discovered-businesses.json | jq 'group_by(.type) | map({type: .[0].type, count: length}) | .[]'
```

Shows breakdown by category.

---

## Advanced Commands

### Run Campaign and Save to File
```bash
pnpm swarm:outreach > campaign_$(date +%Y%m%d_%H%M%S).log 2>&1
```

Saves full output to timestamped file.

---

### Run Campaign in Background
```bash
pnpm swarm:outreach &
```

Runs campaign while freeing up terminal.

---

### Run Campaign Daily (via cron)
```bash
# Add to crontab
0 9 * * * cd /workspace && pnpm swarm:outreach
```

Runs at 9 AM every day automatically.

---

### Run Campaign Weekly (via cron)
```bash
# Add to crontab
0 9 * * 1 cd /workspace && pnpm swarm:outreach
```

Runs at 9 AM every Monday.

---

## Combination Commands

### Full Campaign + Watch Logs
```bash
pnpm swarm:outreach & tail -f content/form-filling-agents.log
```

Runs campaign while showing logs in real-time.

---

### Full Campaign + Show Final Report
```bash
pnpm swarm:outreach && echo "✅ Campaign complete!" && cat AGENT_SWARM_FINAL_REPORT.md
```

Runs campaign and displays report when done.

---

### Run Multiple Campaigns
```bash
for i in {1..5}; do echo "Campaign $i"; pnpm swarm:outreach; sleep 300; done
```

Runs 5 campaigns with 5-minute delays between them.

---

### Test Individual Components

#### Test Business Discovery
```bash
pnpm swarm:discover && cat content/business-discovery-report.json | jq '.totalDiscovered'
```

---

#### Test Form Filling
```bash
pnpm swarm:forms && cat content/rapid-form-results.json | jq '.summary'
```

---

#### Test Email
```bash
# Send test email (edit to use test address)
tsx automation/form-filling-agents.ts
```

---

## Troubleshooting Commands

### Check Node Version
```bash
node --version
# Expected: v18.0.0 or higher
```

---

### Check pnpm Version
```bash
pnpm --version
# Expected: 8.0.0 or higher
```

---

### Check Playwright Installation
```bash
npx playwright --version
# Expected: 1.40.0 or higher
```

---

### Install Playwright Browsers
```bash
npx playwright install
```

---

### Install Playwright Dependencies
```bash
npx playwright install-deps
```

---

### Check Environment Variables
```bash
echo "EOD_TO: $EOD_TO"
# Should show your email address
```

---

### Clear Old Results
```bash
rm -f content/discovered-businesses.json content/rapid-form-results.json
```

---

### View Error Report
```bash
cat AGENT_SWARM_ERROR_REPORT.md
```

If an error occurred, this file contains troubleshooting steps.

---

## Quick Reference Cheat Sheet

```bash
# START HERE
pnpm swarm:outreach                    # Run everything

# COMPONENTS
pnpm swarm:discover                    # Just discovery
pnpm swarm:targets                     # Just targeting
pnpm swarm:forms                       # Just form filling
pnpm swarm:agents                      # Just agents

# MONITORING
tail -f content/form-filling-agents.log # Watch logs
cat AGENT_SWARM_FINAL_REPORT.md        # View report
cat content/rapid-form-results.json    # View results

# UTILITIES
npx playwright install                 # Fix browser issues
pnpm swarm:launch                      # Interactive menu
bash launch-agent-swarm.sh             # Shell menu
```

---

## What Each Command Does (Summary)

| Command | Phase | Speed | Output | Use When |
|---------|-------|-------|--------|----------|
| `swarm:outreach` | All 4 | 2-5m | Full report | Run campaign |
| `swarm:discover` | 1 | 30s | Businesses | Find targets |
| `swarm:targets` | 2 | 10s | List | See targets |
| `swarm:forms` | 3 | 60s | Results | Test filling |
| `swarm:agents` | 4 | 90s | Agents | Test agents |

---

## Getting Help

### View Full Documentation
```bash
cat AGENT_SWARM_README.md
```

### View Quick Start
```bash
cat AGENT_SWARM_QUICKSTART.md
```

### View Technical Details
```bash
cat AGENT_SWARM_SYSTEM_CREATED.md
```

### View Dashboard
```bash
cat AGENT_SWARM_DASHBOARD.md
```

---

## Next Steps

1. **Run campaign:** `pnpm swarm:outreach`
2. **Monitor email:** Check info@gringoconnection.com in 24h
3. **View results:** `cat AGENT_SWARM_FINAL_REPORT.md`
4. **Repeat:** Run again next week

---

**Ready to launch? Run:**
```bash
pnpm swarm:outreach
```

🚀 Let's go!

