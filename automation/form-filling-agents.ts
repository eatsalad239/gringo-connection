#!/usr/bin/env tsx

/**
 * 🚀 FORM FILLING AGENT NETWORK
 * 
 * 20 autonomous agents targeting top 10 Medellín business types
 * Automatically fill intake forms and send follow-up info
 * 
 * Business Types (2 agents per type):
 * 1. Restaurants & Cafés
 * 2. Beauty & Salon Services
 * 3. Real Estate Agencies
 * 4. Medical & Dental Clinics
 * 5. Retail Shops
 * 6. Law Offices
 * 7. Fitness & Gyms
 * 8. Hotels & Tourism
 * 9. Auto Services
 * 10. Home Services (Plumbing, Electrical, etc.)
 * 
 * Each agent:
 * - Locates business websites
 * - Finds and fills intake forms
 * - Submits information about web improvement services
 * - Sends follow-up email from info@gringoconnection.com
 * - Tracks results in real-time
 */

import { chromium, Browser, Page } from 'playwright';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();
const RESULTS_FILE = join(ROOT_DIR, 'content/agent-form-filling-results.json');
const AGENTS_LOG = join(ROOT_DIR, 'content/form-filling-agents.log');

// Business type definitions with 2 agents per type
const BUSINESS_TYPES = [
  { type: 'Restaurantes y Cafés', agents: 2, keywords: ['restaurante', 'café', 'comida', 'pizzería', 'asadero'] },
  { type: 'Belleza y Salones', agents: 2, keywords: ['peluquería', 'barbería', 'salón', 'spa', 'masaje'] },
  { type: 'Agencias Inmobiliarias', agents: 2, keywords: ['inmobiliario', 'bienes raíces', 'vivienda', 'propiedad'] },
  { type: 'Clínicas Médicas', agents: 2, keywords: ['clínica', 'médico', 'doctor', 'salud', 'consultorio'] },
  { type: 'Tiendas Retail', agents: 2, keywords: ['tienda', 'comercio', 'retail', 'venta', 'boutique'] },
  { type: 'Oficinas Legales', agents: 2, keywords: ['abogado', 'legal', 'jurídico', 'bufete', 'asesor'] },
  { type: 'Gimnasios y Fitness', agents: 2, keywords: ['gimnasio', 'fitness', 'yoga', 'entrenamiento', 'deporte'] },
  { type: 'Hoteles y Turismo', agents: 2, keywords: ['hotel', 'turismo', 'hostal', 'alojamiento', 'resort'] },
  { type: 'Servicios Automotrices', agents: 2, keywords: ['mecánico', 'taller', 'auto', 'carro', 'servicio automotriz'] },
  { type: 'Servicios del Hogar', agents: 2, keywords: ['plomería', 'electricidad', 'reparación', 'mantenimiento', 'construcción'] }
];

interface Agent {
  id: string;
  businessType: string;
  targetWebsites: string[];
  fomsSubmitted: number;
  emailsSent: number;
  status: 'idle' | 'active' | 'completed' | 'error';
  lastAction: string;
  startTime: number;
}

interface FormResult {
  agentId: string;
  timestamp: number;
  businessType: string;
  websiteUrl: string;
  formUrl: string;
  formFilled: boolean;
  emailSent: boolean;
  businessName: string;
  businessEmail: string;
  notes: string;
}

class FormFillingAgent {
  id: string;
  businessType: string;
  browser: Browser | null = null;
  results: FormResult[] = [];
  stats: Agent;

  constructor(id: string, businessType: string) {
    this.id = id;
    this.businessType = businessType;
    this.stats = {
      id,
      businessType,
      targetWebsites: [],
      fomsSubmitted: 0,
      emailsSent: 0,
      status: 'idle',
      lastAction: 'initialized',
      startTime: Date.now()
    };
  }

  async initialize() {
    try {
      this.browser = await chromium.launch({ headless: true });
      this.log(`✅ Browser initialized`);
      this.stats.status = 'active';
    } catch (error) {
      this.log(`❌ Browser initialization failed: ${error}`);
      this.stats.status = 'error';
      throw error;
    }
  }

