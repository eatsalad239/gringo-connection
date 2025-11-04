/**
 * Colombian Outreach Orchestrator
 * Coordinates multiple outreach agents working in parallel
 * Each agent targets specific industries/cities
 * Manages rate limiting, email rotation, and progress tracking
 */

import { formatInTimeZone } from 'date-fns-tz';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { mail, llm } from '../providers.js';
import { searchByIndustry, verifyEmails } from '../services/businessDataService.js';
import { selectTemplate, renderEmail, generateHtmlEmail } from '../services/emailTemplateService.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

// Agent configurations - each targets specific industry/cities
const OUTREACH_AGENTS = [
  { id: 'agent-legal', industry: 'Legal Services', cities: ['Medellín', 'Bogotá'], maxPerCity: 100 },
  { id: 'agent-medical', industry: 'Medical/Healthcare', cities: ['Medellín', 'Bogotá', 'Cali'], maxPerCity: 80 },
  { id: 'agent-realestate', industry: 'Real Estate', cities: ['Medellín', 'Bogotá'], maxPerCity: 100 },
  { id: 'agent-restaurant', industry: 'Restaurants', cities: ['Medellín', 'Bogotá', 'Cali'], maxPerCity: 120 },
  { id: 'agent-retail', industry: 'Retail', cities: ['Medellín', 'Bogotá', 'Cali'], maxPerCity: 100 },
  { id: 'agent-manufacturing', industry: 'Manufacturing', cities: ['Medellín', 'Cali'], maxPerCity: 60 },
];

// Rotating sender emails
const SENDERS = [
  { email: 'outreach@gringoconnection.com', name: 'Daniel Smith' },
  { email: 'growth@gringoconnection.com', name: 'Eddy Richardson' },
  { email: 'hello@gringoconnection.com', name: 'Growth Team' },
  { email: 'sales@gringoconnection.com', name: 'Sales Team' },
  { email: 'contact@gringoconnection.com', name: 'Business Development' },
];

interface AgentProgress {
  agentId: string;
  industry: string;
  city: string;
  totalBusinesses: number;
  emailsSent: number;
  emailsFailed: number;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

interface CampaignMetrics {
  timestamp: Date;
  agentId: string;
  industry: string;
  totalTargets: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgTimePerEmail: number;
}

/**
 * Run individual outreach agent for an industry in specific cities
 */
async function runOutreachAgent(
  agentConfig: (typeof OUTREACH_AGENTS)[0],
  languagePreference: 'en' | 'es' = 'es', // Spanish-first for Colombia
  startIndex: number = 0
): Promise<AgentProgress> {
  const progress: AgentProgress = {
    agentId: agentConfig.id,
    industry: agentConfig.industry,
    city: agentConfig.cities.join(', '),
    totalBusinesses: 0,
    emailsSent: 0,
    emailsFailed: 0,
    startTime: new Date(),
    status: 'running',
  };

  try {
    console.log(`\n🚀 Starting ${agentConfig.industry} outreach agent...`);

    // Fetch businesses by industry across all cities
    let allBusinesses = [];
    for (const city of agentConfig.cities) {
      console.log(`   📍 Searching for ${agentConfig.industry} in ${city}...`);
      const businesses = await searchByIndustry(agentConfig.industry, [city], agentConfig.maxPerCity);
      allBusinesses.push(...businesses);
    }

    // Verify emails
    console.log(`   📧 Verifying ${allBusinesses.length} emails...`);
    allBusinesses = await verifyEmails(allBusinesses);

    progress.totalBusinesses = allBusinesses.length;

    if (allBusinesses.length === 0) {
      console.warn(`   No businesses found for ${agentConfig.industry}`);
      progress.status = 'completed';
      return progress;
    }

    // Sort by employee count (high-net-worth first)
    allBusinesses.sort((a, b) => (b.employees || 0) - (a.employees || 0));

    // Send emails
    const senderIndex = startIndex % SENDERS.length;
    const sender = SENDERS[senderIndex];

    for (let i = 0; i < allBusinesses.length; i++) {
      const business = allBusinesses[i];

      try {
        if (!business.email) {
          progress.emailsFailed++;
          continue;
        }

        // Select template based on language and industry
        const template = selectTemplate({
          businessName: business.name,
          ownerName: business.ownerName,
          industry: agentConfig.industry,
          city: business.city || 'Colombia',
          painPoints: ['automation', 'efficiency', 'growth'],
          revenueLevel: business.employees ? (business.employees > 200 ? 'high' : 'medium') : 'low',
          language: languagePreference,
        });

        if (!template) {
          console.warn(`   No template found for ${agentConfig.industry}`);
          progress.emailsFailed++;
          continue;
        }

        // Render email
        const emailContent = renderEmail(template, {
          businessName: business.name,
          ownerName: business.ownerName,
          industry: agentConfig.industry,
          city: business.city || 'Colombia',
          painPoints: ['automation', 'efficiency', 'growth'],
          revenueLevel: business.employees ? (business.employees > 200 ? 'high' : 'medium') : 'low',
          language: languagePreference,
        }, sender.name);

        const htmlBody = generateHtmlEmail(emailContent, sender.email, template.recommendedServices);

        // Send email
        const sendResult = await mail.send({
          to: business.email,
          subject: emailContent.subject,
          html: htmlBody,
          text: emailContent.body,
        });

        if (sendResult.ok) {
          progress.emailsSent++;
          console.log(`   ✅ ${i + 1}/${allBusinesses.length} - ${business.name}`);
        } else {
          progress.emailsFailed++;
          console.warn(`   ❌ Failed: ${business.name} - ${sendResult.reason}`);
        }

        // Rotate sender for each email
        const currentSender = SENDERS[(startIndex + i) % SENDERS.length];

        // Rate limit: 1-3 second delay between emails
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));
      } catch (e) {
        progress.emailsFailed++;
        console.error(`   ❌ Exception for ${business.name}:`, e);
      }
    }

