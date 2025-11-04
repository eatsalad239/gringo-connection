/**
 * AI-powered email generator using Grok API
 * Generates tailored emails based on business industry, pain points, and value
 */

import { llm } from '../providers.js';
import type { ColombianBusiness, EmailTemplate } from '../types/business.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load verticals for industry-specific content
function loadVerticals() {
  try {
    const content = readFileSync(
      join(__dirname, '../../content/verticals.json'),
      'utf-8'
    );
    return JSON.parse(content);
  } catch {
    return { verticals: [] };
  }
}

export class EmailGenerator {
  private verticals: any;

  constructor() {
    this.verticals = loadVerticals();
  }

  /**
   * Generate tailored email for a business
   */
  async generateEmail(business: ColombianBusiness): Promise<EmailTemplate> {
    const vertical = this.verticals.verticals.find(
      (v: any) => v.id === business.vertical
    );

    // Build prompt for Grok
    const prompt = this.buildPrompt(business, vertical);

    // Generate email using Grok (via llm provider chain)
    const result = await llm.text(prompt, {
      maxTokens: 1500,
      temperature: 0.8,
      system: this.getSystemPrompt(),
    });

    if (!result.ok || !result.text) {
      // Fallback to template-based email
      return this.generateFallbackEmail(business, vertical);
    }

    // Parse Grok response (should be JSON or structured text)
    try {
      const parsed = this.parseEmailResponse(result.text);
      return parsed;
    } catch {
      // If parsing fails, use fallback
      return this.generateFallbackEmail(business, vertical);
    }
  }

  private buildPrompt(business: ColombianBusiness, vertical: any): string {
    const services = this.getServicesForBusiness(business);
    const painPoints = business.painPoints?.join(', ') || this.getDefaultPainPoints(business.vertical);

    return `Generate a personalized sales email in Spanish for a Colombian business.

Business Details:
- Name: ${business.name}
- Industry: ${business.industry} (${business.vertical})
- City: ${business.city}
- Net Worth: ${business.netWorth}
- Owner Occupied: ${business.ownerOccupied ? 'Yes' : 'No'}
- Pain Points: ${painPoints}

Available Services:
${services.map((s) => `- ${s}`).join('\n')}

${vertical ? `\nIndustry Proof Points:\n${vertical.proof_es.map((p: string) => `- ${p}`).join('\n')}` : ''}

Requirements:
1. Write in professional but friendly Spanish (Colombian dialect)
2. Keep subject line under 60 characters, compelling
3. Body should be 150-200 words
4. Personalize with business name and industry
5. Address their specific pain points
6. Offer relevant services (websites, AI automation, or both)
7. Include a clear call-to-action
8. Be concise and value-focused

Format your response as JSON:
{
  "subject": "Subject line here",
  "body": "Email body in HTML format",
  "language": "es"
}`;
  }

  private getSystemPrompt(): string {
    return `You are an expert sales email writer for a technology services company in Medellín, Colombia. 
You specialize in writing personalized, persuasive emails in Spanish that:
- Address specific business pain points
- Offer relevant technology solutions (websites, AI automation, WhatsApp integration)
- Use a professional but friendly tone
- Are concise and action-oriented
- Follow Colombian business communication norms

Always respond with valid JSON matching the requested format.`;
  }

  private parseEmailResponse(text: string): EmailTemplate {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        subject: parsed.subject || 'Soluciones de IA para tu negocio',
        body: parsed.body || this.getDefaultBody(parsed.language || 'es'),
        language: parsed.language || 'es',
      };
    }

    // If no JSON, try to extract subject and body from text
    const subjectMatch = text.match(/subject[:\-]\s*(.+)/i);
    const bodyMatch = text.match(/body[:\-]\s*([\s\S]+)/i);

    return {
      subject: subjectMatch?.[1]?.trim() || 'Soluciones de IA para tu negocio',
      body: bodyMatch?.[1]?.trim() || this.getDefaultBody('es'),
      language: 'es',
    };
  }

  private getServicesForBusiness(business: ColombianBusiness): string[] {
    const services: string[] = [];

    // Always offer website if they don't have one
    if (!business.website || business.website === '') {
      services.push('Sitio web profesional con IA');
    }

    // Add industry-specific services
    switch (business.vertical) {
      case 'law':
        services.push('Automatización de intake de clientes', 'Chatbots para consultas legales');
        break;
      case 'clinics':
        services.push('Agendamiento automatizado de pacientes', 'Recordatorios por WhatsApp');
        break;
      case 'restaurants':
        services.push('Pedidos por WhatsApp', 'Sistema de reservas automatizado');
        break;
      case 'education':
        services.push('Automatización de inscripciones', 'Comunicación con padres');
        break;
      case 'startups':
        services.push('Automatización de marketing', 'Generación de leads');
        break;
      default:
        services.push('Automatizaciones con IA', 'Integración WhatsApp Business');
    }

    return services;
  }

  private getDefaultPainPoints(vertical: string): string {
    const painPoints: Record<string, string> = {
      law: 'Tiempo excesivo en intake de clientes, comunicación manual',
      clinics: 'Agendamiento manual, falta de recordatorios automáticos',
      restaurants: 'Pedidos por teléfono, gestión manual de reservas',
      education: 'Procesos administrativos manuales, comunicación con padres',
      startups: 'Falta de automatización, procesos manuales costosos',
    };

    return painPoints[vertical] || 'Procesos manuales, falta de automatización';
  }

  private generateFallbackEmail(business: ColombianBusiness, vertical: any): EmailTemplate {
    const services = this.getServicesForBusiness(business);
    const serviceList = services.join(', ');

    const subject = `Soluciones de IA para ${business.name} en ${business.city}`;

    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hola ${business.name},</h2>
        
        <p>Somos <strong>Gringo Connection</strong>, una empresa de tecnología con sede en Medellín que ayuda a negocios colombianos como el tuyo a crecer con soluciones de IA y automatización.</p>
        
        <p>Vemos que te encuentras en ${business.industry} en ${business.city}. Sabemos que muchos negocios en tu sector enfrentan desafíos como:</p>
        <ul>
          ${this.getDefaultPainPoints(business.vertical)
            .split(',')
            .map((p) => `<li>${p.trim()}</li>`)
            .join('')}
        </ul>
        
        <p>Podemos ayudarte con:</p>
        <ul>
          ${services.map((s) => `<li><strong>${s}</strong></li>`).join('')}
        </ul>
        
        <p>Nuestras soluciones están diseñadas específicamente para empresas colombianas y son completamente bilingües (español/inglés).</p>
        
        <p style="margin-top: 30px;">
          <a href="https://gringoconnection.com/contacto" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Agenda una consulta gratuita
          </a>
        </p>
        
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Saludos,<br>
          <strong>Equipo Gringo Connection</strong><br>
          Medellín, Colombia
        </p>
      </div>
    `;

    return { subject, body, language: 'es' };
  }

  private getDefaultBody(language: string): string {
    return this.generateFallbackEmail(
      {
        id: '',
        name: '',
        email: '',
        industry: '',
        vertical: '',
        city: '',
        netWorth: 'medium',
        ownerOccupied: false,
      },
      null
    ).body;
  }
}
