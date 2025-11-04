/**
 * Lead Qualification Agent - Runs every 2 hours
 * Scores leads 0-100, prioritizes HOT leads, suggests best service fit
 * Uses local LLM (Ollama) for scoring
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { mail, llm } from '../providers.js';
import { crm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const SERVICES_PATH = join(CONTENT_DIR, 'services.json');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  createdAt: string;
  tags?: string[];
}

interface ScoredLead extends Lead {
  score: number;
  serviceFit: string[];
  reasoning: string;
  urgency: 'high' | 'medium' | 'low';
  suggestedPitch: string;
}

// Fetch leads from CRM (GoHighLevel)
async function fetchLeads(): Promise<Lead[]> {
  if (!process.env.GHL_API_KEY) {
    console.warn('GHL_API_KEY not set, using mock leads');
    return [];
  }

  try {
    // GHL API call to get recent leads
    const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      },
    });

    if (!res.ok) {
      console.warn('GHL API error:', await res.text());
      return [];
    }

    const data = await res.json();
    return (data.contacts || []).map((c: any) => ({
      id: c.id,
      name: c.name || 'Unknown',
      email: c.email || '',
      phone: c.phone || '',
      message: c.notes?.[0]?.body || c.message || '',
      source: c.source || 'unknown',
      createdAt: c.dateAdded || new Date().toISOString(),
      tags: c.tags || [],
    }));
  } catch (e) {
    console.warn('Failed to fetch leads:', e);
    return [];
  }
}

// Score a lead using local LLM
async function scoreLead(lead: Lead, services: any[]): Promise<ScoredLead> {
  const servicesList = services.map((s: any) => `${s.name_en} (${s.id})`).join(', ');

  const prompt = `Score this lead from 0-100 and suggest best service fit:

Lead:
- Name: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone || 'N/A'}
- Message: ${lead.message || 'No message'}
- Source: ${lead.source || 'unknown'}
- Created: ${lead.createdAt}

Available Services: ${servicesList}

Consider:
1. Budget indicators (keywords like "budget", "$", "investment", "afford")
2. Urgency (keywords like "urgent", "asap", "need now", "deadline")
3. Service fit (which services match their needs)
4. Vertical match (law, clinics, restaurants, education, startups, real estate, accounting)
5. Lead quality (professional email, clear message, contact info)

Output JSON:
{
  "score": 0-100,
  "serviceFit": ["service-id1", "service-id2"],
  "reasoning": "Brief explanation",
  "urgency": "high|medium|low",
  "suggestedPitch": "Personalized pitch opening"
}`;

    // Use local LLM if enabled, otherwise use default provider
    const useLocal = process.env.LOCAL_LLM === 'true';
    const result = await llm.text(prompt, {
      maxTokens: 500,
      model: useLocal ? (process.env.OLLAMA_MODEL_FAST || 'phi3:mini') : undefined, // Default to lightweight model
      system: 'You are a lead qualification expert. Output only valid JSON.',
    });

  let scored: Partial<ScoredLead> = {
    score: 50,
    serviceFit: [],
    reasoning: 'Unable to analyze',
    urgency: 'medium',
    suggestedPitch: `Hi ${lead.name}, thanks for reaching out!`,
  };

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        scored = {
          score: Math.min(100, Math.max(0, parsed.score || 50)),
          serviceFit: parsed.serviceFit || [],
          reasoning: parsed.reasoning || 'No reasoning provided',
          urgency: parsed.urgency || 'medium',
          suggestedPitch: parsed.suggestedPitch || scored.suggestedPitch,
        };
      }
    } catch (e) {
      console.warn('Failed to parse LLM response:', e);
    }
  }

  return {
    ...lead,
    ...scored,
  } as ScoredLead;
}

// Generate service recommendations
function generateServiceRecommendations(lead: ScoredLead, services: any[]): string {
  const matchedServices = lead.serviceFit
    .map((id) => services.find((s: any) => s.id === id))
    .filter(Boolean);

  if (matchedServices.length === 0) {
    return 'General consultation - assess needs';
  }

  return matchedServices
    .map((s: any) => `**${s.name_en}** - ${s.capabilities_en?.[0] || 'Full service package'}`)
    .join('\n');
}

export async function runLeadQualification(): Promise<void> {
  console.log('💎 Running lead qualification agent...');

  const services = JSON.parse(readFileSync(SERVICES_PATH, 'utf-8')).services || [];
  const leads = await fetchLeads();

  if (leads.length === 0) {
    console.log('No leads to qualify');
    return;
  }

  console.log(`Scoring ${leads.length} leads...`);

  // Score all leads
  const scoredLeads = await Promise.all(leads.map((lead) => scoreLead(lead, services)));

  // Sort by score (highest first)
  scoredLeads.sort((a, b) => b.score - a.score);

  // Categorize
  const hotLeads = scoredLeads.filter((l) => l.score >= 80);
  const warmLeads = scoredLeads.filter((l) => l.score >= 60 && l.score < 80);
  const coldLeads = scoredLeads.filter((l) => l.score < 60);

  // Generate email report
  const hotSection = hotLeads
    .map(
      (lead) => `
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px; color: #dc2626;">🔥 HOT LEAD - Score: ${lead.score}/100</h3>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ''}
        <p><strong>Urgency:</strong> ${lead.urgency.toUpperCase()}</p>
        <p><strong>Reasoning:</strong> ${lead.reasoning}</p>
        <p><strong>Best Services:</strong></p>
        <pre style="background: white; padding: 10px; border-radius: 4px;">${generateServiceRecommendations(lead, services)}</pre>
        <p><strong>Suggested Pitch:</strong></p>
        <blockquote style="background: white; padding: 10px; border-left: 3px solid #dc2626; margin: 10px 0;">
          ${lead.suggestedPitch}
        </blockquote>
        ${lead.message ? `<p><strong>Original Message:</strong> ${lead.message}</p>` : ''}
      </div>
    `
    )
    .join('');

  const warmSection = warmLeads
    .map(
      (lead) => `
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px;">Warm Lead - Score: ${lead.score}/100</h4>
        <p><strong>${lead.name}</strong> (${lead.email})</p>
        <p><strong>Services:</strong> ${lead.serviceFit.join(', ') || 'General'}</p>
        <p><strong>Reasoning:</strong> ${lead.reasoning}</p>
      </div>
    `
    )
    .join('');

  const stats = `
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px;">📊 Lead Qualification Stats</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${hotLeads.length}</div>
          <div style="color: #6b7280;">HOT Leads (80+)</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${warmLeads.length}</div>
          <div style="color: #6b7280;">Warm Leads (60-79)</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #6b7280;">${coldLeads.length}</div>
          <div style="color: #6b7280;">Cold Leads (<60)</div>
        </div>
      </div>
    </div>
  `;

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">💎 Lead Qualification Report</h1>
      <p><strong>Date:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm', { timeZone: DEFAULT_TZ })}</p>
      <p><strong>Total Leads Analyzed:</strong> ${scoredLeads.length}</p>
      
      ${stats}
      
      ${hotLeads.length > 0 ? `<h2 style="color: #dc2626; margin-top: 30px;">🔥 HOT LEADS - Contact Immediately</h2>${hotSection}` : ''}
      
      ${warmLeads.length > 0 ? `<h2 style="color: #f59e0b; margin-top: 30px;">Warm Leads - Follow Up This Week</h2>${warmSection}` : ''}
      
      ${coldLeads.length > 0 ? `<p style="color: #6b7280; margin-top: 20px;"><strong>Cold Leads:</strong> ${coldLeads.length} leads scored below 60. Consider nurturing sequence.</p>` : ''}
      
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Tip:</strong> HOT leads should be contacted within 1 hour. Warm leads within 24 hours.</p>
      </div>
    </div>
  `;

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `💎 Lead Qualification — ${hotLeads.length} HOT Leads, ${warmLeads.length} Warm`,
    html,
  });

  if (result.ok) {
    console.log(`✅ Lead qualification report sent: ${hotLeads.length} HOT, ${warmLeads.length} warm`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runLeadQualification().catch(console.error);
}

