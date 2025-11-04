/**
 * Referral Agent - Creative Revenue Agent
 * Identifies satisfied clients and generates personalized referral requests
 * Uses creative, persuasive messaging to generate high-quality referral leads
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { subDays } from 'date-fns';
import { mail, llm } from '../providers.js';
import { crm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: 'active' | 'completed' | 'inactive';
  totalRevenue: number;
  projectsCompleted: number;
  lastContactDate?: string;
  satisfactionScore?: number; // 1-10
  tags?: string[];
}

interface ReferralRequest {
  clientId: string;
  clientName: string;
  clientEmail: string;
  language: 'en' | 'es';
  message: string;
  subject: string;
  suggestedIncentive?: string;
  urgencyLevel: 'low' | 'medium' | 'high';
}

// Mock function to get satisfied clients (would integrate with CRM)
function getSatisfiedClients(): Client[] {
  // In real implementation, query CRM for:
  // - Clients with status 'completed' or 'active'
  // - Projects completed > 0
  // - Last contact within last 90 days
  // - No referral request sent in last 30 days
  return [
    {
      id: 'client-1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      company: 'Medellín Restaurant',
      status: 'completed',
      totalRevenue: 5000,
      projectsCompleted: 2,
      lastContactDate: format(subDays(new Date(), 30), 'yyyy-MM-dd', { timeZone: DEFAULT_TZ }),
      satisfactionScore: 9,
      tags: ['restaurant', 'satisfied'],
    },
  ];
}

// Generate creative referral request using LLM
async function generateReferralRequest(
  client: Client,
  language: 'en' | 'es' = 'en'
): Promise<ReferralRequest> {
  const isEs = language === 'es';
  
  const context = `
Client: ${client.name}${client.company ? ` from ${client.company}` : ''}
Projects Completed: ${client.projectsCompleted}
Total Revenue: $${client.totalRevenue}
Satisfaction Score: ${client.satisfactionScore || 'N/A'}/10
Last Contact: ${client.lastContactDate || 'N/A'}
`;

  const prompt = isEs
    ? `Eres un experto en generar solicitudes de referidos creativas y persuasivas que no se sienten como spam.

Cliente:
${context}

Genera una solicitud de referido personalizada que:
1. Sea genuina y auténtica (no spam)
2. Reconozca el éxito del proyecto que completamos juntos
3. Mencione beneficios específicos que recibieron
4. Sea casual pero profesional
5. Ofrezca un incentivo creativo (descuento, servicio adicional, etc.)
6. Haga fácil el proceso de referir

El tono debe ser:
- Cálido y agradecido
- Enfocado en ayudar a otros (no solo en nosotros)
- Bajo presión, sin ser pushy
- Específico y personalizado

Genera:
1. Subject line (asunto creativo)
2. Message body (mensaje completo, 2-3 párrafos)
3. Suggested incentive (incentivo sugerido)
4. Urgency level (low|medium|high)

Formato JSON:
{
  "subject": "asunto creativo",
  "message": "mensaje completo",
  "suggestedIncentive": "incentivo sugerido",
  "urgencyLevel": "low|medium|high"
}`
    : `You are an expert at generating creative, persuasive referral requests that don't feel like spam.

Client:
${context}

Generate a personalized referral request that:
1. Is genuine and authentic (not spam)
2. Acknowledges the success of the project we completed together
3. Mentions specific benefits they received
4. Is casual but professional
5. Offers a creative incentive (discount, additional service, etc.)
6. Makes it easy to refer

The tone should be:
- Warm and grateful
- Focused on helping others (not just us)
- Low pressure, not pushy
- Specific and personalized

Generate:
1. Subject line (creative subject)
2. Message body (complete message, 2-3 paragraphs)
3. Suggested incentive (suggested incentive)
4. Urgency level (low|medium|high)

JSON format:
{
  "subject": "creative subject",
  "message": "complete message",
  "suggestedIncentive": "suggested incentive",
  "urgencyLevel": "low|medium|high"
}`;

  try {
    const result = await llm.text(prompt, {
      model: process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini',
      temperature: 0.8, // Creative and friendly
      maxTokens: 1500,
    });

    if (!result.ok || !result.text) {
      throw new Error(result.reason || 'Failed to generate referral request');
    }

    const response = result.text;

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        language,
        subject: parsed.subject || (isEs ? '¿Conoces a alguien que necesite ayuda?' : 'Know someone who needs help?'),
        message: parsed.message || '',
        suggestedIncentive: parsed.suggestedIncentive,
        urgencyLevel: parsed.urgencyLevel || 'low',
      };
    }

    // Fallback
    return {
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      language,
      subject: isEs ? '¿Conoces a alguien que necesite ayuda?' : 'Know someone who needs help?',
      message: response,
      suggestedIncentive: isEs ? '20% de descuento en su próximo proyecto' : '20% off their next project',
      urgencyLevel: 'low',
    };
  } catch (error) {
    console.error('Error generating referral request:', error);
    throw error;
  }
}

// Format referral request as email
function formatReferralEmail(request: ReferralRequest): string {
  const isEs = request.language === 'es';
  const incentiveNote = request.suggestedIncentive
    ? `<div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
         <strong>${isEs ? '🎁 Incentivo' : '🎁 Incentive'}:</strong> ${request.suggestedIncentive}
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 700px; margin: 0 auto; padding: 30px; }
    .message { background: #f9fafb; padding: 25px; border-radius: 8px; margin: 20px 0; }
    .cta { background: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; text-align: center; margin: 30px 0; }
    .cta a { color: white; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h2>${isEs ? '📧 Solicitud de Referido' : '📧 Referral Request'}</h2>
    
    <p><strong>${isEs ? 'Para' : 'For'}:</strong> ${request.clientName}</p>
    <p><strong>${isEs ? 'Asunto' : 'Subject'}:</strong> ${request.subject}</p>

    <div class="message">
      ${request.message.split('\n').map((p) => `<p>${p}</p>`).join('')}
    </div>

    ${incentiveNote}

    <div class="cta">
      <a href="mailto:${request.clientEmail}?subject=${encodeURIComponent(request.subject)}">
        ${isEs ? '📧 Enviar Solicitud' : '📧 Send Request'}
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      ${isEs 
        ? '💡 Tip: Personaliza el mensaje antes de enviar para mayor efectividad.'
        : '💡 Tip: Personalize the message before sending for better results.'}
    </p>
  </div>
</body>
</html>
  `;
}

// Main function
export async function runReferralAgent(): Promise<void> {
  console.log('🤝 Running Referral Agent...');

  try {
    const clients = getSatisfiedClients();
    
    if (clients.length === 0) {
      console.log('✅ No satisfied clients found for referral requests');
      return;
    }

    console.log(`Found ${clients.length} satisfied clients`);

    const requests: ReferralRequest[] = [];
    
    for (const client of clients) {
      // Generate bilingual requests
      const enRequest = await generateReferralRequest(client, 'en');
      const esRequest = await generateReferralRequest(client, 'es');
      
      requests.push(enRequest, esRequest);
    }

    // Email summary to team
    const summaryHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 900px; margin: 0 auto; padding: 30px; }
    h1 { color: #1e40af; }
    .request { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤝 Referral Requests Generated</h1>
    <p>Generated <strong>${requests.length}</strong> referral requests for <strong>${clients.length}</strong> satisfied clients.</p>
    
    ${requests.map((req, i) => `
      <div class="request">
        <h3>${i + 1}. ${req.clientName} (${req.language.toUpperCase()})</h3>
        <p><strong>Subject:</strong> ${req.subject}</p>
        <p>${req.message.substring(0, 200)}...</p>
        ${req.suggestedIncentive ? `<p><strong>Incentive:</strong> ${req.suggestedIncentive}</p>` : ''}
      </div>
    `).join('')}

    <p style="margin-top: 30px; color: #6b7280;">
      💡 Review and send these referral requests to generate high-quality leads!
    </p>
  </div>
</body>
</html>
    `;

    await mail.send({
      to: EOD_TO.split(',').map((e) => e.trim()),
      subject: `🤝 ${requests.length} Referral Requests Generated`,
      html: summaryHtml,
    });

    console.log(`✅ Generated ${requests.length} referral requests`);
  } catch (error) {
    console.error('❌ Error running referral agent:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runReferralAgent()
    .then(() => {
      console.log('✅ Referral agent completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

