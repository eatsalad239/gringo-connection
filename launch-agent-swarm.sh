#!/bin/bash

# 🚀 AGENT SWARM LAUNCHER SCRIPT
# Quick start for 20-agent Medellín business outreach

set -e

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    🚀 AGENT SWARM LAUNCHER                          ║"
echo "║           20 Agents • 10 Business Types • Maximum Speed            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing..."
    npm install -g pnpm
fi

# Check dependencies
echo "📦 Checking dependencies..."

if ! command -v tsx &> /dev/null; then
    echo "Installing tsx..."
    pnpm add -g tsx
fi

# Ensure playwright is installed
echo "🌐 Ensuring Playwright is installed..."
npx playwright install > /dev/null 2>&1 || true

# Create necessary directories
mkdir -p content logs

echo ""
echo "┌────────────────────────────────────────────────────────────────────┐"
echo "│                      LAUNCH OPTIONS                                 │"
echo "├────────────────────────────────────────────────────────────────────┤"
echo "│ 1) 🚀 LAUNCH FULL CAMPAIGN (Recommended)                           │"
echo "│    - Discover businesses                                            │"
echo "│    - Select targets                                                 │"
echo "│    - Fill forms                                                     │"
echo "│    - Send follow-ups                                                │"
echo "│                                                                     │"
echo "│ 2) 🔍 DISCOVERY ONLY                                                │"
echo "│    - Find 20+ Medellín businesses                                  │"
echo "│    - Save to database                                               │"
echo "│                                                                     │"
echo "│ 3) 🎯 TARGETING ONLY                                                │"
echo "│    - Show high-priority targets                                     │"
echo "│    - Display form URLs                                              │"
echo "│                                                                     │"
echo "│ 4) ⚡ RAPID FORM FILLING ONLY                                        │"
echo "│    - Fill & submit forms at max speed                              │"
echo "│    - Test form filler                                               │"
echo "│                                                                     │"
echo "│ 5) 📊 SHOW REPORT                                                    │"
echo "│    - Display latest results                                         │"
echo "│                                                                     │"
echo "│ 6) 📋 SHOW LOGS                                                      │"
echo "│    - Watch real-time agent activity                                 │"
echo "│                                                                     │"
echo "│ 0) EXIT                                                             │"
echo "└────────────────────────────────────────────────────────────────────┘"
echo ""

read -p "Select option (0-6): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Launching full agent swarm campaign..."
        echo ""
        pnpm tsx automation/agent-swarm-launcher.ts launch
        ;;
    2)
        echo ""
        echo "🔍 Running business discovery..."
        echo ""
        pnpm tsx automation/business-discovery.ts discover
        ;;
    3)
        echo ""
        echo "🎯 Showing high-priority targets..."
        echo ""
        pnpm tsx automation/business-discovery.ts targets
        ;;
    4)
        echo ""
        echo "⚡ Starting rapid form filling..."
        echo ""
        pnpm tsx automation/rapid-form-filler.ts
        ;;
    5)
        echo ""
        echo "📊 Loading latest report..."
        echo ""
        if [ -f "AGENT_SWARM_FINAL_REPORT.md" ]; then
            cat AGENT_SWARM_FINAL_REPORT.md
        else
            echo "⚠️ No report found. Run the full campaign first."
        fi
        ;;
    6)
        echo ""
        echo "📋 Agent Activity Logs"
        echo ""
        if [ -f "content/form-filling-agents.log" ]; then
            tail -f content/form-filling-agents.log
        else
            echo "⚠️ No logs found. Run a campaign first."
        fi
        ;;
    0)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please select 0-6."
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
echo ""
echo "📚 For more info, see: AGENT_SWARM_README.md"
echo ""
