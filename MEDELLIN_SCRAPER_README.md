# 🏙️ Medellín Business Scraper with Rotating IPs

A high-performance web scraper designed to extract business data from Google Maps for Medellín, Colombia, with built-in rotating IP proxy support to avoid detection and blocking.

## 🎯 Features

- **20 Business Categories**: Comprehensive coverage of Medellín's business landscape
- **Rotating IP Proxies**: Automatic proxy rotation to avoid Google blocking
- **Smart Data Extraction**: Business names, ratings, reviews, addresses, and potential scores
- **Lead Qualification**: AI-powered scoring system for high-potential businesses
- **CSV Export**: Clean data export for CRM integration
- **Anti-Detection**: Multiple user agents, delays, and stealth techniques

## 🌐 Proxy Configuration

The scraper supports multiple premium proxy services for maximum reliability:

### Supported Proxy Providers

1. **Bright Data (formerly Luminati)** - Enterprise-grade residential proxies
2. **Oxylabs** - High-speed residential and datacenter proxies
3. **Smart Proxy** - Residential proxy network
4. **Custom Residential Proxies** - Any SOCKS5/HTTP proxy

### Environment Variables

Set these environment variables to configure proxies:

```bash
# Bright Data
export BRIGHT_DATA_USERNAME="your_username"
export BRIGHT_DATA_PASSWORD="your_password"

# Oxylabs
export OXYLABS_USERNAME="your_username"
export OXYLABS_PASSWORD="your_password"

# Smart Proxy
export SMARTPROXY_USERNAME="your_username"
export SMARTPROXY_PASSWORD="your_password"

# Custom proxy
export RESIDENTIAL_PROXY_URL="http://your-proxy-server:port"
```

### Proxy Rotation Logic

- **Automatic Rotation**: Switches proxies on failures or blocks
- **Health Checks**: Tests proxy connectivity before use
- **Fallback**: Uses direct connection if no proxies configured
- **Load Balancing**: Distributes requests across available proxies

## 📊 Business Categories

The scraper targets these 20 high-value business categories in Medellín:

1. Restaurants Medellín
2. Hotels Medellín
3. Lawyers Medellín
4. Accountants Medellín
5. Consultants Medellín
6. Real Estate Medellín
7. Dentists Medellín
8. Doctors Medellín
9. Construction Companies Medellín
10. Universities Medellín
11. Tech Companies Medellín
12. Retail Stores Medellín
13. Shopping Centers Medellín
14. Pharmacies Medellín
15. Banks Medellín
16. Insurance Companies Medellín
17. Marketing Agencies Medellín
18. Software Companies Medellín
19. Manufacturers Medellín
20. Tourism Agencies Medellín

## 🚀 Usage

### Check Proxy Status
```bash
pnpm scraper:proxies
```

### Test with 3 Categories
```bash
pnpm scraper:test
```

### Full Production Scrape
```bash
pnpm scraper:medellin
```

### Direct Commands
```bash
# Check proxy configuration
node --import tsx medellin_business_scraper.ts proxies

# Test with first 3 categories
node --import tsx medellin_business_scraper.ts test

# Scrape all categories
node --import tsx medellin_business_scraper.ts scrape
```

## 📈 Data Output

### CSV Files Generated
- `medellin_businesses.csv` - All scraped businesses
- `medellin_high_potential_businesses.csv` - Businesses with score ≥ 50

### Data Fields
- **Name**: Business name
- **Category**: Business type
- **Rating**: Google rating (1-5 stars)
- **Reviews**: Number of reviews
- **Price Range**: Relative pricing (COP ranges)
- **Address**: Full Medellín address
- **Phone**: Contact number (if available)
- **Website**: Business website (if available)
- **Email**: Contact email (if available)
- **Description**: Business description
- **Potential Score**: AI-calculated lead score (0-100)

### Potential Score Calculation
- **Category Match**: +30 points for high-value categories
- **Rating Bonus**: +15-20 points for 4+ star businesses
- **Review Volume**: +5-15 points based on review count
- **Website Presence**: +10 points for having a website

## 🎯 Lead Generation Strategy

### Target Segmentation
- **High Potential**: Score ≥ 50 (recommended for outreach)
- **Medium Potential**: Score 30-49 (follow-up list)
- **Low Potential**: Score < 30 (archive)

### Email Campaign Strategy
1. **Initial Contact**: Personalized value proposition
2. **Follow-up**: Case studies and testimonials
3. **Nurture**: Educational content about digital transformation
4. **Close**: Special offers and consultations

