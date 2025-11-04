/**
 * Business Outreach Agent - Form Filling Automation
 * Targets Medellín businesses with website improvement offers
 * Uses Playwright for browser automation and form filling
 */

import { chromium, Browser, Page, ElementHandle } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { mail, llm } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const BUSINESS_TYPES_PATH = join(CONTENT_DIR, 'medellin-business-types.json');
const RESULTS_PATH = join(CONTENT_DIR, 'outreach-results.json');

interface BusinessType {
  id: string;
  name: string;
  searchTerms: string[];
  painPoints: string[];
  valueProp: string;
  contactForms: string[];
}

interface OutreachResult {
  businessType: string;
  website: string;
  formFound: boolean;
  formFilled: boolean;
  emailSent: boolean;
  timestamp: string;
  error?: string;
}

class BusinessOutreachAgent {
  private browser: Browser | null = null;
  private businessTypes: BusinessType[] = [];
  private results: OutreachResult[] = [];

  constructor(private businessTypeId: string) {
    this.loadBusinessTypes();
    this.loadResults();
  }

  private loadBusinessTypes() {
    if (existsSync(BUSINESS_TYPES_PATH)) {
      const data = JSON.parse(readFileSync(BUSINESS_TYPES_PATH, 'utf-8'));
      this.businessTypes = data.businessTypes;
    }
  }

  private loadResults() {
    if (existsSync(RESULTS_PATH)) {
      this.results = JSON.parse(readFileSync(RESULTS_PATH, 'utf-8'));
    }
  }

  private saveResults() {
    writeFileSync(RESULTS_PATH, JSON.stringify(this.results, null, 2));
  }

  private getBusinessType(): BusinessType | undefined {
    return this.businessTypes.find(bt => bt.id === this.businessTypeId);
  }

