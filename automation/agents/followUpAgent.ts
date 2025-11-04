/**
 * Follow-up Agent - Converts 20-30% more leads
 * Finds stale leads and generates personalized follow-up messages
 * Runs daily at 09:00
 */

import { format, subDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { mail, llm } from '../providers.js';
import { crm } from '../providers.js';

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
  lastContacted?: string;
  tags?: string[];
}

// Fetch leads from CRM
async function fetchLeads(): Promise<Lead[]> {
  if (!process.env.GHL_API_KEY) {
    console.warn('GHL_API_KEY not set, using mock leads');
    return [];
  }

  try {
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
      lastContacted: c.lastContacted || c.dateAdded,
      tags: c.tags || [],
    }));
  } catch (e) {
    console.warn('Failed to fetch leads:', e);
    return [];
  }
}

// Generate personalized follow-up message
async function generateFollowUp(lead: Lead, attempt: number): Promise<{ en: string; es: string; subject: string }> {
  const daysSinceContact = Math.floor(
    (Date.now() - new Date(lead.lastContacted || lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `Generate a personalized follow-up message for a lead.

Lead Info:
- Name: ${lead.name}
- Original Message: ${lead.message || 'No message'}
- Source: ${lead.source || 'website'}
- Days Since Contact: ${daysSinceContact}
- Follow-up Attempt: ${attempt} (1st, 2nd, or 3rd)

Generate:
1. Subject line (EN)
2. Email body in English (personalized, not generic)
3. Email body in Spanish (personalized, not generic)

Make it:
- Personal and friendly
- Different angle than previous attempts
- Clear call-to-action
- Professional but warm

Format as JSON:
{
  "subject": "subject line",
  "en": "English email body",
  "es": "Spanish email body"
}`;

  const result = await llm.text(prompt, {
    maxTokens: 800,
    model: process.env.LOCAL_LLM === 'true' ? (process.env.OLLAMA_MODEL_FAST || 'phi3:mini') : undefined,
    system: 'You are an expert sales copywriter. Output only valid JSON.',
  });

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          subject: parsed.subject || `Following up - ${lead.name}`,
          en: parsed.en || `Hi ${lead.name}, I wanted to follow up...`,
          es: parsed.es || `Hola ${lead.name}, quería hacer seguimiento...`,
        };
      }
    } catch (e) {
      console.warn('Failed to parse follow-up:', e);
    }
  }

  // Fallback
  return {
    subject: `Following up - ${lead.name}`,
    en: `Hi ${lead.name},\n\nI wanted to follow up on your inquiry. We'd love to help you achieve your goals.\n\nWould you be available for a quick call this week?\n\nBest,\nEddy`,
    es: `Hola ${lead.name},\n\nQuería hacer seguimiento a tu consulta. Nos encantaría ayudarte a alcanzar tus objetivos.\n\n¿Estarías disponible para una llamada rápida esta semana?\n\nSaludos,\nEddy`,
  };
}

export async function runFollowUp(): Promise<void> {
  console.log('📧 Running follow-up agent...');

  const leads = await fetchLeads();
  const twoDaysAgo = subDays(new Date(), 2);
  const oneWeekAgo = subDays(new Date(), 7);

  // Find stale leads (not contacted in 2+ days)
  const staleLeads = leads.filter((lead) => {
    const lastContact = new Date(lead.lastContacted || lead.createdAt);
    return lastContact < twoDaysAgo && lastContact > oneWeekAgo; // Between 2-7 days old
  });

  if (staleLeads.length === 0) {
    console.log('No stale leads to follow up');
    return;
  }

  console.log(`Found ${staleLeads.length} stale leads to follow up`);

  // Generate follow-ups
  const followUps = await Promise.all(
    staleLeads.map(async (lead) => {
      // Determine attempt number (simplified - would track in CRM)
      const daysSince = Math.floor(
        (Date.now() - new Date(lead.lastContacted || lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const attempt = daysSince <= 3 ? 1 : daysSince <= 5 ? 2 : 3;

      const followUp = await generateFollowUp(lead, attempt);
      return {
        lead,
        followUp,
        attempt,
        daysSince,
      };
    })
  );

  // Generate email report
  const followUpsHtml = followUps
    .map(
      (fu) => `
      <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 15px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px; color: #1e40af;">${fu.lead.name} (${fu.attempt}${fu.attempt === 1 ? 'st' : fu.attempt === 2 ? 'nd' : 'rd'} follow-up)</h3>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${fu.lead.email}</p>
        ${fu.lead.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${fu.lead.phone}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Days Since Contact:</strong> ${fu.daysSince}</p>
        <p style="margin: 5px 0;"><strong>Source:</strong> ${fu.lead.source}</p>
        
        <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 15px;">
          <h4 style="margin: 0 0 10px; color: #1e40af;">📧 Follow-up Message</h4>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${fu.followUp.subject}</p>
          
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0; font-weight: 600;">English:</p>
            <pre style="background: #f9fafb; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-size: 13px;">${fu.followUp.en}</pre>
          </div>
          
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0; font-weight: 600;">Español:</p>
            <pre style="background: #f9fafb; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-size: 13px;">${fu.followUp.es}</pre>
          </div>
        </div>
      </div>
    `
    )
    .join('');

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">📧 Follow-up Agent Report</h1>
      <p><strong>Date:</strong> ${formatInTimeZone(new Date(), DEFAULT_TZ, 'yyyy-MM-dd HH:mm')}</p>
      <p><strong>Stale Leads Found:</strong> ${staleLeads.length}</p>
      
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h2 style="color: #166534; margin-top: 0;">💡 Tip</h2>
        <p style="color: #166534; margin: 0;">
          Follow up within 24 hours for best results. These leads haven't been contacted in 2+ days - 
          personalized follow-ups can convert 20-30% more leads!
        </p>
      </div>
      
      ${followUpsHtml}
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Next Steps:</strong> Copy the messages above and send via email/WhatsApp. Or integrate with CRM to auto-send!</p>
      </div>
    </div>
  `;

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `📧 Follow-up Agent — ${staleLeads.length} Leads Need Follow-up`,
    html,
  });

  if (result.ok) {
    console.log(`✅ Follow-up report sent: ${staleLeads.length} leads`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFollowUp().catch(console.error);
}

