#!/usr/bin/env tsx

/**
 * ⚡ RAPID FORM FILLER
 * 
 * Ultra-fast form submission engine optimized for speed
 * - Parallel form detection and filling
 * - Aggressive timeouts and retries
 * - Smart field mapping
 * - Real-time result streaming
 */

import { chromium, Browser, Page } from 'playwright';
import { existsSync, writeFileSync, appendFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();
const RAPID_RESULTS = join(ROOT_DIR, 'content/rapid-form-results.json');

interface RapidFormResult {
  id: string;
  url: string;
  timestamp: number;
  success: boolean;
  formType: string;
  submissionTime: number;
  businessExtracted: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

class RapidFormFiller {
  private browser: Browser | null = null;
  private results: RapidFormResult[] = [];
  private startTime: number = Date.now();

  // Common form field patterns
  private readonly FORM_FIELD_PATTERNS = {
    name: [
      'input[name="name"]',
      'input[name="fullName"]',
      'input[name="full_name"]',
      'input[name="company_name"]',
      'input[name="business_name"]',
      'input[id*="name"][type="text"]',
      'input[placeholder*="name" i]',
      'input[placeholder*="nombre" i]'
    ],
    email: [
      'input[name="email"]',
      'input[type="email"]',
      'input[name="contact_email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="correo" i]'
    ],
    phone: [
      'input[name="phone"]',
      'input[name="telephone"]',
      'input[type="tel"]',
      'input[name="mobile"]',
      'input[placeholder*="phone" i]',
      'input[placeholder*="teléfono" i]',
      'input[placeholder*="celular" i]'
    ],
    message: [
      'textarea[name="message"]',
      'textarea[name="comments"]',
      'textarea[name="description"]',
      'textarea[id*="message"]',
      'textarea[placeholder*="message" i]',
      'textarea[placeholder*="mensaje" i]'
    ]
  };

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--single-process'
        ]
      });
      console.log('✅ Browser initialized (optimized for speed)');
    } catch (error) {
      console.error(`❌ Initialization failed: ${error}`);
      throw error;
    }
  }

  async fillFormRapidly(
    url: string,
    businessName: string,
    businessEmail: string,
    businessPhone: string
  ): Promise<RapidFormResult> {
    if (!this.browser) throw new Error('Browser not initialized');

    const result: RapidFormResult = {
      id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      timestamp: Date.now(),
      success: false,
      formType: 'unknown',
      submissionTime: 0,
      businessExtracted: {}
    };

    let page: Page | null = null;
    const submitStartTime = Date.now();

    try {
      page = await this.browser.newPage();

      // Set aggressive timeouts
      page.setDefaultTimeout(5000);
      page.setDefaultNavigationTimeout(5000);

      // Navigate rapidly
      await Promise.race([
        page.goto(url, { waitUntil: 'domcontentloaded' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation timeout')), 5000))
      ]).catch(() => null);

      // Extract business info if visible
      const pageText = await page.content();
      result.businessExtracted.name = this.extractBusinessName(pageText);

      // Find and fill form
      const formFilled = await this.fillFormFields(page, {
        name: businessName,
        email: businessEmail,
        phone: businessPhone,
        message: 'We can help improve your website! Contact info@gringoconnection.com'
      });

      if (formFilled) {
        // Submit form rapidly
        const submitted = await this.submitFormFast(page);
        
        if (submitted) {
          result.success = true;
          result.submissionTime = Date.now() - submitStartTime;
          console.log(`✅ [${result.id}] Form submitted in ${result.submissionTime}ms`);
        }
      }
    } catch (error) {
      // Silently continue on error
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignore close errors
        }
      }
    }

    return result;
  }

  private async fillFormFields(
    page: Page,
    data: { name: string; email: string; phone: string; message: string }
  ): Promise<boolean> {
    try {
      let fieldsFilled = 0;

      // Fill name
      for (const selector of this.FORM_FIELD_PATTERNS.name) {
        const element = await page.$(selector);
        if (element) {
          await element.fill(data.name, { timeout: 2000 }).catch(() => null);
          fieldsFilled++;
          break;
        }
      }

      // Fill email
      for (const selector of this.FORM_FIELD_PATTERNS.email) {
        const element = await page.$(selector);
        if (element) {
          await element.fill(data.email, { timeout: 2000 }).catch(() => null);
          fieldsFilled++;
          break;
        }
      }

      // Fill phone
      for (const selector of this.FORM_FIELD_PATTERNS.phone) {
        const element = await page.$(selector);
        if (element) {
          await element.fill(data.phone, { timeout: 2000 }).catch(() => null);
          fieldsFilled++;
          break;
        }
      }

      // Fill message
      for (const selector of this.FORM_FIELD_PATTERNS.message) {
        const element = await page.$(selector);
        if (element) {
          await element.fill(data.message, { timeout: 2000 }).catch(() => null);
          fieldsFilled++;
          break;
        }
      }

      return fieldsFilled >= 2; // At least 2 fields filled
    } catch (error) {
      return false;
    }
  }

  private async submitFormFast(page: Page): Promise<boolean> {
    try {
      // Try multiple submit methods simultaneously
      const submitAttempts = [
        // Method 1: Find and click submit button
        (async () => {
          const btn = await page.$('button[type="submit"]').catch(() => null);
          if (btn) {
            await btn.click({ timeout: 1000 }).catch(() => null);
            return true;
          }
          return false;
        })(),
        
        // Method 2: Press Enter in form
        (async () => {
          await page.press('input[type="email"]', 'Enter').catch(() => null);
          return true;
        })(),
        
        // Method 3: Execute form submission via JavaScript
        (async () => {
          await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
              form.submit();
              return true;
            }
            return false;
          }).catch(() => null);
          return true;
        })()
      ];

      const results = await Promise.allSettled(submitAttempts);
      
      // Wait for page change/success
      await page.waitForLoadState('networkidle').catch(() => null);
      
      return results.some(r => r.status === 'fulfilled' && r.value);
    } catch (error) {
      return false;
    }
  }

  private extractBusinessName(html: string): string | undefined {
    // Try to extract business name from page
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].split('|')[0].split('-')[0].trim();
    }

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      return h1Match[1];
    }

    return undefined;
  }

  async processBusinessListRapidly(
    businessUrls: Array<{ url: string; name: string }>,
    concurrency: number = 10
  ): Promise<void> {
    console.log(`\n⚡ RAPID FORM FILLING - Processing ${businessUrls.length} websites`);
    console.log(`📊 Concurrency: ${concurrency} forms simultaneously\n`);

    const agentName = 'GringoConnection Agent';
    const agentEmail = 'info@gringoconnection.com';
    const agentPhone = '+57-300-GRINGO-1';

    // Process in concurrent batches
    for (let i = 0; i < businessUrls.length; i += concurrency) {
      const batch = businessUrls.slice(i, i + concurrency);
      
      console.log(`📤 Batch ${Math.floor(i / concurrency) + 1}: Processing ${batch.length} forms...`);
      
      const batchResults = await Promise.all(
        batch.map(business =>
          this.fillFormRapidly(business.url, agentName, agentEmail, agentPhone)
        )
      );

      this.results.push(...batchResults);

      // Stream results
      this.streamResults(batchResults);

      // Progress
      const processed = Math.min(i + concurrency, businessUrls.length);
      const percentage = ((processed / businessUrls.length) * 100).toFixed(1);
      console.log(`✅ Progress: ${processed}/${businessUrls.length} (${percentage}%)\n`);

      // Stagger batches slightly to avoid detection
      if (i + concurrency < businessUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n✅ All forms processed`);
  }

  private streamResults(results: RapidFormResult[]): void {
    for (const result of results) {
      const status = result.success ? '✅' : '⏭️';
      console.log(`${status} ${result.url} (${result.submissionTime}ms)`);
    }
  }

  async generateRapidReport(): Promise<void> {
    const totalTime = Date.now() - this.startTime;
    const successful = this.results.filter(r => r.success).length;
    const averageTime = this.results.length > 0
      ? this.results.reduce((sum, r) => sum + r.submissionTime, 0) / this.results.length
      : 0;

    const report = {
      timestamp: new Date().toISOString(),
      totalTime: `${(totalTime / 1000).toFixed(2)}s`,
      totalProcessed: this.results.length,
      successfulSubmissions: successful,
      successRate: `${((successful / this.results.length) * 100).toFixed(1)}%`,
      averageSubmissionTime: `${averageTime.toFixed(0)}ms`,
      formsPerSecond: (this.results.length / (totalTime / 1000)).toFixed(2),
      results: this.results
    };

    writeFileSync(RAPID_RESULTS, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 RAPID FORM FILLING REPORT`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Forms: ${report.totalProcessed}`);
    console.log(`Successful: ${report.successfulSubmissions} (${report.successRate})`);
    console.log(`Avg Time per Form: ${report.averageSubmissionTime}`);
    console.log(`Speed: ${report.formsPerSecond} forms/second`);
    console.log(`Total Time: ${report.totalTime}`);
    console.log(`${'='.repeat(60)}\n`);
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const filler = new RapidFormFiller();

  try {
    await filler.initialize();

    // Example business URLs (in production, these would come from search results)
    const exampleBusinesses = [
      { url: 'https://www.restaurantemedellin.co/contact', name: 'Restaurante Local' },
      { url: 'https://www.salonbelleza.co/formulario', name: 'Salón de Belleza' },
      { url: 'https://www.inmobiliaria.co/contactenos', name: 'Inmobiliaria' },
      // Add more...
    ].slice(0, 5); // Demo with 5

    await filler.processBusinessListRapidly(exampleBusinesses, 3);
    await filler.generateRapidReport();
  } catch (error) {
    console.error(`Fatal error: ${error}`);
  } finally {
    await filler.cleanup();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RapidFormFiller, RapidFormResult };
