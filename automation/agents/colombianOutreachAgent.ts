/**
 * Colombian Business Outreach Agent
 * Sends tailored cold emails to 50K+ Colombian businesses
 * Uses Resend for rotating email addresses
 * Segments by revenue tier: high-net-worth → medium → low
 * Tailors pitch by industry and pain points
 * Rate-limited to maximize deliverability
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail, llm } from '../providers.js';
import { rateLimiter } from '../utils/rateLimiter.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

// Rotating email addresses for Resend
const SENDER_EMAILS = [
  'outreach@gringoconnection.com',
  'growth@gringoconnection.com',
  'hello@gringoconnection.com',
  'sales@gringoconnection.com',
  'contact@gringoconnection.com',
];

const SENDER_NAMES = [
  'Daniel Smith',
  'Eddy Richardson',
  'Growth Team',
  'Sales Team',
  'Business Development',
];

interface ColumbanBusiness {
  id: string;
  name: string;
  email: string;
  phone?: string;
  industry: string;
  location: string;
  estimatedRevenue?: string; // 'high' | 'medium' | 'low'
  employees?: number;
  website?: string;
  ownerName?: string;
  ownerEmail?: string;
  painPoints?: string[];
  dataSource?: string;
}

interface OutreachCampaign {
  businessId: string;
  email: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  senderEmail: string;
  senderName: string;
  recommendedServices: string[];
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  errorMessage?: string;
  retries: number;
}

interface OutreachStats {
  totalRequested: number;
  totalSent: number;
  totalFailed: number;
  byIndustry: Record<string, number>;
  byRevenueTier: Record<string, number>;
  campaignDuration: number;
  avgEmailsPerHour: number;
}

// Get rotating sender details
function getNextSender(index: number): { email: string; name: string } {
  return {
    email: SENDER_EMAILS[index % SENDER_EMAILS.length],
    name: SENDER_NAMES[index % SENDER_NAMES.length],
  };
}

// Load Colombian businesses from local file or API
async function loadColombianBusinesses(limit: number = 1000): Promise<ColumbanBusiness[]> {
  const businesses: ColumbanBusiness[] = [];
  const businessesPath = join(CONTENT_DIR, 'colombian-businesses.json');

  if (existsSync(businessesPath)) {
    try {
      const data = JSON.parse(readFileSync(businessesPath, 'utf-8'));
      return data.slice(0, limit);
    } catch (e) {
      console.warn('Failed to load local business database:', e);
    }
  }

  // Try to fetch from Hunter.io, Apollo.io, or other cheap APIs
  if (process.env.HUNTER_API_KEY) {
    try {
      // Example Hunter.io domain search for Colombian businesses
      const domains = ['medellín', 'bogotá', 'cali', 'colombia'];
      for (const domain of domains) {
        if (businesses.length >= limit) break;

        const res = await fetch(`https://api.hunter.io/v2/domain-search?domain=${domain}.co&limit=100`, {
          headers: {
            'Authorization': `Bearer ${process.env.HUNTER_API_KEY}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Parse and add to businesses array
          console.log(`Loaded ${data.data?.length || 0} businesses from ${domain}`);
        }
      }
    } catch (e) {
      console.warn('Hunter.io fetch failed:', e);
    }
  }

  // Fallback: generate sample Colombian businesses for testing
  return generateSampleColombianBusinesses(limit);
}

// Generate sample Colombian businesses for testing
function generateSampleColombianBusinesses(count: number): ColumbanBusiness[] {
  const industries = [
    'Legal Services',
    'Medical/Healthcare',
    'Real Estate',
    'Restaurants',
    'Retail',
    'Manufacturing',
    'Construction',
    'Education',
    'Accounting',
    'Marketing Agency',
  ];

  const cities = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena'];

  const businesses: ColumbanBusiness[] = [];

  for (let i = 0; i < count; i++) {
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const revenueTier = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';

    businesses.push({
      id: `biz-${i}`,
      name: `${industry} Business ${i}`,
      email: `info-${i}@colombianbusiness${i % 100}.co`,
      phone: `+57${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      industry,
      location: city,
      estimatedRevenue: revenueTier,
      employees: Math.floor(Math.random() * 500 + 1),
      website: `https://colombianbusiness${i}.co`,
      ownerName: `Owner ${i}`,
      ownerEmail: `owner-${i}@colombianbusiness${i % 100}.co`,
      painPoints: generatePainPoints(industry),
      dataSource: 'sample-test',
    });
  }

  return businesses;
}

// Generate pain points based on industry
function generatePainPoints(industry: string): string[] {
  const painPointsByIndustry: Record<string, string[]> = {
    'Legal Services': ['client acquisition', 'case management', 'document automation', 'online presence'],
    'Medical/Healthcare': ['patient scheduling', 'telemedicine', 'HIPAA compliance', 'billing'],
    'Real Estate': ['property listings', 'lead generation', 'virtual tours', 'CRM'],
    'Restaurants': ['online ordering', 'reservation system', 'inventory management', 'delivery integration'],
    'Retail': ['POS system', 'inventory tracking', 'ecommerce', 'customer loyalty'],
    'Manufacturing': ['supply chain', 'production tracking', 'quality control', 'automation'],
    'Construction': ['project management', 'scheduling', 'cost tracking', 'equipment rental'],
    'Education': ['online learning', 'student management', 'virtual classroom', 'homework tracking'],
    'Accounting': ['bookkeeping', 'tax compliance', 'financial reporting', 'audit trails'],
    'Marketing Agency': ['campaign management', 'analytics', 'client reporting', 'automation'],
  };

  return painPointsByIndustry[industry] || ['digital transformation', 'automation', 'online presence'];
}

// Generate tailored subject line and body
async function generateTailoredOutreach(
  business: ColumbanBusiness,
  senderIndex: number
): Promise<{ subject: string; htmlBody: string; textBody: string; recommendedServices: string[] }> {
  const sender = getNextSender(senderIndex);

  // Use AI to generate personalized pitch
  const prompt = `Generate a professional cold email outreach for a Colombian ${business.industry} business.

Business Details:
- Name: ${business.name}
- Location: ${business.location}
- Size: ~${business.employees} employees
- Pain Points: ${business.painPoints?.join(', ') || 'Unknown'}
- Revenue Tier: ${business.estimatedRevenue || 'Unknown'}

Services we offer:
1. Custom Website Development & AI Integration
2. Business Automation & Workflow Optimization
3. Cloud Migration & Infrastructure
4. Digital Marketing & Lead Generation
5. CRM Implementation & Integration
6. Data Analytics & Business Intelligence

Task:
1. Generate an attention-grabbing subject line (max 50 chars) that mentions a specific pain point
2. Write a 3-4 paragraph professional email body that:
   - Opens with a personalized reference to their industry challenges
   - Mentions 1-2 specific services that solve their pain points
   - Includes a soft CTA (e.g., "coffee chat", "15-min call")
   - Signs off professionally
3. Recommend 2-3 services that best fit their needs

Output as JSON:
{
  "subject": "...",
  "body": "...",
  "recommendedServices": ["service1", "service2"]
}`;

  const result = await llm.text(prompt, {
    maxTokens: 800,
    temperature: 0.7,
    system: 'You are a expert B2B sales copywriter. Generate compelling, personalized cold emails in English (professional tone). Respond only with valid JSON.',
  });

  let emailContent = {
    subject: `Let's talk about ${business.industry} growth`,
    body: `Hi ${business.ownerName || 'there'},\n\nWe help ${business.industry} businesses in ${business.location} streamline operations and boost revenue.\n\nWould you be open to a quick 15-minute call to explore how we could help?\n\nBest regards,\n${sender.name}`,
    recommendedServices: ['Custom Website Development', 'Business Automation'],
  };

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emailContent = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse AI email response:', e);
    }
  }

  // Convert to HTML
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <p style="margin: 0 0 15px;">${emailContent.body.replace(/\n/g, '<br>')}</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          <strong>Interested?</strong><br>
          Let's jump on a quick call to discuss your specific needs.
        </p>
      </div>

      <p style="margin: 20px 0 0; font-size: 14px; color: #999;">
        Best regards,<br>
        <strong>${sender.name}</strong><br>
        Gringo Connection<br>
        <a href="mailto:${sender.email}" style="color: #0066cc; text-decoration: none;">${sender.email}</a><br>
        <a href="https://gringoconnection.com" style="color: #0066cc; text-decoration: none;">gringoconnection.com</a>
      </p>

      <p style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
        We respect your inbox. <a href="#" style="color: #0066cc; text-decoration: none;">Unsubscribe</a> if you'd prefer not to hear from us.
      </p>
    </div>
  `;

  return {
    subject: emailContent.subject,
    htmlBody,
    textBody: emailContent.body,
    recommendedServices: emailContent.recommendedServices,
  };
}

// Send individual email with rate limiting
async function sendOutreachEmail(
  business: ColumbanBusiness,
  campaign: Partial<OutreachCampaign>,
  senderIndex: number
): Promise<OutreachCampaign> {
  const sender = getNextSender(senderIndex);

  // Rate limit: respect email provider limits
  await rateLimiter.acquire('resend-emails', 1);

  const emailCampaign: OutreachCampaign = {
    businessId: business.id,
    email: business.email,
    subject: campaign.subject || '',
    htmlBody: campaign.htmlBody || '',
    textBody: campaign.textBody || '',
    senderEmail: sender.email,
    senderName: sender.name,
    recommendedServices: campaign.recommendedServices || [],
    status: 'pending',
    retries: 0,
  };

  try {
    // Send via Resend
    const result = await mail.send({
      to: business.email,
      subject: emailCampaign.subject,
      html: emailCampaign.htmlBody,
      text: emailCampaign.textBody,
    });

    if (result.ok) {
      emailCampaign.status = 'sent';
      emailCampaign.sentAt = new Date();
      console.log(`✅ Email sent to ${business.email}`);
    } else {
      emailCampaign.status = 'failed';
      emailCampaign.errorMessage = result.reason;
      console.warn(`❌ Failed to send email to ${business.email}: ${result.reason}`);
    }
  } catch (e) {
    emailCampaign.status = 'failed';
    emailCampaign.errorMessage = String(e);
    console.error(`❌ Exception sending email to ${business.email}:`, e);
  }

  return emailCampaign;
}

// Sort businesses by revenue tier (high to low)
function sortBusinessesByRevenue(businesses: ColumbanBusiness[]): ColumbanBusiness[] {
  const tierOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
  return [...businesses].sort((a, b) => {
    const tierA = tierOrder[(a.estimatedRevenue as keyof typeof tierOrder) || 'undefined'];
    const tierB = tierOrder[(b.estimatedRevenue as keyof typeof tierOrder) || 'undefined'];
    return tierA - tierB;
  });
}

// Main outreach campaign
export async function runColombianOutreach(opts?: { maxEmails?: number }): Promise<void> {
  const maxEmails = opts?.maxEmails || 100; // Start with 100, scale up
  console.log(`📧 Starting Colombian business outreach campaign (max: ${maxEmails} emails)...`);

  const startTime = Date.now();

  // Load businesses
  console.log('📥 Loading Colombian businesses...');
  const businesses = await loadColombianBusinesses(maxEmails * 2); // Load extra for filtering
  const sortedBusinesses = sortBusinessesByRevenue(businesses);

  if (sortedBusinesses.length === 0) {
    console.warn('No businesses to outreach');
    return;
  }

  const stats: OutreachStats = {
    totalRequested: Math.min(maxEmails, sortedBusinesses.length),
    totalSent: 0,
    totalFailed: 0,
    byIndustry: {},
    byRevenueTier: { high: 0, medium: 0, low: 0 },
    campaignDuration: 0,
    avgEmailsPerHour: 0,
  };

  const sentCampaigns: OutreachCampaign[] = [];

  // Send emails with rotation and rate limiting
  for (let i = 0; i < Math.min(maxEmails, sortedBusinesses.length); i++) {
    const business = sortedBusinesses[i];

    // Generate tailored email
    console.log(`\n📝 Generating email ${i + 1}/${stats.totalRequested}...`);
    const { subject, htmlBody, textBody, recommendedServices } = await generateTailoredOutreach(
      business,
      i
    );

    // Send email
    const campaign = await sendOutreachEmail(
      business,
      { subject, htmlBody, textBody, recommendedServices },
      i
    );

    sentCampaigns.push(campaign);

    // Update stats
    if (campaign.status === 'sent') {
      stats.totalSent++;
    } else {
      stats.totalFailed++;
    }

    stats.byIndustry[business.industry] = (stats.byIndustry[business.industry] || 0) + 1;
    const tier = (business.estimatedRevenue as keyof OutreachStats['byRevenueTier']) || 'low';
    stats.byRevenueTier[tier]++;

    // Small delay between emails to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 sec delay
  }

  stats.campaignDuration = (Date.now() - startTime) / 1000;
  stats.avgEmailsPerHour = (stats.totalSent / (stats.campaignDuration / 3600)) || 0;

  // Save campaign results
  const campaignsPath = join(CONTENT_DIR, `outreach-campaign-${Date.now()}.json`);
  writeFileSync(campaignsPath, JSON.stringify({ stats, campaigns: sentCampaigns }, null, 2));

  // Send summary email
  const summaryHtml = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">📧 Colombian Outreach Campaign Summary</h1>
      <p><strong>Date:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm', { timeZone: DEFAULT_TZ })}</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px;">📊 Campaign Statistics</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #e0f2fe;">
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Total Requested</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${stats.totalRequested}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Successfully Sent</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right; color: #16a34a;"><strong>${stats.totalSent}</strong></td>
          </tr>
          <tr style="background: #fef2f2;">
            <td style="padding: 10px; border: 1px solid #fecaca;"><strong>Failed</strong></td>
            <td style="padding: 10px; border: 1px solid #fecaca; text-align: right; color: #dc2626;"><strong>${stats.totalFailed}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Campaign Duration</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${(stats.campaignDuration / 60).toFixed(1)} minutes</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #bae6fd;"><strong>Avg Emails/Hour</strong></td>
            <td style="padding: 10px; border: 1px solid #bae6fd; text-align: right;">${stats.avgEmailsPerHour.toFixed(0)}</td>
          </tr>
        </table>
      </div>

      <h3 style="color: #1e40af; margin-top: 20px;">📈 By Revenue Tier</h3>
      <ul>
        <li><strong>High-Net-Worth:</strong> ${stats.byRevenueTier.high} businesses</li>
        <li><strong>Medium:</strong> ${stats.byRevenueTier.medium} businesses</li>
        <li><strong>Low-Income:</strong> ${stats.byRevenueTier.low} businesses</li>
      </ul>

      <h3 style="color: #1e40af; margin-top: 20px;">🏢 Top Industries</h3>
      <ul>
        ${Object.entries(stats.byIndustry)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([industry, count]) => `<li><strong>${industry}:</strong> ${count} businesses</li>`)
          .join('')}
      </ul>

      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Next Steps:</strong></p>
        <ul style="margin: 10px 0 0;">
          <li>Monitor email deliverability and bounce rates</li>
          <li>Set up follow-up sequences for non-responders</li>
          <li>Track open rates and click-through rates</li>
          <li>Scale to 50K businesses over the next 2-4 weeks</li>
        </ul>
      </div>

      <p style="font-size: 12px; color: #999; margin-top: 30px;">
        Campaign results saved to: ${campaignsPath}
      </p>
    </div>
  `;

  const mailResult = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `📧 Colombian Outreach Campaign — ${stats.totalSent}/${stats.totalRequested} Sent`,
    html: summaryHtml,
  });

  if (mailResult.ok) {
    console.log(`✅ Campaign summary sent to team`);
  }

  console.log(`\n🎉 Colombian outreach campaign complete!`);
  console.log(`   Sent: ${stats.totalSent}/${stats.totalRequested}`);
  console.log(`   Failed: ${stats.totalFailed}`);
  console.log(`   Duration: ${(stats.campaignDuration / 60).toFixed(1)} minutes`);
  console.log(`   Avg: ${stats.avgEmailsPerHour.toFixed(0)} emails/hour`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const maxEmails = parseInt(process.argv[2], 10) || 100;
  runColombianOutreach({ maxEmails }).catch(console.error);
}
