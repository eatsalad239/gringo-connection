/**
 * Colombian Business Email Campaign
 * Sends personalized emails to high-priority businesses using Resend API
 * Rotates through multiple @gringoconnection.com email addresses
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { mail, llm } from './providers.js';
import { getEmailCampaignTargets } from './colombian-business-scraper.js';

interface EmailAccount {
  email: string;
  name: string;
  daily_limit: number;
  sent_today: number;
  last_sent: string;
}

interface CampaignEmail {
  business: any;
  subject: string;
  html: string;
  from_email: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
}

// Email accounts for rotation (add more as needed)
const EMAIL_ACCOUNTS: EmailAccount[] = [
  { email: 'info@gringoconnection.com', name: 'Gringo Connection', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'business@gringoconnection.com', name: 'Business Development', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'partners@gringoconnection.com', name: 'Partnership Team', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'solutions@gringoconnection.com', name: 'Solutions Team', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'growth@gringoconnection.com', name: 'Growth Team', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'tech@gringoconnection.com', name: 'Tech Solutions', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'automation@gringoconnection.com', name: 'Automation Experts', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'digital@gringoconnection.com', name: 'Digital Transformation', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'consulting@gringoconnection.com', name: 'Consulting Services', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'innovation@gringoconnection.com', name: 'Innovation Lab', daily_limit: 500, sent_today: 0, last_sent: '' },
];

const CAMPAIGN_DATA_FILE = join(process.cwd(), 'data', 'email_campaign.json');

// Load campaign data
function loadCampaignData(): CampaignEmail[] {
  try {
    const data = readFileSync(CAMPAIGN_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Save campaign data
function saveCampaignData(data: CampaignEmail[]): void {
  require('fs').writeFileSync(CAMPAIGN_DATA_FILE, JSON.stringify(data, null, 2));
}

// Get next available email account
function getNextEmailAccount(): EmailAccount | null {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Reset daily counts if it's a new day
  EMAIL_ACCOUNTS.forEach(account => {
    if (account.last_sent !== now) {
      account.sent_today = 0;
      account.last_sent = now;
    }
  });

  // Find account with available quota
  const availableAccount = EMAIL_ACCOUNTS.find(account =>
    account.sent_today < account.daily_limit
  );

  return availableAccount || null;
}

// Generate personalized email content
async function generatePersonalizedEmail(business: any): Promise<{ subject: string; html: string }> {
  const industryProfile = getIndustryProfile(business.industry);

  const prompt = `Create a personalized email outreach for a Colombian business. Be extremely compelling and address their specific pain points.

Business Details:
- Name: ${business.name}
- Industry: ${business.industry}
- City: ${business.city}
- Revenue Estimate: ${business.revenue_estimate}
- Owner Occupied: ${business.owner_occupied}
- Pain Points: ${business.pain_points?.join(', ')}
- Services That Would Help: ${business.services_needed?.join(', ')}

Industry Context for ${business.industry}:
- Common Pain Points: ${industryProfile?.pain_points?.join(', ')}
- Typical Services Needed: ${industryProfile?.services?.join(', ')}

Create an email that:
1. Has a compelling subject line (50 chars max)
2. Personalizes to their business and industry
3. Addresses 2-3 specific pain points
4. Offers tailored solutions (website, AI automation, etc.)
5. Creates urgency for a consultation
6. Professional but friendly tone
7. Calls to action for meeting/phone call

Output JSON:
{
  "subject": "Compelling subject line",
  "html": "Full HTML email content with professional styling"
}`;

  const result = await llm.text(prompt, {
    maxTokens: 1500,
    temperature: 0.7,
    system: 'You are a Colombian business development expert. Create compelling, personalized outreach emails.'
  });

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.subject && parsed.html) {
          return {
            subject: parsed.subject,
            html: enhanceEmailHTML(parsed.html, business)
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse email generation response:', e);
    }
  }

  // Fallback email
  return generateFallbackEmail(business);
}

// Get industry profile helper
function getIndustryProfile(industry: string) {
  const profiles = {
    'restaurantes': {
      pain_points: ['pedidos en línea', 'reseñas de clientes', 'menú digital', 'programas de fidelidad'],
      services: ['sitio web', 'sistema de pedidos online', 'gestión de redes sociales', 'app para clientes']
    },
    'clinicas': {
      pain_points: ['gestión de pacientes', 'agendamiento', 'historias clínicas', 'facturación'],
      services: ['portal de pacientes', 'sistema de citas', 'plataforma de telemedicina', 'automatización de facturación']
    },
    'abogados': {
      pain_points: ['gestión de casos', 'comunicación con clientes', 'automatización de documentos', 'facturación'],
      services: ['sistema de gestión legal', 'portal de clientes', 'automatización documental', 'sistema de facturación']
    },
    'contadores': {
      pain_points: ['cumplimiento tributario', 'contabilidad de clientes', 'reportes financieros', 'preparación de auditorías'],
      services: ['software contable', 'automatización tributaria', 'portal de clientes', 'dashboard financiero']
    }
  };

  return profiles[industry.toLowerCase()] || profiles['restaurantes'];
}

// Enhance email HTML with professional styling
function enhanceEmailHTML(content: string, business: any): string {
  const baseHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: white; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .services { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .cta-button:hover { background: #1d4ed8; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #1e40af; margin-top: 30px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Transforme su Negocio en ${business.city}</h1>
    <p>Soluciones Digitales Personalizadas para ${business.name}</p>
  </div>

  <div class="content">
    ${content}

    <div class="highlight">
      <h3>🎯 ¿Por qué elegir Gringo Connection?</h3>
      <ul>
        <li><strong>Expertos en Mercado Colombiano:</strong> Entendemos los desafíos únicos de los negocios en Colombia</li>
        <li><strong>Soluciones Personalizadas:</strong> Cada implementación se adapta a sus necesidades específicas</li>
        <li><strong>Resultados Comprobados:</strong> Más de 200+ negocios transformados digitalmente</li>
        <li><strong>Soporte Local:</strong> Equipo en Medellín para atención personalizada</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://wa.me/573001234567?text=Hola,%20vi%20su%20email%20sobre%20soluciones%20digitales%20para%20${encodeURIComponent(business.name)}" class="cta-button">
        📞 Agendar Consulta Gratuita
      </a>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p>O contáctenos directamente:</p>
      <p><strong>WhatsApp:</strong> +57 300 123 4567<br>
      <strong>Email:</strong> info@gringoconnection.com<br>
      <strong>Sitio Web:</strong> gringoconnection.com</p>
    </div>
  </div>

  <div class="footer">
    <p><strong>Gringo Connection</strong> - Transformamos negocios colombianos con tecnología de vanguardia</p>
    <p>🏢 Medellín, Colombia | 📧 info@gringoconnection.com | 🌐 gringoconnection.com</p>
    <p style="font-size: 12px; margin-top: 10px;">
      Este email fue enviado específicamente para ${business.name} basado en su perfil de negocio.
      Si no desea recibir más comunicaciones, puede darse de baja respondiendo con "BAJA".
    </p>
  </div>
</body>
</html>`;

  return baseHTML;
}

// Fallback email generation
function generateFallbackEmail(business: any): { subject: string; html: string } {
  const subject = `Transforme ${business.name} con Tecnología Digital`;

  const html = `
    <p>Estimado propietario de ${business.name},</p>

    <p>Mi nombre es Daniel y soy especialista en transformación digital para negocios colombianos como el suyo en ${business.city}.</p>

    <p>Observo que ${business.name} es un ${business.industry} establecido y creo que hay oportunidades significativas para mejorar su presencia digital y operaciones mediante:</p>

    <div class="services">
      <h3>💡 Soluciones que podrían beneficiar ${business.name}:</h3>
      <ul>
        ${business.services_needed?.slice(0, 3).map(service => `<li>${service}</li>`).join('') || '<li>Sitio web profesional</li><li>Automatización de procesos</li><li>Gestión de redes sociales</li>'}
      </ul>
    </div>

    <p>Trabajamos con ${business.industry} de todos los tamaños en Colombia, ayudándoles a competir mejor en el mercado digital.</p>

    <p>¿Le gustaría una consulta gratuita de 30 minutos para explorar cómo podemos ayudar específicamente a ${business.name}?</p>
  `;

  return { subject, html: enhanceEmailHTML(html, business) };
}

// Send email campaign
export async function runEmailCampaign(batchSize: number = 50): Promise<void> {
  console.log('🚀 Starting Colombian business email campaign...');

  const targets = getEmailCampaignTargets();
  const campaignData = loadCampaignData();

  // Filter out already contacted businesses
  const contactedIds = new Set(campaignData.map(c => c.business.id));
  const newTargets = targets.filter(biz => !contactedIds.has(biz.id));

  console.log(`📊 Found ${newTargets.length} new high-priority targets`);

  if (newTargets.length === 0) {
    console.log('✅ All high-priority targets have been contacted');
    return;
  }

  let sentCount = 0;
  let accountIndex = 0;

  for (const business of newTargets) {
    if (sentCount >= batchSize) break;

    // Get next available email account
    const emailAccount = getNextEmailAccount();
    if (!emailAccount) {
      console.log('⚠️  All email accounts have reached daily limits');
      break;
    }

    try {
      console.log(`📧 Generating email for ${business.name} (${business.city})`);

      // Generate personalized email
      const emailContent = await generatePersonalizedEmail(business);

      // Send email
      const result = await mail.send({
        to: business.email || `info@${business.website?.replace('https://www.', '').replace('https://', '').replace('http://www.', '').replace('http://', '')}` || `${business.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        subject: emailContent.subject,
        html: emailContent.html,
        from: `${emailAccount.name} <${emailAccount.email}>`
      });

      if (result.ok) {
        console.log(`✅ Sent to ${business.name} via ${emailAccount.email}`);

        // Record successful send
        campaignData.push({
          business,
          subject: emailContent.subject,
          html: emailContent.html,
          from_email: emailAccount.email,
          sent_at: new Date().toISOString(),
          status: 'sent'
        });

        emailAccount.sent_today++;
        sentCount++;

        // Save progress every 10 emails
        if (sentCount % 10 === 0) {
          saveCampaignData(campaignData);
          console.log(`💾 Progress saved: ${sentCount} emails sent`);
        }

      } else {
        console.warn(`❌ Failed to send to ${business.name}: ${result.reason}`);

        // Record failed send
        campaignData.push({
          business,
          subject: emailContent.subject,
          html: emailContent.html,
          from_email: emailAccount.email,
          status: 'failed'
        });
      }

    } catch (e) {
      console.error(`💥 Error processing ${business.name}:`, e);
    }

    // Rate limiting (1 email per second max)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  saveCampaignData(campaignData);
  console.log(`🎯 Campaign complete: ${sentCount} emails sent in this batch`);

  // Show summary
  const sentToday = campaignData.filter(c => c.status === 'sent' && c.sent_at?.startsWith(new Date().toISOString().split('T')[0])).length;
  const totalSent = campaignData.filter(c => c.status === 'sent').length;
  const failed = campaignData.filter(c => c.status === 'failed').length;

  console.log(`📈 Today's Summary: ${sentToday} sent, ${failed} failed`);
  console.log(`📊 Total Campaign: ${totalSent} sent, ${failed} failed`);
}

// Get campaign statistics
export function getCampaignStats(): any {
  const campaignData = loadCampaignData();

  const today = new Date().toISOString().split('T')[0];
  const todaySends = campaignData.filter(c => c.sent_at?.startsWith(today) && c.status === 'sent');

  return {
    total_sent: campaignData.filter(c => c.status === 'sent').length,
    total_failed: campaignData.filter(c => c.status === 'failed').length,
    sent_today: todaySends.length,
    pending: campaignData.filter(c => c.status === 'pending').length,
    accounts_used: [...new Set(campaignData.map(c => c.from_email))].length,
    top_industries: getTopIndustries(campaignData.filter(c => c.status === 'sent'))
  };
}

function getTopIndustries(sentEmails: CampaignEmail[]): string[] {
  const industryCount: Record<string, number> = {};

  sentEmails.forEach(email => {
    const industry = email.business.industry;
    industryCount[industry] = (industryCount[industry] || 0) + 1;
  });

  return Object.entries(industryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([industry]) => industry);
}

// Run campaign if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const batchSize = parseInt(process.argv[2] || '50');
  runEmailCampaign(batchSize).catch(console.error);
}