  async findBusinessWebsites(): Promise<string[]> {
    // In production, this would use:
    // - Google Search API or Bing API
    // - Business directories (Yellow Pages, Google Maps)
    // - Local Medellín business databases
    // For now, we simulate with common patterns
    
    const websites: string[] = [];
    const businessKeywords = BUSINESS_TYPES.find(b => b.type === this.businessType)?.keywords || [];
    
    // Simulate finding websites for this agent
    for (let i = 0; i < 3; i++) {
      const keyword = businessKeywords[i % businessKeywords.length];
      const website = `https://www.${keyword.toLowerCase().replace(/\s+/g, '-')}-medellin-${this.id}.co`;
      websites.push(website);
    }
    
    this.stats.targetWebsites = websites;
    this.log(`🔍 Found ${websites.length} target websites`);
    return websites;
  }

  async fillAndSubmitForm(websiteUrl: string): Promise<boolean> {
    if (!this.browser) {
      this.log(`❌ Browser not initialized`);
      return false;
    }

    let page: Page | null = null;

    try {
      page = await this.browser.newPage();
      this.log(`📄 Opening ${websiteUrl}`);

      // Navigate to website with timeout
      await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {
        this.log(`⚠️ Website unreachable: ${websiteUrl}`);
      });

      // Find and fill form
      const formFilled = await this.detectAndFillForm(page, websiteUrl);
      
      if (formFilled) {
        this.stats.fomsSubmitted++;
        return true;
      }

      return false;
    } catch (error) {
      this.log(`⚠️ Form submission error: ${error}`);
      return false;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  private async detectAndFillForm(page: Page, websiteUrl: string): Promise<boolean> {
    try {
      // Try to find common form patterns
      const formSelectors = [
        'form',
        '[role="form"]',
        '[class*="form"]',
        '[class*="contact"]',
        '[id*="form"]',
        '[id*="contact"]'
      ];

      let formFound = false;

      for (const selector of formSelectors) {
        const form = await page.$(selector);
        if (form) {
          formFound = true;
          this.log(`📝 Form detected using selector: ${selector}`);
          break;
        }
      }

      if (!formFound) {
        this.log(`ℹ️ No form detected on ${websiteUrl}`);
        return false;
      }

      // Fill common form fields
      const commonFields = [
        { selector: 'input[name*="name"], input[type="text"]', value: `GringoConnection - Web Improvement Services` },
        { selector: 'input[name*="email"], input[type="email"]', value: `info@gringoconnection.com` },
        { selector: 'input[name*="phone"], input[type="tel"]', value: `+57-300-GRINGO1` },
        { selector: 'textarea[name*="message"], textarea', value: `We can help improve your website! Visit us at gringoconnection.com or reply to this email.` }
      ];

      for (const field of commonFields) {
        try {
          const input = await page.$(field.selector);
          if (input) {
            await input.fill(field.value);
            this.log(`✍️ Filled field: ${field.selector}`);
          }
        } catch (e) {
          // Field not found, continue
        }
      }

      // Try to submit the form
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Enviar")',
        'input[type="submit"]',
        'button[class*="submit"]',
        'button[class*="send"]'
      ];

      for (const selector of submitSelectors) {
        try {
          const submitBtn = await page.$(selector);
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForTimeout(2000); // Wait for submission
            this.log(`✅ Form submitted`);
            return true;
          }
        } catch (e) {
          // Button not found, try next
        }
      }

      return false;
    } catch (error) {
      this.log(`❌ Form filling error: ${error}`);
      return false;
    }
  }

  async sendFollowUpEmail(businessName: string, businessEmail: string): Promise<boolean> {
    try {
      // Import mail provider
      const { mail } = await import('./providers/index.ts');

      const emailContent = `
        <h2>¡Hola ${businessName}!</h2>
        
        <p>Gracias por completar nuestro formulario de contacto.</p>
        
        <p>En <strong>GringoConnection</strong>, especializamos en mejorar sitios web para negocios como el suyo en Medellín.</p>
        
        <h3>¿Qué podemos hacer por ti?</h3>
        <ul>
          <li>✨ Rediseño moderno de tu sitio web</li>
          <li>📱 Optimización móvil completa</li>
          <li>🚀 Mejora de velocidad y rendimiento</li>
          <li>🎯 SEO local para Medellín</li>
          <li>💰 Aumento de conversiones y ventas</li>
          <li>📊 Integración de análisis y reportes</li>
        </ul>
        
        <p><strong>Solicita una consulta gratuita hoy</strong> - Respondemos en menos de 2 horas.</p>
        
        <p>
          Email: <a href="mailto:info@gringoconnection.com">info@gringoconnection.com</a><br>
          WhatsApp: +57-300-GRINGO1<br>
          Web: gringoconnection.com
        </p>
        
        <p>¡Hagamos que tu negocio brille en línea! 🌟</p>
      `;

      await mail.send({
        to: businessEmail,
        subject: '¡Mejoremos tu sitio web! - GringoConnection',
        html: emailContent
      });

      this.stats.emailsSent++;
      this.log(`📧 Follow-up email sent to ${businessEmail}`);
      return true;
    } catch (error) {
      this.log(`⚠️ Email sending failed: ${error}`);
      return false;
    }
  }

  async executeFormFillingRound(): Promise<void> {
    this.log(`\n🚀 Starting form filling round for ${this.businessType}`);
    this.stats.status = 'active';

    try {
      // Find target websites
      const websites = await this.findBusinessWebsites();

      // Fill forms rapidly
      for (const website of websites) {
        const formFilled = await this.fillAndSubmitForm(website);
        
        if (formFilled) {
          const result: FormResult = {
            agentId: this.id,
            timestamp: Date.now(),
            businessType: this.businessType,
            websiteUrl: website,
            formUrl: website,
            formFilled: true,
            emailSent: false,
            businessName: `Business from ${website}`,
            businessEmail: 'contact@business.co',
            notes: 'Form successfully filled and submitted'
          };

          // Send follow-up email
          const emailSent = await this.sendFollowUpEmail(result.businessName, result.businessEmail);
          result.emailSent = emailSent;
          
          this.results.push(result);
        }

        // Rate limiting - be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.stats.status = 'completed';
      this.stats.lastAction = `Completed at ${new Date().toISOString()}`;
    } catch (error) {
      this.stats.status = 'error';
      this.stats.lastAction = `Error: ${error}`;
      this.log(`❌ Round failed: ${error}`);
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.id}] ${message}\n`;
    console.log(logMessage);
    
    // Append to log file
    try {
      const existing = existsSync(AGENTS_LOG) ? readFileSync(AGENTS_LOG, 'utf-8') : '';
      writeFileSync(AGENTS_LOG, existing + logMessage, 'utf-8');
    } catch (e) {
      // Ignore file write errors
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.log(`🛑 Browser closed`);
    }
  }
}

class FormFillingAgentNetwork {
  agents: FormFillingAgent[] = [];
  startTime: number = Date.now();

  async createAgents(): Promise<void> {
    console.log(`\n🤖 CREATING 20-AGENT FORM FILLING NETWORK\n`);
    console.log(`Business Types: ${BUSINESS_TYPES.length}`);
    console.log(`Agents per Type: 2`);
    console.log(`Total Agents: 20\n`);

    let agentCount = 1;

    for (const businessType of BUSINESS_TYPES) {
      for (let i = 0; i < businessType.agents; i++) {
        const agentId = `AGENT-${String(agentCount).padStart(2, '0')}`;
        const agent = new FormFillingAgent(agentId, businessType.type);
        this.agents.push(agent);
        console.log(`✅ Created ${agentId} for ${businessType.type}`);
        agentCount++;
      }
    }

    console.log(`\n🎯 Ready to deploy ${this.agents.length} agents\n`);
  }

  async initializeAllAgents(): Promise<void> {
    console.log(`⚙️ INITIALIZING ALL AGENTS\n`);

    for (const agent of this.agents) {
      try {
        await agent.initialize();
      } catch (error) {
        console.error(`Failed to initialize ${agent.id}: ${error}`);
      }
    }

    console.log(`\n✅ All agents initialized\n`);
  }

  async executeAllAgentsParallel(maxConcurrent: number = 5): Promise<void> {
    console.log(`\n🚀 EXECUTING ALL AGENTS (Max ${maxConcurrent} concurrent)\n`);

    // Execute agents in batches
    for (let i = 0; i < this.agents.length; i += maxConcurrent) {
      const batch = this.agents.slice(i, i + maxConcurrent);
      console.log(`📊 Executing batch ${Math.floor(i / maxConcurrent) + 1} (${batch.length} agents)...`);

      await Promise.all(batch.map(agent => agent.executeFormFillingRound()));

      // Stagger batch start times
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ All agents completed\n`);
  }

  async cleanupAllAgents(): Promise<void> {
    console.log(`🧹 CLEANING UP ALL AGENTS\n`);

    for (const agent of this.agents) {
      await agent.cleanup();
    }

    console.log(`✅ All agents cleaned up\n`);
  }

  async generateReport(): Promise<void> {
    console.log(`\n📊 GENERATING NETWORK REPORT\n`);

    const totalTime = Date.now() - this.startTime;
    const totalFormsSubmitted = this.agents.reduce((sum, a) => sum + a.stats.fomsSubmitted, 0);
    const totalEmailsSent = this.agents.reduce((sum, a) => sum + a.stats.emailsSent, 0);

    const report = {
      timestamp: new Date().toISOString(),
      totalTime: `${(totalTime / 1000).toFixed(2)}s`,
      agents: this.agents.map(a => ({
        ...a.stats,
        results: a.results.length
      })),
      summary: {
        totalAgents: this.agents.length,
        totalFormsSubmitted,
        totalEmailsSent,
        averageFormPerAgent: (totalFormsSubmitted / this.agents.length).toFixed(2),
        averageEmailPerAgent: (totalEmailsSent / this.agents.length).toFixed(2),
        successRate: `${((totalFormsSubmitted / (this.agents.length * 3)) * 100).toFixed(1)}%`
      }
    };

    writeFileSync(RESULTS_FILE, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`\n📈 NETWORK STATISTICS:`);
    console.log(`├─ Total Forms Submitted: ${totalFormsSubmitted}`);
    console.log(`├─ Total Emails Sent: ${totalEmailsSent}`);
    console.log(`├─ Total Time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`├─ Forms per Agent: ${(totalFormsSubmitted / this.agents.length).toFixed(2)}`);
    console.log(`├─ Success Rate: ${((totalFormsSubmitted / (this.agents.length * 3)) * 100).toFixed(1)}%`);
    console.log(`└─ Report saved to: ${RESULTS_FILE}\n`);
  }

  async launchNetwork(): Promise<void> {
    try {
      await this.createAgents();
      await this.initializeAllAgents();
      await this.executeAllAgentsParallel(5); // 5 concurrent agents
      await this.generateReport();
    } catch (error) {
      console.error(`\n❌ Network launch failed: ${error}`);
    } finally {
      await this.cleanupAllAgents();
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2] || 'launch';

  const network = new FormFillingAgentNetwork();

  switch (command) {
    case 'launch':
      console.log(`\n${'='.repeat(60)}`);
      console.log(`  🚀 MEDELLÍN BUSINESS FORM FILLING AGENT NETWORK`);
      console.log(`  20 Autonomous Agents • High-Speed Execution`);
      console.log(`${'='.repeat(60)}\n`);
      
      await network.launchNetwork();
      
      console.log(`${'='.repeat(60)}`);
      console.log(`  ✅ NETWORK LAUNCH COMPLETE`);
      console.log(`${'='.repeat(60)}\n`);
      break;

    case 'report':
      console.log(`📊 Loading report from ${RESULTS_FILE}...`);
      if (existsSync(RESULTS_FILE)) {
        const report = JSON.parse(readFileSync(RESULTS_FILE, 'utf-8'));
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(`No report found. Run 'launch' first.`);
      }
      break;

    default:
      console.log(`Usage: tsx form-filling-agents.ts [command]`);
      console.log(`  launch  - Launch the 20-agent network`);
      console.log(`  report  - Show latest results report`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { FormFillingAgent, FormFillingAgentNetwork };
