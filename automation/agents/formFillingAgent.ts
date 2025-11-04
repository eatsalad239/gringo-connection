#!/usr/bin/env tsx

/**
 * Form Filling Agent - Automated form submission for Medellín businesses
 * Visits websites, finds contact/lead forms, fills them out, and notifies about website improvements
 */

import { chromium, Browser, Page } from 'playwright';
import { llm, mail } from '../providers.js';
import { RateLimiter } from '../utils/rateLimiter.js';

interface Business {
  id: string;
  name: string;
  website: string;
  businessType: string;
  category: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

interface FormSubmission {
  business: Business;
  success: boolean;
  formFound: boolean;
  submitted: boolean;
  message: string;
  error?: string;
  timestamp: string;
}

interface AgentConfig {
  agentId: number;
  maxFormsPerRun: number;
  timeout: number;
  userAgent: string;
}

// Rate limiter for form submissions
const formRateLimiter = new RateLimiter({ maxRequests: 30, windowMs: 60 * 1000 });

// Generate realistic Colombian names and contact info
function generateContactInfo(agentId: number) {
  const firstNames = [
    'Carlos', 'María', 'Juan', 'Ana', 'Luis', 'Laura', 'Diego', 'Sofia',
    'Andrés', 'Camila', 'Sebastián', 'Valentina', 'Nicolás', 'Isabella',
    'Daniel', 'Gabriela', 'Alejandro', 'Mariana', 'David', 'Paula'
  ];
  const lastNames = [
    'García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez',
    'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez',
    'Díaz', 'Cruz', 'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ramos', 'Herrera'
  ];
  
  const names = [
    'Carlos Martínez', 'María Rodríguez', 'Juan García', 'Ana López',
    'Luis González', 'Laura Pérez', 'Diego Sánchez', 'Sofia Ramírez',
    'Andrés Torres', 'Camila Flores', 'Sebastián Rivera', 'Valentina Gómez',
    'Nicolás Díaz', 'Isabella Cruz', 'Daniel Morales', 'Gabriela Ortiz',
    'Alejandro Gutiérrez', 'Mariana Chávez', 'David Ramos', 'Paula Herrera'
  ];

  const domains = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
    'gmail.co', 'hotmail.co', 'outlook.co'
  ];

  const name = names[agentId % names.length];
  const email = `${name.toLowerCase().replace(' ', '.')}@${domains[agentId % domains.length]}`;
  const phone = `+57 ${300 + (agentId * 7) % 900} ${Math.floor(Math.random() * 9000) + 1000}`;

  return { name, email, phone };
}

// Message to include in forms
const MESSAGE_TEMPLATE = `Hola, estoy interesado en mejorar mi presencia en línea. He visto que pueden ayudar con el desarrollo de sitios web. Por favor contáctenme a info@gringoconnection.com para más información sobre cómo podemos mejorar nuestro sitio web.`;

// Find forms on the page
async function findForms(page: Page): Promise<Array<{ selector: string; type: string }>> {
  const forms = await page.evaluate(() => {
    const formElements = Array.from(document.querySelectorAll('form'));
    const formData: Array<{ selector: string; type: string }> = [];

    formElements.forEach((form, index) => {
      // Check if form has common contact form fields
      const hasName = form.querySelector('input[name*="name" i], input[id*="name" i], input[type="text"]');
      const hasEmail = form.querySelector('input[name*="email" i], input[id*="email" i], input[type="email"]');
      const hasMessage = form.querySelector('textarea[name*="message" i], textarea[name*="message" i], textarea[id*="message" i]');
      
      if (hasName || hasEmail || hasMessage) {
        formData.push({
          selector: `form:nth-of-type(${index + 1})`,
          type: 'contact'
        });
      }
    });

    return formData;
  });

  return forms;
}