  async init(): Promise<void> {
    console.log(`🤖 Initializing Business Outreach Agent for ${this.businessTypeId}`);

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async findBusinesses(): Promise<string[]> {
    const businessType = this.getBusinessType();
    if (!businessType) {
      throw new Error(`Business type ${this.businessTypeId} not found`);
    }

    console.log(`🔍 Finding ${businessType.name} businesses in Medellín...`);

    const websites: string[] = [];

    // Search Google for each term
    for (const term of businessType.searchTerms.slice(0, 2)) { // Limit to 2 terms for speed
      try {
        const page = await this.browser!.newPage();
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(term + ' site:.co')}&num=10`);

        // Wait for results
        await page.waitForTimeout(2000);

        // Extract business websites from search results
        const links = await page.$$eval('a[href]', (anchors) =>
          anchors
            .map(a => (a as HTMLAnchorElement).href)
            .filter(href =>
              href.includes('.co') &&
              !href.includes('google.com') &&
              !href.includes('facebook.com') &&
              !href.includes('instagram.com') &&
              !href.includes('youtube.com')
            )
            .slice(0, 5) // Get first 5 results per search
        );

        websites.push(...links);
        await page.close();
      } catch (error) {
        console.warn(`Search failed for ${term}:`, error);
      }
    }

    // Remove duplicates and filter
    const uniqueWebsites = [...new Set(websites)]
      .filter(url => {
        try {
          const domain = new URL(url).hostname;
          return domain.includes('.co') || domain.includes('medellin');
        } catch {
          return false;
        }
      })
      .slice(0, 10); // Limit to 10 websites per agent

    console.log(`📋 Found ${uniqueWebsites.length} potential ${businessType.name} websites`);
    return uniqueWebsites;
  }

  async processWebsite(website: string): Promise<OutreachResult> {
    const result: OutreachResult = {
      businessType: this.businessTypeId,
      website,
      formFound: false,
      formFilled: false,
      emailSent: false,
      timestamp: new Date().toISOString()
    };

    try {
      console.log(`🌐 Processing ${website}`);

      const page = await this.browser!.newPage();

      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // Navigate to website
      await page.goto(website, { waitUntil: 'networkidle', timeout: 30000 });

      // Look for contact forms
      const businessType = this.getBusinessType()!;
      const contactPaths = businessType.contactForms;

      let contactPage = page;
      let formFound = false;

      // Try different contact page paths
      for (const path of contactPaths) {
        try {
          const contactUrl = path.startsWith('/') ? `${website}${path}` : `${website}/${path}`;

          if (contactUrl !== website) {
            await page.goto(contactUrl, { waitUntil: 'networkidle', timeout: 10000 });
            contactPage = page;
          }

          // Look for forms
          const forms = await contactPage.$$('form');
          if (forms.length > 0) {
            formFound = true;
            result.formFound = true;
            break;
          }

          // Look for contact sections
          const contactElements = await contactPage.$$('[class*="contact"], [id*="contact"], [class*="form"], [id*="form"]');
          if (contactElements.length > 0) {
            formFound = true;
            result.formFound = true;
            break;
          }
        } catch (error) {
          // Continue to next path
        }
      }

      if (formFound) {
        console.log(`📝 Found contact form on ${website}`);
        const filled = await this.fillContactForm(contactPage, businessType);
        result.formFilled = filled;
      }

      await page.close();

    } catch (error) {
      result.error = String(error);
      console.warn(`❌ Error processing ${website}:`, error);
    }

    // Always send email notification
    await this.sendNotificationEmail(result);

    return result;
  }

  private async fillContactForm(page: Page, businessType: BusinessType): Promise<boolean> {
    try {
      // Generate personalized message using LLM
      const message = await this.generatePersonalizedMessage(businessType);

      // Try to fill common form fields
      const fieldMappings = {
        'input[name*="name"], input[name*="nombre"]': 'Gringo Connection',
        'input[name*="email"]': 'info@gringoconnection.com',
        'input[name*="phone"], input[name*="tel"], input[name*="telefono"]': '+57 301 123 4567',
        'input[name*="company"], input[name*="empresa"]': 'Gringo Connection',
        'input[name*="website"], input[name*="sitio"]': 'https://gringoconnection.com',
        'textarea[name*="message"], textarea[name*="mensaje"]': message,
        'input[name*="subject"], input[name*="asunto"]': `Website Improvement Services for ${businessType.name}`
      };

      let fieldsFilled = 0;

      for (const [selector, value] of Object.entries(fieldMappings)) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.fill(value);
            fieldsFilled++;
            await page.waitForTimeout(500); // Small delay between fills
          }
        } catch (error) {
          // Field might not exist or be interactable
        }
      }

      // Try to submit the form
      const submitButtons = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Enviar")',
        'button:has-text("Send")',
        'button:has-text("Contact")'
      ];

      for (const selector of submitButtons) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            await page.waitForTimeout(2000); // Wait for submission
            console.log(`✅ Form submitted on ${page.url()}`);
            return fieldsFilled > 2; // Consider successful if we filled multiple fields
          }
        } catch (error) {
          // Button might not be clickable
        }
      }

      return fieldsFilled > 2;

    } catch (error) {
      console.warn(`Form filling failed:`, error);
      return false;
    }
  }

  private async generatePersonalizedMessage(businessType: BusinessType): Promise<string> {
    const prompt = `Generate a personalized, professional message in Spanish for a ${businessType.name} business in Medellín, Colombia.

Business pain points: ${businessType.painPoints.join(', ')}
Value proposition: ${businessType.valueProp}

The message should:
- Be in Spanish (since this is Colombia)
- Introduce Gringo Connection as a website improvement service
- Mention their specific pain points
- Explain our value proposition with specific benefits
- Include a call to action
- Keep it under 200 words
- Be professional and trustworthy

Format: Just the message text, no quotes or extra formatting.`;

    const result = await llm.text(prompt, { maxTokens: 300 });
    return result.ok ? result.text! : `Hola, somos Gringo Connection y podemos mejorar su sitio web para aumentar sus ventas en un 40%. ¿Le gustaría hablar sobre cómo optimizar su presencia digital?`;
  }

  private async sendNotificationEmail(result: OutreachResult): Promise<void> {
    try {
      const subject = result.formFilled
        ? `✅ Contact Form Filled - ${result.businessType} Business`
        : `📝 Contact Attempt - ${result.businessType} Business`;

      const html = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p><strong>Business Type:</strong> ${result.businessType}</p>
          <p><strong>Website:</strong> <a href="${result.website}">${result.website}</a></p>
          <p><strong>Form Found:</strong> ${result.formFound ? '✅' : '❌'}</p>
          <p><strong>Form Filled:</strong> ${result.formFilled ? '✅' : '❌'}</p>
          <p><strong>Timestamp:</strong> ${result.timestamp}</p>
          ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
          <hr>
          <p><em>Automated outreach by Business Outreach Agent</em></p>
        </div>
      `;

      await mail.send({
        to: 'info@gringoconnection.com',
        subject,
        html
      });

      result.emailSent = true;
      console.log(`📧 Notification email sent for ${result.website}`);

    } catch (error) {
      console.warn(`Email notification failed:`, error);
    }
  }

  async runOutreach(): Promise<OutreachResult[]> {
    await this.init();

    try {
      const websites = await this.findBusinesses();

      for (const website of websites) {
        // Skip if already processed recently
        const existingResult = this.results.find(r =>
          r.website === website &&
          r.businessType === this.businessTypeId &&
          new Date(r.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Within last 24 hours
        );

        if (existingResult) {
          console.log(`⏭️ Skipping ${website} (already processed recently)`);
          continue;
        }

        const result = await this.processWebsite(website);
        this.results.push(result);

        // Save progress
        this.saveResults();

        // Small delay between websites to avoid being flagged as spam
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }

    return this.results.filter(r => r.businessType === this.businessTypeId);
  }
}

// CLI Interface
export async function runBusinessOutreach(businessTypeId: string): Promise<void> {
  console.log(`🚀 Starting Business Outreach Agent for ${businessTypeId}`);

  const agent = new BusinessOutreachAgent(businessTypeId);
  const results = await agent.runOutreach();

  const successful = results.filter(r => r.formFilled).length;
  const total = results.length;

  console.log(`\n📊 Outreach Complete for ${businessTypeId}:`);
  console.log(`   Forms filled: ${successful}/${total}`);
  console.log(`   Success rate: ${total > 0 ? Math.round((successful / total) * 100) : 0}%`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const businessTypeId = process.argv[2];
  if (!businessTypeId) {
    console.log('Usage: tsx businessOutreachAgent.ts <business-type-id>');
    console.log('Available types: restaurants, real-estate, healthcare, legal-services, tourism, education, construction, retail, professional-services, startups');
    process.exit(1);
  }

  runBusinessOutreach(businessTypeId).catch(console.error);
}

export default BusinessOutreachAgent;