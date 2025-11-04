/**
 * Colombian Business Data Scraper
 * Scrapes business data from Yellow Pages, Google Maps, and other sources
 * Prioritizes high-net-worth owner-occupied businesses
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { llm } from './providers.js';

interface ColombianBusiness {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  city: string;
  industry: string;
  revenue_estimate?: 'high' | 'medium' | 'low';
  owner_occupied: boolean;
  pain_points: string[];
  services_needed: string[];
  contact_priority: number; // 1-10, 10 being highest priority
  data_source: string;
  scraped_at: string;
}

const DATA_DIR = join(process.cwd(), 'data');
const BUSINESS_DATA_FILE = join(DATA_DIR, 'colombian_businesses.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  require('fs').mkdirSync(DATA_DIR, { recursive: true });
}

// Industry categories with typical pain points and services
const INDUSTRY_PROFILES = {
  'restaurantes': {
    pain_points: ['online orders', 'customer reviews', 'menu digitization', 'loyalty programs', 'delivery integration'],
    services: ['website', 'online ordering system', 'social media management', 'customer app']
  },
  'clinicas': {
    pain_points: ['patient management', 'appointment scheduling', 'medical records', 'insurance billing', 'telemedicine'],
    services: ['patient portal', 'appointment system', 'telemedicine platform', 'billing automation']
  },
  'abogados': {
    pain_points: ['case management', 'client communication', 'document automation', 'billing', 'court deadlines'],
    services: ['legal case management', 'client portal', 'document automation', 'billing system']
  },
  'contadores': {
    pain_points: ['tax compliance', 'client bookkeeping', 'financial reporting', 'audit preparation', 'invoice management'],
    services: ['accounting software', 'tax automation', 'client portal', 'financial dashboard']
  },
  'inmobiliarias': {
    pain_points: ['property listings', 'client management', 'market analysis', 'contract automation', 'virtual tours'],
    services: ['property website', 'MLS integration', 'client CRM', 'virtual tour platform']
  },
  'educacion': {
    pain_points: ['student management', 'online learning', 'payment processing', 'communication', 'progress tracking'],
    services: ['learning management system', 'student portal', 'payment integration', 'communication platform']
  },
  'startups': {
    pain_points: ['funding', 'growth hacking', 'product development', 'marketing', 'operations'],
    services: ['MVP development', 'growth marketing', 'automation', 'funding strategy']
  }
};

// Cities to target (starting with Medellín area)
const TARGET_CITIES = [
  'Medellín', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella',
  'Bogotá', 'Cali', 'Barranquilla', 'Cartagena', 'Pereira'
];

// Load existing business data
function loadBusinessData(): ColombianBusiness[] {
  try {
    if (existsSync(BUSINESS_DATA_FILE)) {
      return JSON.parse(readFileSync(BUSINESS_DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('Failed to load existing business data:', e);
  }
  return [];
}

// Save business data
function saveBusinessData(businesses: ColombianBusiness[]): void {
  writeFileSync(BUSINESS_DATA_FILE, JSON.stringify(businesses, null, 2));
}

// Analyze business for revenue estimate and owner-occupied status
async function analyzeBusiness(business: Partial<ColombianBusiness>): Promise<ColombianBusiness> {
  const prompt = `Analyze this Colombian business and provide insights:

Business Name: ${business.name}
Industry: ${business.industry}
Address: ${business.address}
City: ${business.city}
Website: ${business.website || 'None'}
Phone: ${business.phone || 'None'}

Based on Colombian market knowledge, estimate:
1. Revenue category: high/medium/low (high = >$500k/year, medium = $100k-500k, low = <$100k)
2. Owner occupied: true/false (is this likely a family-owned business where owner is actively involved?)
3. Pain points: 3-5 specific problems this business likely faces
4. Services needed: 3-5 digital solutions that would help
5. Contact priority: 1-10 (10 = highest priority for outreach)

Output JSON:
{
  "revenue_estimate": "high|medium|low",
  "owner_occupied": true|false,
  "pain_points": ["pain1", "pain2", "pain3"],
  "services_needed": ["service1", "service2", "service3"],
  "contact_priority": 1-10
}`;

  const result = await llm.text(prompt, {
    maxTokens: 500,
    temperature: 0.3,
    system: 'You are a Colombian business analyst. Output only valid JSON.'
  });

  let analysis = {
    revenue_estimate: 'medium' as const,
    owner_occupied: true,
    pain_points: [],
    services_needed: [],
    contact_priority: 5
  };

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analysis = { ...analysis, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse business analysis:', e);
    }
  }

  return {
    ...business,
    ...analysis,
    scraped_at: new Date().toISOString()
  } as ColombianBusiness;
}

// Scrape Yellow Pages Colombia
async function scrapeYellowPages(city: string, industry: string): Promise<Partial<ColombianBusiness>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const businesses: Partial<ColombianBusiness>[] = [];

  try {
    const page = await context.newPage();

    // Search query for Yellow Pages
    const searchQuery = `${industry} ${city} Colombia`;
    const searchUrl = `https://www.paginasamarillas.com.co/buscar/${encodeURIComponent(searchQuery)}`;

    console.log(`🔍 Scraping Yellow Pages: ${searchQuery}`);

    await page.goto(searchUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Extract business listings
    const listings = await page.$$eval('.business-card, .listing-item, [data-business]', (elements) => {
      return elements.slice(0, 20).map(el => {
        const name = el.querySelector('h2, .business-name, .title')?.textContent?.trim();
        const address = el.querySelector('.address, .location')?.textContent?.trim();
        const phone = el.querySelector('.phone, .tel')?.textContent?.trim();
        const website = el.querySelector('a[href*="http"]')?.getAttribute('href');

        return {
          name,
          address,
          phone,
          website: website?.startsWith('http') ? website : undefined
        };
      }).filter(item => item.name && item.address);
    });

    for (const listing of listings) {
      businesses.push({
        ...listing,
        city,
        industry,
        data_source: 'yellowpages'
      });
    }

    console.log(`✅ Found ${businesses.length} businesses in Yellow Pages`);

  } catch (e) {
    console.warn(`Failed to scrape Yellow Pages for ${city}/${industry}:`, e);
  } finally {
    await browser.close();
  }

  return businesses;
}

// Scrape Google Maps business data
async function scrapeGoogleMaps(city: string, industry: string): Promise<Partial<ColombianBusiness>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const businesses: Partial<ColombianBusiness>[]> = [];

  try {
    const page = await context.newPage();

    // Google Maps search
    const searchQuery = `${industry} en ${city} Colombia`;
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

    console.log(`🗺️  Scraping Google Maps: ${searchQuery}`);

    await page.goto(mapsUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Click "Accept cookies" if present
    try {
      await page.click('button:has-text("Aceptar"), button:has-text("Accept")', { timeout: 5000 });
    } catch (e) {
      // Continue if no cookie banner
    }

    // Wait for results to load
    await page.waitForSelector('[role="article"], .Nv2PK, [data-result-index]', { timeout: 10000 });

    // Extract business data
    const results = await page.$$eval('[role="article"], .Nv2PK, [data-result-index]', (elements) => {
      return elements.slice(0, 15).map(el => {
        const name = el.querySelector('h3, .fontHeadlineSmall, .qBF1Pd')?.textContent?.trim();
        const address = el.querySelector('[data-item-id*="address"], .Io6YTe')?.textContent?.trim();
        const rating = el.querySelector('.MW4etd, .ZkP5Je')?.textContent?.trim();

        return {
          name,
          address,
          rating: rating ? parseFloat(rating) : undefined
        };
      }).filter(item => item.name);
    });

    for (const result of results) {
      businesses.push({
        ...result,
        city,
        industry,
        data_source: 'google_maps'
      });
    }

    console.log(`✅ Found ${businesses.length} businesses in Google Maps`);

  } catch (e) {
    console.warn(`Failed to scrape Google Maps for ${city}/${industry}:`, e);
  } finally {
    await browser.close();
  }

  return businesses;
}

// Main scraping function
export async function scrapeColombianBusinesses(targetCount: number = 50000): Promise<ColombianBusiness[]> {
  const existingData = loadBusinessData();
  console.log(`📊 Starting with ${existingData.length} existing businesses`);

  let allBusinesses = [...existingData];
  const industries = Object.keys(INDUSTRY_PROFILES);

  // Scrape data from multiple sources
  for (const city of TARGET_CITIES) {
    if (allBusinesses.length >= targetCount) break;

    for (const industry of industries) {
      if (allBusinesses.length >= targetCount) break;

      console.log(`🏙️  Scraping ${city} - ${industry} (${allBusinesses.length}/${targetCount})`);

      // Scrape from multiple sources
      const [yellowPagesData, googleMapsData] = await Promise.all([
        scrapeYellowPages(city, industry),
        scrapeGoogleMaps(city, industry)
      ]);

      // Combine and deduplicate
      const newBusinesses = [...yellowPagesData, ...googleMapsData];
      const uniqueBusinesses = newBusinesses.filter(newBiz =>
        !allBusinesses.some(existing =>
          existing.name?.toLowerCase() === newBiz.name?.toLowerCase() &&
          existing.city === newBiz.city
        )
      );

      console.log(`✨ Found ${uniqueBusinesses.length} new unique businesses`);

      // Analyze each business
      for (const business of uniqueBusinesses) {
        if (allBusinesses.length >= targetCount) break;

        const analyzedBusiness = await analyzeBusiness(business);
        allBusinesses.push(analyzedBusiness);

        console.log(`📝 Analyzed: ${analyzedBusiness.name} (${analyzedBusiness.revenue_estimate} revenue, priority: ${analyzedBusiness.contact_priority})`);
      }

      // Save progress every 100 businesses
      if (allBusinesses.length % 100 === 0) {
        saveBusinessData(allBusinesses);
        console.log(`💾 Progress saved: ${allBusinesses.length} businesses`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Sort by priority (highest first)
  allBusinesses.sort((a, b) => b.contact_priority - a.contact_priority);

  saveBusinessData(allBusinesses);
  console.log(`🎯 Completed scraping: ${allBusinesses.length} businesses ready for outreach`);

  return allBusinesses;
}

// Get businesses ready for email campaign
export function getEmailCampaignTargets(): ColombianBusiness[] {
  const businesses = loadBusinessData();

  // Filter for high-priority targets
  return businesses
    .filter(biz => biz.contact_priority >= 7) // Only top 30% priority
    .sort((a, b) => {
      // Sort by revenue (high first), then priority, then owner-occupied
      if (a.revenue_estimate !== b.revenue_estimate) {
        const revenueOrder = { high: 3, medium: 2, low: 1 };
        return revenueOrder[b.revenue_estimate] - revenueOrder[a.revenue_estimate];
      }
      if (a.contact_priority !== b.contact_priority) {
        return b.contact_priority - a.contact_priority;
      }
      return b.owner_occupied ? 1 : -1;
    });
}

// Run scraper if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const targetCount = parseInt(process.argv[2] || '50000');
  scrapeColombianBusinesses(targetCount).catch(console.error);
}