// Fill and submit a form
async function fillForm(
  page: Page,
  formSelector: string,
  contactInfo: { name: string; email: string; phone: string },
  business: Business
): Promise<{ success: boolean; error?: string }> {
  try {
    // Wait for form to be visible
    await page.waitForSelector(formSelector, { timeout: 5000 });

    // Fill in name field
    const nameSelectors = [
      'input[name*="name" i]',
      'input[id*="name" i]',
      'input[type="text"]:first-of-type',
      'input[placeholder*="nombre" i]',
      'input[placeholder*="name" i]'
    ];
    for (const selector of nameSelectors) {
      try {
        const field = await page.$(selector);
        if (field) {
          await field.fill(contactInfo.name);
          break;
        }
      } catch {}
    }

    // Fill in email field
    const emailSelectors = [
      'input[name*="email" i]',
      'input[id*="email" i]',
      'input[type="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="correo" i]'
    ];
    for (const selector of emailSelectors) {
      try {
        const field = await page.$(selector);
        if (field) {
          await field.fill('info@gringoconnection.com');
          break;
        }
      } catch {}
    }

    // Fill in phone field if available
    const phoneSelectors = [
      'input[name*="phone" i]',
      'input[name*="tel" i]',
      'input[id*="phone" i]',
      'input[id*="tel" i]',
      'input[type="tel"]'
    ];
    for (const selector of phoneSelectors) {
      try {
        const field = await page.$(selector);
        if (field) {
          await field.fill(contactInfo.phone);
          break;
        }
      } catch {}
    }

    // Fill in message field
    const messageSelectors = [
      'textarea[name*="message" i]',
      'textarea[id*="message" i]',
      'textarea[name*="comment" i]',
      'textarea[id*="comment" i]',
      'textarea[placeholder*="mensaje" i]',
      'textarea[placeholder*="message" i]'
    ];
    for (const selector of messageSelectors) {
      try {
        const field = await page.$(selector);
        if (field) {
          await field.fill(MESSAGE_TEMPLATE);
          break;
        }
      } catch {}
    }

    // Try to submit the form
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Enviar")',
      'button:has-text("Submit")',
      'button:has-text("Enviar")',
      'button:has-text("Contactar")',
      'button:has-text("Contact")'
    ];

    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const submitButton = await page.$(selector);
        if (submitButton) {
          await submitButton.click();
          submitted = true;
          
          // Wait a bit to see if form submission triggers navigation or success message
          await page.waitForTimeout(2000);
          break;
        }
      } catch {}
    }

    // If no submit button found, try form submit
    if (!submitted) {
      try {
        await page.evaluate((sel) => {
          const form = document.querySelector(sel) as HTMLFormElement;
          if (form) form.submit();
        }, formSelector);
        await page.waitForTimeout(2000);
        submitted = true;
      } catch {}
    }

    return { success: submitted };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Process a single business
export async function processBusiness(
  business: Business,
  config: AgentConfig
): Promise<FormSubmission> {
  const contactInfo = generateContactInfo(config.agentId);
  let browser: Browser | null = null;

  try {
    // Rate limiting
    await formRateLimiter.waitUntilAllowed(`form-submit-${config.agentId}`);

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: config.userAgent,
      viewport: { width: 1920, height: 1080 },
      locale: 'es-CO',
      timezoneId: 'America/Bogota'
    });

    const page = await context.newPage();

    // Navigate to website
    await page.goto(business.website, {
      waitUntil: 'domcontentloaded',
      timeout: config.timeout
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // Find forms
    const forms = await findForms(page);

    if (forms.length === 0) {
      return {
        business,
        success: false,
        formFound: false,
        submitted: false,
        message: 'No contact forms found on page',
        timestamp: new Date().toISOString()
      };
    }

    // Try to fill the first form found
    const form = forms[0];
    const result = await fillForm(page, form.selector, contactInfo, business);

    await browser.close();
    browser = null;

    return {
      business,
      success: result.success,
      formFound: true,
      submitted: result.success,
      message: result.success 
        ? 'Form successfully submitted'
        : `Failed to submit: ${result.error || 'Unknown error'}`,
      error: result.error,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    return {
      business,
      success: false,
      formFound: false,
      submitted: false,
      message: `Error processing business: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

// Generate user agent string for agent
function generateUserAgent(agentId: number): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  return userAgents[agentId % userAgents.length];
}

// Main agent function
export async function runFormFillingAgent(
  agentId: number,
  businesses: Business[],
  maxForms: number = 10
): Promise<FormSubmission[]> {
  const config: AgentConfig = {
    agentId,
    maxFormsPerRun: maxForms,
    timeout: 30000,
    userAgent: generateUserAgent(agentId)
  };

  const results: FormSubmission[] = [];
  const businessesToProcess = businesses.slice(0, maxForms);

  console.log(`🤖 Agent ${agentId}: Processing ${businessesToProcess.length} businesses...`);

  for (const business of businessesToProcess) {
    const result = await processBusiness(business, config);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Agent ${agentId}: Successfully submitted form for ${business.name}`);
    } else {
      console.log(`❌ Agent ${agentId}: Failed for ${business.name} - ${result.message}`);
    }

    // Small delay between businesses
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // This would be called from the orchestrator
  console.log('Form filling agent module loaded');
}
