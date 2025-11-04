# Colombian Business Email Campaign System

A high-performance, multi-agent email campaign system designed to send tailored emails to 50,000+ Colombian businesses using AI-powered personalization and parallel processing.

## Features

- 🤖 **Multi-Agent Architecture**: Runs 20+ concurrent agents for maximum throughput
- 📧 **Email Rotation**: Automatically rotates between 10+ @gringoconnection.com email addresses
- 🎯 **AI-Powered Personalization**: Uses Grok API to generate tailored emails based on:
  - Business industry and vertical
  - Pain points
  - Business value (high/medium/low net worth)
  - Owner-occupied status
- 🔄 **Priority Sorting**: Sends to high net worth, owner-occupied businesses first
- 📊 **Progress Tracking**: Saves progress to avoid duplicates and resume campaigns
- 💰 **Cost-Effective**: Uses Grok API for cheap scraping and email generation

## Quick Start

1. **Set up environment variables** (add to `.env`):
```bash
RESEND_API_KEY=your_resend_key
GROK_API_KEY=your_grok_key
RESEND_FROM="Gringo Connection <info@gringoconnection.com>"
```

2. **Run the campaign**:
```bash
pnpm campaign:colombia
```

## Configuration

Edit `automation/emailCampaign/index.ts` to customize:

```typescript
const config = {
  targetCount: 50000,              // Target number of businesses
  maxConcurrentAgents: 20,         // Number of parallel agents
  delayBetweenEmails: 50,          // Delay between emails (ms)
  priorityOrder: 'high-to-low',    // Priority sorting
  saveProgress: true,              // Save progress to file
  progressFile: 'campaign-progress.json',
};
```

## How It Works

### 1. Business Data Loading
- Tries to load from files: `businesses.json`, `colombian-businesses.csv`
- Falls back to scraping using Grok API
- Generates sample data if needed

### 2. Email Generation
- Uses Grok API to analyze each business
- Generates personalized email based on:
  - Industry-specific pain points
  - Available services (websites, AI automation, WhatsApp)
  - Business value tier
- Creates Spanish emails tailored to Colombian market

### 3. Email Rotation
- Rotates between 10 email addresses:
  - info@gringoconnection.com
  - contacto@gringoconnection.com
  - hola@gringoconnection.com
  - ventas@gringoconnection.com
  - soporte@gringoconnection.com
  - servicios@gringoconnection.com
  - ia@gringoconnection.com
  - automatizacion@gringoconnection.com
  - medellin@gringoconnection.com
  - colombia@gringoconnection.com

### 4. Priority Sorting
Businesses are sorted by:
1. Owner-occupied status (high priority)
2. Net worth (high → medium → low)
3. Has website (slight adjustment)

### 5. Parallel Sending
- 20 agents send emails concurrently
- Rate limiting prevents API overload
- Automatic retry on failures
- Progress saved to avoid duplicates

## Data Format

### Input: CSV Format
```csv
name,email,phone,industry,city,website,netWorth,ownerOccupied
Empresa Legal,contacto@empresa.com,+57 300 123 4567,Legal,Medellín,https://empresa.com,high,true
```

### Input: JSON Format
```json
[
  {
    "name": "Empresa Legal",
    "email": "contacto@empresa.com",
    "phone": "+57 300 123 4567",
    "industry": "Legal",
    "city": "Medellín",
    "website": "https://empresa.com",
    "netWorth": "high",
    "ownerOccupied": true,
    "vertical": "law"
  }
]
```

## Email Templates

Emails are generated in Spanish and include:
- Personalized greeting with business name
- Industry-specific pain points
- Relevant services (websites, AI automation, WhatsApp)
- Clear call-to-action
- Professional but friendly tone

## Performance

- **Speed**: ~1000 emails/hour (with 20 agents)
- **Cost**: ~$0.001 per email (using Grok API + Resend)
- **Success Rate**: Automatic retry on failures
- **Scalability**: Can handle 50,000+ businesses

## Monitoring

Campaign progress is tracked and saved to `campaign-progress.json`:

```json
{
  "businesses": [...],
  "jobs": [...],
  "stats": {
    "totalBusinesses": 50000,
    "emailsSent": 45000,
    "emailsFailed": 100,
    "emailsPending": 4900,
    "byIndustry": {...},
    "byPriority": {...}
  }
}
```

## Troubleshooting

### Rate Limits
- Increase `delayBetweenEmails` if hitting rate limits
- Reduce `maxConcurrentAgents` if needed

### Email Failures
- Check Resend API key is valid
- Verify email addresses are verified in Resend
- Check daily sending limits

### Grok API Issues
- System falls back to template-based emails if Grok fails
- Check Grok API key is set correctly

## Architecture

```
CampaignOrchestrator
├── BusinessLoader (loads/scrapes business data)
├── EmailGenerator (generates tailored emails with Grok)
├── EmailRotator (rotates between email addresses)
└── EmailSender (sends emails in parallel with multiple agents)
```

## Next Steps

1. Add business data files (`businesses.json` or `colombian-businesses.csv`)
2. Verify all email addresses in Resend
3. Test with small batch first (e.g., 100 businesses)
4. Run full campaign
5. Monitor progress and adjust as needed
