/**
 * Proposal Generator Agent - Creative Revenue Agent
 * Generates professional, personalized proposals in seconds
 * Uses local LLM for creative, persuasive proposals
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
  company?: string;
  source?: string;
  tags?: string[];
}

interface Service {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  price?: { min: number; max: number; currency: string };
  duration?: string;
  deliverables?: string[];
}

interface Proposal {
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadCompany?: string;
  language: 'en' | 'es';
  services: string[];
  totalPrice: number;
  currency: string;
  timeline: string;
  deliverables: string[];
  proposalText: string;
  pricingBreakdown: Array<{ service: string; price: number; description: string }>;
  suggestedDiscount?: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}

// Load services
function loadServices(): Service[] {
  try {
    const content = readFileSync(SERVICES_PATH, 'utf-8');
    return JSON.parse(content).services || [];
  } catch {
    return [];
  }
}

// Generate proposal using LLM
async function generateProposal(
  lead: Lead,
  services: Service[],
  language: 'en' | 'es' = 'en'
): Promise<Proposal> {
  const selectedServices = services.filter((s) =>
    lead.tags?.some((tag) => s.id.toLowerCase().includes(tag.toLowerCase()))
  ) || services.slice(0, 2); // Default to first 2 services

  const serviceNames = selectedServices.map((s) => s.name[language]).join(', ');
  const leadContext = `
Lead: ${lead.name}${lead.company ? ` from ${lead.company}` : ''}
Email: ${lead.email}
Message: ${lead.message || 'No message provided'}
Tags: ${lead.tags?.join(', ') || 'None'}
`;

  const prompt = language === 'es'
    ? `Eres un experto en generación de propuestas comerciales profesionales y persuasivas para servicios de marketing digital y tecnología.

Genera una propuesta profesional para:
${leadContext}

Servicios a incluir: ${serviceNames}

La propuesta debe incluir:
1. Saludo personalizado y profesional
2. Comprensión de sus necesidades basada en su mensaje
3. Descripción de los servicios propuestos (creativa y convincente)
4. Desglose de precios detallado
5. Timeline realista pero optimista
6. Entregables específicos y medibles
7. Valor único que ofrecemos
8. Llamado a la acción claro

Genera una propuesta completa en español colombiano, profesional pero cercana, que demuestre que entendimos sus necesidades y que tenemos la solución perfecta.

Formato JSON:
{
  "proposalText": "Texto completo de la propuesta (2-3 párrafos)",
  "pricingBreakdown": [{"service": "nombre", "price": número, "description": "descripción"}],
  "totalPrice": número_total,
  "currency": "USD",
  "timeline": "descripción del timeline",
  "deliverables": ["entregable1", "entregable2"],
  "suggestedDiscount": número_porcentaje_opcional,
  "urgencyLevel": "low|medium|high"
}`
    : `You are an expert at generating professional, persuasive business proposals for digital marketing and technology services.

Generate a professional proposal for:
${leadContext}

Services to include: ${serviceNames}

The proposal must include:
1. Personalized, professional greeting
2. Understanding of their needs based on their message
3. Description of proposed services (creative and compelling)
4. Detailed pricing breakdown
5. Realistic but optimistic timeline
6. Specific, measurable deliverables
7. Unique value we offer
8. Clear call to action

Generate a complete proposal in professional English that shows we understand their needs and have the perfect solution.

JSON format:
{
  "proposalText": "Full proposal text (2-3 paragraphs)",
  "pricingBreakdown": [{"service": "name", "price": number, "description": "description"}],
  "totalPrice": total_number,
  "currency": "USD",
  "timeline": "timeline description",
  "deliverables": ["deliverable1", "deliverable2"],
  "suggestedDiscount": optional_percentage,
  "urgencyLevel": "low|medium|high"
}`;

  try {
    const result = await llm.text(prompt, {
      model: process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini',
      temperature: 0.7, // Creative but professional
      maxTokens: 2000,
    });

    if (!result.ok || !result.text) {
      throw new Error(result.reason || 'Failed to generate proposal');
    }

    const response = result.text;

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        leadId: lead.id,
        leadName: lead.name,
        leadEmail: lead.email,
        leadCompany: lead.company,
        language,
        services: selectedServices.map((s) => s.id),
        totalPrice: parsed.totalPrice || selectedServices.reduce((sum, s) => sum + (s.price?.min || 500), 0),
        currency: parsed.currency || 'USD',
        timeline: parsed.timeline || '4-6 weeks',
        deliverables: parsed.deliverables || selectedServices.flatMap((s) => s.deliverables || []),
        proposalText: parsed.proposalText || '',
        pricingBreakdown: parsed.pricingBreakdown || [],
        suggestedDiscount: parsed.suggestedDiscount,
        urgencyLevel: parsed.urgencyLevel || 'medium',
      };
    }

    // Fallback if JSON parsing fails
    return {
      leadId: lead.id,
      leadName: lead.name,
      leadEmail: lead.email,
      leadCompany: lead.company,
      language,
      services: selectedServices.map((s) => s.id),
      totalPrice: selectedServices.reduce((sum, s) => sum + (s.price?.min || 500), 0),
      currency: 'USD',
      timeline: '4-6 weeks',
      deliverables: selectedServices.flatMap((s) => s.deliverables || []),
      proposalText: response,
      pricingBreakdown: selectedServices.map((s) => ({
        service: s.name[language],
        price: s.price?.min || 500,
        description: s.description[language],
      })),
      urgencyLevel: 'medium',
    };
  } catch (error) {
    console.error('Error generating proposal:', error);
    throw error;
  }
}

// Format proposal as email
function formatProposalEmail(proposal: Proposal): string {
  const isEs = proposal.language === 'es';
  const discountNote = proposal.suggestedDiscount
    ? `<p style="color: #059669; font-weight: bold; margin-top: 15px;">
       ${isEs ? '💡 Descuento sugerido' : '💡 Suggested Discount'}: ${proposal.suggestedDiscount}% ${isEs ? 'para cierre rápido' : 'for quick close'}
     </p>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 800px; margin: 0 auto; padding: 30px; }
    h1 { color: #1e40af; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    .proposal { background: #f9fafb; padding: 25px; border-radius: 8px; margin: 20px 0; }
    .pricing { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .total { font-size: 24px; font-weight: bold; color: #059669; margin-top: 15px; }
    .cta { background: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; text-align: center; margin: 30px 0; }
    .cta a { color: white; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${isEs ? '💼 Propuesta Comercial' : '💼 Business Proposal'}</h1>
    
    <p><strong>${isEs ? 'Para' : 'For'}:</strong> ${proposal.leadName}${proposal.leadCompany ? ` (${proposal.leadCompany})` : ''}</p>
    <p><strong>${isEs ? 'Fecha' : 'Date'}:</strong> ${format(new Date(), 'PPP', { timeZone: DEFAULT_TZ })}</p>

    <div class="proposal">
      ${proposal.proposalText.split('\n').map((p) => `<p>${p}</p>`).join('')}
    </div>

    <div class="pricing">
      <h3>${isEs ? '💰 Desglose de Precios' : '💰 Pricing Breakdown'}</h3>
      ${proposal.pricingBreakdown.map((item) => `
        <div class="item">
          <div>
            <strong>${item.service}</strong><br>
            <small>${item.description}</small>
          </div>
          <div style="font-weight: bold;">${proposal.currency} $${item.price.toLocaleString()}</div>
        </div>
      `).join('')}
      ${discountNote}
      <div class="total">
        ${isEs ? 'Total' : 'Total'}: ${proposal.currency} $${proposal.totalPrice.toLocaleString()}
      </div>
    </div>

    <div>
      <h3>${isEs ? '📅 Timeline' : '📅 Timeline'}</h3>
      <p>${proposal.timeline}</p>
    </div>

    <div>
      <h3>${isEs ? '✅ Entregables' : '✅ Deliverables'}</h3>
      <ul>
        ${proposal.deliverables.map((d) => `<li>${d}</li>`).join('')}
      </ul>
    </div>

    <div class="cta">
      <a href="mailto:${proposal.leadEmail}?subject=${encodeURIComponent(isEs ? 'Propuesta Comercial - Gringo Connection' : 'Business Proposal - Gringo Connection')}">
        ${isEs ? '📧 Enviar Propuesta' : '📧 Send Proposal'}
      </a>
    </div>
  </div>
</body>
</html>
  `;
}

// Main function
export async function generateProposalForLead(leadId: string, language: 'en' | 'es' = 'en'): Promise<Proposal | null> {
  try {
    // Fetch lead from CRM (mock for now - would integrate with actual CRM)
    const lead: Lead = {
      id: leadId,
      name: 'Sample Lead',
      email: 'lead@example.com',
      message: 'I need help with digital marketing',
      tags: ['marketing', 'social-media'],
    };

    const services = loadServices();
    if (services.length === 0) {
      console.warn('No services found');
      return null;
    }

    const proposal = await generateProposal(lead, services, language);
    
    // Email proposal to team
    const emailHtml = formatProposalEmail(proposal);
    await mail.send({
      to: EOD_TO.split(',').map((e) => e.trim()),
      subject: `💼 ${language === 'es' ? 'Nueva Propuesta Generada' : 'New Proposal Generated'} - ${proposal.leadName}`,
      html: emailHtml,
    });

    console.log(`✅ Proposal generated for ${proposal.leadName}`);
    return proposal;
  } catch (error) {
    console.error('Error generating proposal:', error);
    return null;
  }
}

// Run on-demand
if (require.main === module) {
  const leadId = process.argv[2] || 'sample-lead';
  const language = (process.argv[3] as 'en' | 'es') || 'en';
  generateProposalForLead(leadId, language)
    .then((proposal) => {
      if (proposal) {
        console.log('✅ Proposal generated successfully!');
        process.exit(0);
      } else {
        console.error('❌ Failed to generate proposal');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

