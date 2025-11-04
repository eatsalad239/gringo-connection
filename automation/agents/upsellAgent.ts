/**
 * Upsell Agent - Finds 20-40% revenue increase opportunities
 * Analyzes existing clients and suggests upsells
 * Runs weekly (Monday 10:00)
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { formatInTimeZone } from 'date-fns-tz';
import { mail, llm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const SERVICES_PATH = join(CONTENT_DIR, 'services.json');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface Client {
  id: string;
  name: string;
  email: string;
  currentServices: string[];
  monthlySpend?: number;
  joinedDate: string;
  tags?: string[];
}

interface UpsellOpportunity {
  client: Client;
  suggestedService: string;
  reasoning: string;
  estimatedValue: number;
  likelihood: 'high' | 'medium' | 'low';
  pitch: string;
}

// Mock client data - in production, fetch from CRM
async function fetchClients(): Promise<Client[]> {
  // This would fetch from GoHighLevel CRM
  // For now, return mock data structure
  return [];
}

// Analyze client for upsell opportunities
async function analyzeUpsell(client: Client, services: any[]): Promise<UpsellOpportunity[]> {
  const availableServices = services
    .filter((s) => !client.currentServices.includes(s.id))
    .map((s) => `${s.name_en} (${s.id})`)
    .join(', ');

  const prompt = `Analyze this client for upsell opportunities:

Client:
- Name: ${client.name}
- Current Services: ${client.currentServices.join(', ') || 'None'}
- Monthly Spend: $${client.monthlySpend || 'Unknown'}
- Joined: ${client.joinedDate}

Available Services: ${availableServices}

Suggest 1-2 upsell opportunities. Consider:
1. Service complementarity (what works well together)
2. Client needs based on current services
3. Natural next steps
4. Value addition

For each opportunity, provide:
- Service ID to suggest
- Reasoning (why this makes sense)
- Estimated monthly value increase
- Likelihood (high/medium/low)
- Personalized pitch opening

Format as JSON array:
[
  {
    "serviceId": "service-id",
    "reasoning": "why this upsell",
    "estimatedValue": 500,
    "likelihood": "high",
    "pitch": "personalized pitch opening"
  }
]`;

  const result = await llm.text(prompt, {
    maxTokens: 1000,
    model: process.env.LOCAL_LLM === 'true' ? (process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini') : undefined,
    system: 'You are an expert sales strategist. Output only valid JSON.',
  });

  const opportunities: UpsellOpportunity[] = [];

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.forEach((opp: any) => {
          const service = services.find((s) => s.id === opp.serviceId);
          if (service) {
            opportunities.push({
              client,
              suggestedService: service.name_en,
              reasoning: opp.reasoning || 'Natural progression',
              estimatedValue: opp.estimatedValue || 0,
              likelihood: opp.likelihood || 'medium',
              pitch: opp.pitch || `Hi ${client.name}, I have an idea that could help...`,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Failed to parse upsell analysis:', e);
    }
  }

  // Fallback: suggest complementary services
  if (opportunities.length === 0 && client.currentServices.length > 0) {
    const currentService = services.find((s) => client.currentServices.includes(s.id));
    if (currentService) {
      // Suggest ai-website if they don't have it
      if (!client.currentServices.includes('ai-website')) {
        const websiteService = services.find((s) => s.id === 'ai-website');
        if (websiteService) {
          opportunities.push({
            client,
            suggestedService: websiteService.name_en,
            reasoning: 'Complements existing services with online presence',
            estimatedValue: 500,
            likelihood: 'high',
            pitch: `Hi ${client.name}, adding a website would amplify your current services...`,
          });
        }
      }
    }
  }

  return opportunities;
}

export async function runUpsell(): Promise<void> {
  console.log('📈 Running upsell agent...');

  const services = JSON.parse(readFileSync(SERVICES_PATH, 'utf-8')).services || [];
  const clients = await fetchClients();

  if (clients.length === 0) {
    console.log('No clients to analyze');
    return;
  }

  console.log(`Analyzing ${clients.length} clients for upsell opportunities...`);

  // Analyze all clients
  const allOpportunities: UpsellOpportunity[] = [];
  for (const client of clients) {
    const opportunities = await analyzeUpsell(client, services);
    allOpportunities.push(...opportunities);
  }

  // Sort by likelihood and value
  allOpportunities.sort((a, b) => {
    const likelihoodOrder = { high: 3, medium: 2, low: 1 };
    if (likelihoodOrder[a.likelihood] !== likelihoodOrder[b.likelihood]) {
      return likelihoodOrder[b.likelihood] - likelihoodOrder[a.likelihood];
    }
    return b.estimatedValue - a.estimatedValue;
  });

  const highLikelihood = allOpportunities.filter((o) => o.likelihood === 'high');
  const totalValue = allOpportunities.reduce((sum, o) => sum + o.estimatedValue, 0);

  // Generate email report
  const opportunitiesHtml = allOpportunities
    .slice(0, 10) // Top 10
    .map(
      (opp) => `
      <div style="background: ${opp.likelihood === 'high' ? '#f0fdf4' : opp.likelihood === 'medium' ? '#fffbeb' : '#f9fafb'}; border-left: 4px solid ${opp.likelihood === 'high' ? '#16a34a' : opp.likelihood === 'medium' ? '#f59e0b' : '#6b7280'}; padding: 20px; margin: 15px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px; color: #1e40af;">${opp.client.name}</h3>
        <p style="margin: 5px 0;"><strong>Current Services:</strong> ${opp.client.currentServices.join(', ') || 'None'}</p>
        <p style="margin: 5px 0;"><strong>Suggested:</strong> ${opp.suggestedService}</p>
        <p style="margin: 5px 0;"><strong>Likelihood:</strong> <span style="text-transform: uppercase; color: ${opp.likelihood === 'high' ? '#16a34a' : opp.likelihood === 'medium' ? '#f59e0b' : '#6b7280'};">${opp.likelihood}</span></p>
        <p style="margin: 5px 0;"><strong>Estimated Value:</strong> $${opp.estimatedValue}/month</p>
        <p style="margin: 10px 0;"><strong>Reasoning:</strong> ${opp.reasoning}</p>
        <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
          <p style="margin: 5px 0; font-weight: 600;">Suggested Pitch:</p>
          <pre style="background: #f9fafb; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-size: 13px;">${opp.pitch}</pre>
        </div>
      </div>
    `
    )
    .join('');

  const stats = `
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px;">📊 Upsell Opportunity Stats</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #16a34a;">${highLikelihood.length}</div>
          <div style="color: #6b7280;">High Likelihood</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #2563eb;">${allOpportunities.length}</div>
          <div style="color: #6b7280;">Total Opportunities</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">$${totalValue}</div>
          <div style="color: #6b7280;">Potential Monthly Value</div>
        </div>
      </div>
    </div>
  `;

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">📈 Upsell Agent Report</h1>
      <p><strong>Date:</strong> ${formatInTimeZone(new Date(), DEFAULT_TZ, 'yyyy-MM-dd HH:mm')}</p>
      <p><strong>Clients Analyzed:</strong> ${clients.length}</p>
      
      ${stats}
      
      <h2 style="color: #1e40af; margin-top: 30px;">🎯 Upsell Opportunities</h2>
      ${opportunitiesHtml || '<p>No upsell opportunities found.</p>'}
      
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Tip:</strong> Focus on high-likelihood opportunities first. They have the best chance of success!</p>
      </div>
    </div>
  `;

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `📈 Upsell Agent — ${allOpportunities.length} Opportunities, $${totalValue}/month Potential`,
    html,
  });

  if (result.ok) {
    console.log(`✅ Upsell report sent: ${allOpportunities.length} opportunities, $${totalValue}/month potential`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runUpsell().catch(console.error);
}