    progress.status = 'completed';
    progress.endTime = new Date();
  } catch (e) {
    progress.status = 'failed';
    progress.error = String(e);
    progress.endTime = new Date();
    console.error(`Agent ${agentConfig.id} failed:`, e);
  }

  return progress;
}

/**
 * Run all outreach agents in parallel (respecting rate limits)
 */
export async function runColombanOutreachOrchestrator(opts?: { 
  maxAgents?: number; 
  maxEmailsPerAgent?: number;
  language?: 'en' | 'es';
}): Promise<void> {
  const language = opts?.language || 'es'; // Spanish-first for Colombia
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎯 Colombian Business Outreach Campaign - Orchestration`);
  console.log(`Language: ${language}`);
  console.log(`Time: ${formatInTimeZone(new Date(), DEFAULT_TZ, 'yyyy-MM-dd HH:mm')}`);
  console.log(`${'='.repeat(80)}\n`);

  const campaignStart = Date.now();
  const allResults: AgentProgress[] = [];

  // Run agents in sequence to respect rate limits
  // (Running in parallel would exceed API rate limits)
  for (let i = 0; i < (opts?.maxAgents || OUTREACH_AGENTS.length); i++) {
    const agentConfig = OUTREACH_AGENTS[i];
    const result = await runOutreachAgent(agentConfig, language, i * 5); // Offset senders
    allResults.push(result);
  }

  const campaignDuration = (Date.now() - campaignStart) / 1000 / 60; // minutes

  // Generate summary report
  const totalSent = allResults.reduce((sum, r) => sum + r.emailsSent, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.emailsFailed, 0);
  const totalTargets = allResults.reduce((sum, r) => sum + r.totalBusinesses, 0);
  const successRate = totalTargets > 0 ? ((totalSent / totalTargets) * 100).toFixed(1) : '0';

  const summaryHtml = `
    <div style="font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">🎯 Colombian Outreach Campaign - Summary Report</h1>
      <p><strong>Date:</strong> ${formatInTimeZone(new Date(), DEFAULT_TZ, 'yyyy-MM-dd HH:mm')}</p>
      <p><strong>Campaign Duration:</strong> ${campaignDuration.toFixed(1)} minutes</p>
      <p><strong>Language:</strong> ${language.toUpperCase()}</p>

      <!-- Overall Stats -->
      <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 30px; border-radius: 8px; margin: 20px 0; color: white;">
        <h2 style="margin: 0 0 20px; font-size: 28px;">📊 Overall Campaign Metrics</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
          <div>
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 5px;">${totalSent}</div>
            <div style="font-size: 14px; opacity: 0.9;">Emails Sent</div>
          </div>
          <div>
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 5px;">${totalTargets}</div>
            <div style="font-size: 14px; opacity: 0.9;">Total Targeted</div>
          </div>
          <div>
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 5px;">${successRate}%</div>
            <div style="font-size: 14px; opacity: 0.9;">Success Rate</div>
          </div>
          <div>
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 5px;">${totalFailed}</div>
            <div style="font-size: 14px; opacity: 0.9;">Failed</div>
          </div>
        </div>
      </div>

      <!-- Agent Results Table -->
      <h2 style="color: #1e40af; margin-top: 30px;">🤖 Agent Performance</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #e0f2fe;">
            <th style="padding: 12px; text-align: left; border: 1px solid #bae6fd;"><strong>Agent</strong></th>
            <th style="padding: 12px; text-align: left; border: 1px solid #bae6fd;"><strong>Industry</strong></th>
            <th style="padding: 12px; text-align: center; border: 1px solid #bae6fd;"><strong>Targeted</strong></th>
            <th style="padding: 12px; text-align: center; border: 1px solid #bae6fd;"><strong>Sent</strong></th>
            <th style="padding: 12px; text-align: center; border: 1px solid #bae6fd;"><strong>Failed</strong></th>
            <th style="padding: 12px; text-align: center; border: 1px solid #bae6fd;"><strong>Success %</strong></th>
            <th style="padding: 12px; text-align: left; border: 1px solid #bae6fd;"><strong>Status</strong></th>
          </tr>
        </thead>
        <tbody>
          ${allResults
            .map(
              (result) => `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>${result.agentId}</strong></td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${result.industry}</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${result.totalBusinesses}</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; color: #16a34a;"><strong>${result.emailsSent}</strong></td>
              <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; color: #dc2626;">${result.emailsFailed}</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">
                <strong>${result.totalBusinesses > 0 ? ((result.emailsSent / result.totalBusinesses) * 100).toFixed(0) : '0'}%</strong>
              </td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; ${
                  result.status === 'completed'
                    ? 'background: #d1fae5; color: #065f46;'
                    : result.status === 'failed'
                      ? 'background: #fee2e2; color: #7f1d1d;'
                      : 'background: #fef3c7; color: #78350f;'
                }">
                  ${result.status.toUpperCase()}
                </span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- Next Steps -->
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin-top: 30px; border-radius: 4px;">
        <h3 style="margin: 0 0 10px; color: #15803d;">🚀 Next Steps</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>✓ Monitor email open rates and click-through rates</li>
          <li>✓ Set up automated follow-up sequences for non-responders</li>
          <li>✓ Track response patterns by industry and location</li>
          <li>✓ A/B test subject lines and CTAs for improvement</li>
          <li>✓ Scale successful agents to additional cities</li>
          <li>✓ Implement lead scoring and prioritization</li>
          <li>✓ Schedule next batch in 3-5 days</li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        <p>Campaign completed at ${formatInTimeZone(new Date(), DEFAULT_TZ, 'yyyy-MM-dd HH:mm')}</p>
        <p>Next outreach batch ready: Schedule with \`pnpm outreach:colombian\`</p>
      </div>
    </div>
  `;

  // Send summary email
  const mailResult = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `🎯 Colombian Outreach Campaign Complete — ${totalSent}/${totalTargets} Emails Sent (${successRate}%)`,
    html: summaryHtml,
  });

  if (mailResult.ok) {
    console.log(`\n✅ Summary report sent to team`);
  }

  // Save detailed results
  const resultsPath = join(CONTENT_DIR, `outreach-results-${Date.now()}.json`);
  writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    campaign: 'colombian-business-outreach',
    language,
    metrics: {
      totalSent,
      totalFailed,
      totalTargets,
      successRate: parseFloat(successRate),
      duration: campaignDuration,
      avgEmailsPerMinute: (totalSent / campaignDuration).toFixed(2),
    },
    agentResults: allResults,
  }, null, 2));

  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ Campaign Complete!`);
  console.log(`   Total Emails Sent: ${totalSent}/${totalTargets}`);
  console.log(`   Success Rate: ${successRate}%`);
  console.log(`   Duration: ${campaignDuration.toFixed(1)} minutes`);
  console.log(`   Results saved to: ${resultsPath}`);
  console.log(`${'='.repeat(80)}\n`);
}

// Export for npm script
if (import.meta.url === `file://${process.argv[1]}`) {
  const maxAgents = parseInt(process.argv[2], 10) || 6;
  const language = (process.argv[3] || 'es') as 'en' | 'es';
  runColombanOutreachOrchestrator({ maxAgents, language }).catch(console.error);
}