### Expected Conversion Rates
- **Email Open Rate**: 25-35%
- **Response Rate**: 5-10%
- **Meeting Rate**: 20-30% of responses
- **Close Rate**: 50-70% of meetings

## ⚡ Performance & Scaling

### Speed Optimizations
- **Parallel Processing**: Multiple browser contexts
- **Smart Timeouts**: Adaptive delays based on proxy speed
- **Batch Processing**: Groups requests to avoid overwhelming servers
- **Connection Pooling**: Reuses browser instances

### Anti-Detection Measures
- **User Agent Rotation**: Different browsers/OS combinations
- **Request Throttling**: Randomized delays between requests
- **Cookie Management**: Fresh sessions per category
- **IP Rotation**: Automatic proxy switching on blocks

### Error Handling
- **Retry Logic**: Up to 3 attempts per category
- **Graceful Degradation**: Continues with other categories on failures
- **Detailed Logging**: Comprehensive error tracking
- **Recovery**: Can resume interrupted scrapes

## 🔧 Technical Architecture

### Dependencies
- **Playwright**: Browser automation and scraping
- **TypeScript**: Type-safe development
- **Node.js**: Runtime environment

### Browser Configuration
- **Headless Mode**: No GUI for server deployment
- **Custom Args**: Optimized for performance and stealth
- **Context Isolation**: Separate browser contexts per proxy
- **Resource Blocking**: Faster loading by blocking images/ads

### Data Processing Pipeline
1. **URL Generation**: Google Maps search URLs for each category
2. **Page Navigation**: Load search results with proxy rotation
3. **Content Extraction**: Parse business data from DOM
4. **Data Cleaning**: Normalize and validate extracted data
5. **Scoring**: Calculate potential scores for lead qualification
6. **Export**: Generate CSV files for downstream processing

## 🚨 Important Notes

### Legal Compliance
- **Terms of Service**: Check Google Maps ToS before scraping
- **Rate Limiting**: Respect Google's robots.txt and rate limits
- **Data Usage**: Only use scraped data for legitimate business purposes
- **Privacy**: Do not collect personally identifiable information without consent

### Best Practices
- **IP Rotation**: Always use proxies for production scraping
- **Delays**: Add appropriate delays between requests
- **Monitoring**: Track success rates and adjust strategies
- **Data Quality**: Regularly validate and clean scraped data

### Troubleshooting
- **No Proxies**: Set environment variables for proxy configuration
- **Blocks**: Try different proxy providers or increase delays
- **Empty Results**: Check Google Maps availability and selectors
- **Slow Performance**: Optimize proxy selection and reduce parallel requests

## 💰 Cost Considerations

### Proxy Costs (Approximate)
- **Bright Data**: $500-2000/month (500-2000 GB)
- **Oxylabs**: $300-1500/month (100-500 GB)
- **Smart Proxy**: $200-1000/month (200-1000 GB)

### Infrastructure Costs
- **Cloud Server**: $50-200/month (VPS for running scraper)
- **Data Storage**: $10-50/month (database and file storage)
- **API Calls**: Variable (depending on downstream processing)

### ROI Calculation
- **Cost per Lead**: $0.50-2.00 (including proxies and processing)
- **Average Deal Size**: $2,500-15,000 COP
- **Conversion Rate**: 5-15%
- **Break-even**: 2-4 converted leads per month

## 🔄 Integration Options

### CRM Integration
- **HubSpot**: Direct API integration for lead import
- **Pipedrive**: Automated deal creation
- **Zoho CRM**: Bulk import via CSV
- **Salesforce**: Custom connector development

### Email Automation
- **SendGrid/Mailgun**: Bulk email campaigns
- **HubSpot Marketing**: Automated sequences
- **ActiveCampaign**: Lead nurturing workflows
- **ConvertKit**: Drip campaigns for businesses

### Workflow Automation
- **Zapier**: Connect scraper to 5000+ apps
- **Make/Integromat**: Advanced automation scenarios
- **Custom APIs**: Direct integration with internal systems

## 📞 Support & Documentation

### Getting Help
- Check the troubleshooting section above
- Review error logs for specific issues
- Test with smaller datasets first
- Monitor proxy performance and rotate if needed

### Future Enhancements
- **Multi-language Support**: Spanish/English content detection
- **Advanced Filtering**: Custom scoring algorithms
- **Real-time Alerts**: Slack/Discord notifications for high-value leads
- **API Endpoints**: REST API for programmatic access
- **Dashboard**: Web interface for monitoring and management

---

**Ready to extract thousands of high-quality business leads from Medellín?**

Configure your proxies, run the scraper, and watch your pipeline fill up! 🚀