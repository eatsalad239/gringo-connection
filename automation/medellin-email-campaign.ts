/**
 * Medellín Business Email Campaign - Colombian Spanish
 * Sends personalized emails to Medellín businesses using Resend API
 * Rotates through multiple @gringoconnection.com email addresses
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { mail, llm } from './providers.js';
import { getMedellinEmailCampaignTargets } from './medellin-business-scraper.js';

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

// Email accounts for rotation (all @gringoconnection.com)
const EMAIL_ACCOUNTS: EmailAccount[] = [
  { email: 'info@gringoconnection.com', name: 'Gringo Connection Medellín', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'negocios@gringoconnection.com', name: 'Desarrollo de Negocios', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'soluciones@gringoconnection.com', name: 'Soluciones Empresariales', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'tecnologia@gringoconnection.com', name: 'Tecnología Empresarial', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'consultoria@gringoconnection.com', name: 'Consultoría Digital', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'automatizacion@gringoconnection.com', name: 'Automatización Inteligente', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'transformacion@gringoconnection.com', name: 'Transformación Digital', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'innovacion@gringoconnection.com', name: 'Innovación Empresarial', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'medellin@gringoconnection.com', name: 'Medellín Business Hub', daily_limit: 500, sent_today: 0, last_sent: '' },
  { email: 'crecimiento@gringoconnection.com', name: 'Crecimiento Empresarial', daily_limit: 500, sent_today: 0, last_sent: '' },
];

const CAMPAIGN_DATA_FILE = join(process.cwd(), 'data', 'medellin_email_campaign.json');

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

// Generate personalized email content in Colombian Spanish
async function generatePersonalizedEmail(business: any): Promise<{ subject: string; html: string }> {
  const industryProfile = getIndustryProfile(business.industry);

  const prompt = `Crea un email personalizado de outreach para un negocio de Medellín. Debe ser extremadamente persuasivo y dirigido específicamente a sus puntos de dolor. Todo en español colombiano natural.

Datos del negocio:
- Nombre: ${business.name}
- Industria: ${business.industry}
- Barrio: ${business.neighborhood}
- Estimación de ingresos: ${business.revenue_estimate}
- Propietario operativo: ${business.owner_occupied}
- Puntos de dolor: ${business.pain_points?.join(', ')}
- Servicios que necesita: ${business.services_needed?.join(', ')}

Perfil de industria para ${business.industry}:
- Puntos de dolor comunes: ${industryProfile?.pain_points?.join(', ')}
- Servicios típicos necesarios: ${industryProfile?.services?.join(', ')}

El email debe:
1. Asunto atractivo (máximo 60 caracteres)
2. Personalizar al negocio y barrio específico de Medellín
3. Abordar 2-3 puntos de dolor específicos
4. Ofrecer soluciones concretas (sitios web, AI, automatización, etc.)
5. Crear urgencia para una reunión
6. Llamados a acción claros
7. Tono profesional pero cercano (estilo paisa)
8. Mencionar que somos de Medellín

Output JSON:
{
  "subject": "Asunto atractivo y corto",
  "html": "Contenido completo del email HTML con estilos profesionales"
}`;

  const result = await llm.text(prompt, {
    maxTokens: 1500,
    temperature: 0.8, // Higher creativity for Colombian Spanish
    system: 'Eres un experto en desarrollo de negocios en Medellín, Colombia. Creas emails persuasivos en español colombiano natural y persuasivo.',
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
      console.warn('No se pudo analizar la respuesta de generación de email:', e);
    }
  }

  // Fallback email
  return generateFallbackEmail(business);
}

// Get industry profile helper
function getIndustryProfile(industry: string) {
  const profiles = {
    'restaurantes': {
      pain_points: ['pedidos en línea lentos', 'malas reseñas que afectan ventas', 'menús desactualizados', 'clientes que no regresan', 'competencia de delivery apps'],
      services: ['sistema de pedidos online integrado', 'gestión automática de reseñas', 'menú digital con fotos', 'programa de fidelización', 'optimización SEO local']
    },
    'clínicas': {
      pain_points: ['pacientes que faltan a citas', 'historias clínicas en papel', 'facturación lenta y errores', 'competencia de clínicas grandes', 'pacientes que no pagan'],
      services: ['sistema de recordatorios automáticos', 'historia clínica digital', 'facturación automática POS', 'app para pacientes', 'marketing de boca en boca digital']
    },
    'abogados': {
      pain_points: ['plazos que se vencen', 'documentos que se pierden', 'clientes que no pagan', 'competencia de bufetes grandes', 'gestión de casos caótica'],
      services: ['sistema de alertas de plazos', 'automatización de documentos legales', 'portal del cliente seguro', 'sistema de facturación jurídica', 'CRM legal especializado']
    },
    'contadores': {
      pain_points: ['declaraciones de renta atrasadas', 'clientes que no entregan documentos', 'multas por errores', 'competencia de firmas grandes', 'trabajo manual repetitivo'],
      services: ['software contable certificado', 'recordatorios automáticos a clientes', 'declaraciones automáticas', 'portal seguro para clientes', 'alertas de cumplimiento tributario']
    },
    'comercios': {
      pain_points: ['inventario que no cuadra', 'clientes que no regresan', 'competencia de grandes cadenas', 'ventas que no crecen', 'gestión manual de proveedores'],
      services: ['sistema de inventario automático', 'programa de fidelización digital', 'tienda online integrada', 'gestión de proveedores automática', 'marketing local dirigido']
    }
  };

  return profiles[industry.toLowerCase()] || profiles['comercios'];
}

// Enhance email HTML with professional Colombian styling
function enhanceEmailHTML(content: string, business: any): string {
  const baseHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; max-width: 600px; margin: 0 auto; padding: 20px; background: #f7fafc; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .content { background: white; border: 1px solid #e2e8f0; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .highlight { background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .services { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3); transition: all 0.3s ease; }
    .cta-button:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-2px); box-shadow: 0 6px 8px rgba(37, 99, 235, 0.4); }
    .secondary-cta { display: inline-block; background: #f1f5f9; color: #475569; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 10px 0; border: 1px solid #e2e8f0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 14px; text-align: center; background: #f8fafc; padding: 20px; border-radius: 6px; }
    h1 { margin: 0; font-size: 26px; font-weight: 700; }
    h2 { color: #1e40af; margin-top: 30px; font-size: 20px; }
    h3 { color: #2563eb; margin: 20px 0 10px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    .emoji { font-size: 1.2em; }
    .medellin-badge { background: #dc2626; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Transforme su Negocio en Medellín</h1>
    <p>Soluciones Digitales Personalizadas para ${business.name}<span class="medellin-badge">MEDELLÍN</span></p>
  </div>

  <div class="content">
    ${content}

    <div class="highlight">
      <h3>🎯 ¿Por qué elegir Gringo Connection en Medellín?</h3>
      <ul>
        <li><strong class="emoji">🏙️</strong> <strong>Expertos Locales:</strong> Equipo basado en Medellín, entendemos su mercado</li>
        <li><strong class="emoji">⚡</strong> <strong>Implementación Rápida:</strong> Resultados en semanas, no meses</li>
        <li><strong class="emoji">💰</strong> <strong>Retorno de Inversión Comprobado:</strong> Más de 150+ negocios medellinenses transformados</li>
        <li><strong class="emoji">🤝</strong> <strong>Soporte Personalizado:</strong> Atención directa con el propietario</li>
        <li><strong class="emoji">🇨🇴</strong> <strong>100% Colombiano:</strong> Adaptado a leyes y regulaciones locales</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://wa.me/573001234567?text=Hola,%20soy%20el%20dueño%20de%20${encodeURIComponent(business.name)}%20en%20${encodeURIComponent(business.neighborhood)},Medellín.%20Vi%20su%20email%20sobre%20soluciones%20digitales." class="cta-button">
        📞 ¡Hablemos! Agendar Reunión Gratuita
      </a>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p>O contáctenos directamente:</p>
      <p><strong>📱 WhatsApp:</strong> +57 300 123 4567<br>
      <strong>📧 Email:</strong> info@gringoconnection.com<br>
      <strong>🌐 Web:</strong> gringoconnection.com<br>
      <strong>📍 Ubicación:</strong> Medellín, Colombia</p>
    </div>

    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3 style="margin: 0 0 10px 0; color: #1e40af;">⏰ Oferta Limitada</h3>
      <p style="margin: 0; color: #3730a3;"><strong>Primeros 50 negocios de ${business.neighborhood}:</strong> 30% descuento en implementación</p>
    </div>
  </div>

  <div class="footer">
    <p><strong>Gringo Connection</strong> - Transformamos negocios medellinenses con tecnología de vanguardia</p>
    <p>🏙️ <strong>Medellín, Colombia</strong> | 📧 info@gringoconnection.com | 🌐 gringoconnection.com</p>
    <p style="font-size: 12px; margin-top: 10px;">
      Este email fue enviado específicamente para ${business.name} en ${business.neighborhood}, Medellín basado en su perfil empresarial.
      Si no desea recibir más comunicaciones, responda con "NO QUIERO" y será removido inmediatamente.
    </p>
  </div>
</body>
</html>`;

  return baseHTML;
}

// Fallback email generation
function generateFallbackEmail(business: any): { subject: string; html: string } {
  const subject = `Transforme ${business.name} en Medellín`;

  const html = `
    <p>Estimado propietario de ${business.name},</p>

    <p>Mi nombre es Daniel y soy especialista en transformación digital para negocios en Medellín como el suyo en ${business.neighborhood}.</p>

    <p>Observo que ${business.name} es un ${business.industry} establecido en uno de los barrios más dinámicos de Medellín y creo que hay oportunidades increíbles para mejorar su presencia digital y operaciones mediante:</p>

    <div class="services">
      <h3>💡 Soluciones que podrían beneficiar ${business.name}:</h3>
      <ul>
        ${business.services_needed?.slice(0, 3).map(service => `<li>${service}</li>`).join('') || '<li>Sitio web profesional con dominio .co</li><li>Automatización de procesos administrativos</li><li>Gestión de clientes y ventas online</li>'}
      </ul>
    </div>

    <p>Trabajamos con ${business.industry} de todos los tamaños en Medellín, ayudándoles a competir mejor en el mercado digital local y nacional.</p>

    <p>¿Le gustaría una reunión gratuita de 45 minutos para explorar cómo podemos ayudar específicamente a ${business.name} a crecer en Medellín?</p>

    <p>Tenemos una oferta especial para negocios de ${business.neighborhood} este mes.</p>
  `;

  return { subject, html: enhanceEmailHTML(html, business) };
}

// Send email campaign
export async function runMedellinEmailCampaign(batchSize: number = 50): Promise<void> {
  console.log('🚀 Iniciando campaña de email para negocios de Medellín...');

  const targets = getMedellinEmailCampaignTargets();
  const campaignData = loadCampaignData();

  // Filter out already contacted businesses
  const contactedIds = new Set(campaignData.map(c => c.business.id));
  const newTargets = targets.filter(biz => !contactedIds.has(biz.id));

  console.log(`📊 Encontrados ${newTargets.length} nuevos objetivos de alta prioridad`);

  if (newTargets.length === 0) {
    console.log('✅ Todos los objetivos de alta prioridad han sido contactados');
    return;
  }

  let sentCount = 0;
  let accountIndex = 0;

  for (const business of newTargets) {
    if (sentCount >= batchSize) break;

    // Get next available email account
    const emailAccount = getNextEmailAccount();
    if (!emailAccount) {
      console.log('⚠️  Todas las cuentas de email han alcanzado el límite diario');
      break;
    }

    try {
      console.log(`📧 Generando email para ${business.name} (${business.neighborhood})`);

      // Generate personalized email
      const emailContent = await generatePersonalizedEmail(business);

      // Create recipient email (try to guess based on business info)
      const recipientEmail = business.email ||
        `info@${business.website?.replace('https://www.', '').replace('https://', '').replace('http://www.', '').replace('http://', '')}` ||
        `${business.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}@gmail.com`;

      // Send email
      const result = await mail.send({
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        from: `${emailAccount.name} <${emailAccount.email}>`
      });

      if (result.ok) {
        console.log(`✅ Enviado a ${business.name} via ${emailAccount.email}`);

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
          console.log(`💾 Progreso guardado: ${sentCount} emails enviados`);
        }

      } else {
        console.warn(`❌ No se pudo enviar a ${business.name}: ${result.reason}`);

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
      console.error(`💥 Error procesando ${business.name}:`, e);
    }

    // Rate limiting (1 email per second max)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  saveCampaignData(campaignData);
  console.log(`🎯 Campaña completada: ${sentCount} emails enviados en este lote`);

  // Show summary
  const sentToday = campaignData.filter(c => c.status === 'sent' && c.sent_at?.startsWith(new Date().toISOString().split('T')[0])).length;
  const totalSent = campaignData.filter(c => c.status === 'sent').length;
  const failed = campaignData.filter(c => c.status === 'failed').length;

  console.log(`📈 Resumen de Hoy: ${sentToday} enviados, ${failed} fallidos`);
  console.log(`📊 Campaña Total: ${totalSent} enviados, ${failed} fallidos`);
}

// Get campaign statistics
export function getMedellinCampaignStats(): any {
  const campaignData = loadCampaignData();

  const today = new Date().toISOString().split('T')[0];
  const todaySends = campaignData.filter(c => c.sent_at?.startsWith(today) && c.status === 'sent');

  return {
    total_sent: campaignData.filter(c => c.status === 'sent').length,
    total_failed: campaignData.filter(c => c.status === 'failed').length,
    sent_today: todaySends.length,
    pending: campaignData.filter(c => c.status === 'pending').length,
    accounts_used: [...new Set(campaignData.map(c => c.from_email))].length,
    top_neighborhoods: getTopNeighborhoods(campaignData.filter(c => c.status === 'sent')),
    top_industries: getTopIndustries(campaignData.filter(c => c.status === 'sent'))
  };
}

function getTopNeighborhoods(sentEmails: CampaignEmail[]): string[] {
  const neighborhoodCount: Record<string, number> = {};

  sentEmails.forEach(email => {
    const neighborhood = email.business.neighborhood;
    neighborhoodCount[neighborhood] = (neighborhoodCount[neighborhood] || 0) + 1;
  });

  return Object.entries(neighborhoodCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([neighborhood]) => neighborhood);
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
  runMedellinEmailCampaign(batchSize).catch(console.error);
}