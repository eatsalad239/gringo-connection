/**
 * Medellín Business Data Scraper - Colombian Spanish Focus
 * Scrapes business data from Medellín, Colombia sources
 * Prioritizes high-net-worth owner-occupied businesses in Spanish
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { llm } from './providers.js';

interface MedellinBusiness {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  neighborhood: string; // Medellín neighborhoods
  industry: string;
  revenue_estimate?: 'alto' | 'medio' | 'bajo';
  owner_occupied: boolean;
  pain_points: string[];
  services_needed: string[];
  contact_priority: number; // 1-10, 10 being highest priority
  data_source: string;
  scraped_at: string;
}

const DATA_DIR = join(process.cwd(), 'data');
const BUSINESS_DATA_FILE = join(DATA_DIR, 'medellin_businesses.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  require('fs').mkdirSync(DATA_DIR, { recursive: true });
}

// Medellín neighborhoods and business districts
const MEDELLIN_NEIGHBORHOODS = [
  'El Poblado', 'Laureles', 'Centro', 'Envigado', 'Itagüí',
  'Sabaneta', 'Belén', 'Robledo', 'Aranjuez', 'Villa Hermosa',
  'Buenos Aires', 'Manrique', 'Castilla', 'Doce de Octubre', 'Popular'
];

// Industry categories with Colombian Spanish pain points and services
const INDUSTRY_PROFILES = {
  'restaurantes': {
    pain_points: ['pedidos en línea', 'reseñas de clientes', 'menú digital', 'programas de fidelidad', 'entrega a domicilio', 'reservas online'],
    services: ['sitio web para restaurante', 'sistema de pedidos online', 'gestión de reseñas', 'app móvil para clientes', 'sistema de delivery']
  },
  'clínicas': {
    pain_points: ['citas médicas', 'historias clínicas digitales', 'facturación médica', 'telemedicina', 'recordatorios de citas', 'consentimientos informados'],
    services: ['sistema de citas online', 'historia clínica electrónica', 'facturación automática', 'plataforma de telemedicina', 'app para pacientes']
  },
  'abogados': {
    pain_points: ['gestión de casos legales', 'documentos automatizados', 'plazos procesales', 'facturación jurídica', 'comunicación con clientes', 'archivos digitales'],
    services: ['software de gestión legal', 'automatización documental', 'sistema de recordatorios', 'portal del cliente', 'facturación jurídica']
  },
  'contadores': {
    pain_points: ['declaraciones tributarias', 'contabilidad digital', 'cierres contables', 'facturación electrónica', 'reportes financieros', 'auditorías'],
    services: ['software contable colombiano', 'automatización tributaria', 'facturación electrónica', 'dashboard financiero', 'preparación de auditorías']
  },
  'inmobiliarias': {
    pain_points: ['listados de propiedades', 'visitas virtuales', 'contratos digitales', 'gestión de arrendamientos', 'marketing inmobiliario', 'CRM para agentes'],
    services: ['sitio web inmobiliario', 'tours virtuales 360°', 'sistema de contratos', 'CRM inmobiliario', 'marketing digital']
  },
  'comercios': {
    pain_points: ['ventas online', 'inventario digital', 'punto de venta', 'gestión de proveedores', 'marketing local', 'fidelización de clientes'],
    services: ['tienda virtual', 'sistema POS', 'gestión de inventario', 'marketing local', 'programas de fidelización']
  },
  'empresas': {
    pain_points: ['automatización de procesos', 'gestión documental', 'CRM empresarial', 'facturación masiva', 'reportes ejecutivos', 'productividad'],
    services: ['automatización empresarial', 'gestión documental', 'CRM personalizado', 'facturación electrónica', 'business intelligence']
  },
  'hoteles': {
    pain_points: ['reservas online', 'gestión de habitaciones', 'check-in digital', 'marketing turístico', 'reseñas y reputación', 'sistemas de pago'],
    services: ['motor de reservas', 'sistema PMS', 'check-in sin contacto', 'gestión de reseñas', 'marketing turístico']
  }
};

// Load existing business data
function loadBusinessData(): MedellinBusiness[] {
  try {
    if (existsSync(BUSINESS_DATA_FILE)) {
      return JSON.parse(readFileSync(BUSINESS_DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('No se pudo cargar la base de datos existente:', e);
  }
  return [];
}

// Save business data
function saveBusinessData(businesses: MedellinBusiness[]): void {
  writeFileSync(BUSINESS_DATA_FILE, JSON.stringify(businesses, null, 2));
}

// Analyze business for revenue estimate and owner-occupied status (in Spanish)
async function analyzeBusiness(business: Partial<MedellinBusiness>): Promise<MedellinBusiness> {
  const prompt = `Analiza este negocio de Medellín y proporciona información detallada en español colombiano:

Datos del negocio:
- Nombre: ${business.name}
- Industria: ${business.industry}
- Barrio: ${business.neighborhood}
- Dirección: ${business.address}
- Sitio web: ${business.website || 'No disponible'}
- Teléfono: ${business.phone || 'No disponible'}

Basado en el mercado colombiano y conocimiento local de Medellín, estima:
1. Estimación de ingresos: alto/medio/bajo (alto = más de $200M COP/año, medio = $50M-200M, bajo = menos de $50M)
2. Propietario operativo: true/false (¿es este un negocio familiar donde el dueño está activamente involucrado?)
3. Puntos de dolor: 3-5 problemas específicos que enfrenta este negocio en Medellín
4. Servicios necesarios: 3-5 soluciones digitales que ayudarían
5. Prioridad de contacto: 1-10 (10 = máxima prioridad para outreach)

Contexto colombiano:
- Considera la economía de Medellín y el barrio específico
- Piensa en regulaciones locales, competencia, y tendencias digitales
- Enfócate en necesidades específicas de negocios colombianos

Output JSON:
{
  "revenue_estimate": "alto|medio|bajo",
  "owner_occupied": true|false,
  "pain_points": ["dolor1", "dolor2", "dolor3"],
  "services_needed": ["servicio1", "servicio2", "servicio3"],
  "contact_priority": 1-10
}`;

  const result = await llm.text(prompt, {
    maxTokens: 600,
    temperature: 0.3,
    system: 'Eres un analista de negocios colombiano especializado en Medellín. Output solo JSON válido.',
  });

  let analysis = {
    revenue_estimate: 'medio' as const,
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
      console.warn('No se pudo analizar la respuesta del negocio:', e);
    }
  }

  return {
    ...business,
    ...analysis,
    scraped_at: new Date().toISOString()
  } as MedellinBusiness;
}

// Scrape Medellín Yellow Pages
async function scrapeMedellinYellowPages(neighborhood: string, industry: string): Promise<Partial<MedellinBusiness>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const businesses: Partial<MedellinBusiness>[] = [];

  try {
    const page = await context.newPage();

    // Search query for Medellín Yellow Pages
    const searchQuery = `${industry} ${neighborhood} Medellín Colombia`;
    const searchUrl = `https://www.paginasamarillas.com.co/buscar/${encodeURIComponent(searchQuery)}`;

    console.log(`🔍 Scraping Páginas Amarillas: ${searchQuery}`);

    await page.goto(searchUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Extract business listings
    const listings = await page.$$eval('.business-card, .listing-item, [data-business]', (elements) => {
      return elements.slice(0, 15).map(el => {
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
        neighborhood,
        industry,
        data_source: 'paginasamarillas_medellin'
      });
    }

    console.log(`✅ Encontrados ${businesses.length} negocios en Páginas Amarillas`);

  } catch (e) {
    console.warn(`No se pudo scrapear Páginas Amarillas para ${neighborhood}/${industry}:`, e);
  } finally {
    await browser.close();
  }

  return businesses;
}

// Scrape Medellín Google Maps
async function scrapeMedellinGoogleMaps(neighborhood: string, industry: string): Promise<Partial<MedellinBusiness>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const businesses: Partial<MedellinBusiness>[] = [];

  try {
    const page = await context.newPage();

    // Google Maps search
    const searchQuery = `${industry} en ${neighborhood} Medellín Colombia`;
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
      return elements.slice(0, 12).map(el => {
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
        neighborhood,
        industry,
        data_source: 'google_maps_medellin'
      });
    }

    console.log(`✅ Encontrados ${businesses.length} negocios en Google Maps`);

  } catch (e) {
    console.warn(`No se pudo scrapear Google Maps para ${neighborhood}/${industry}:`, e);
  } finally {
    await browser.close();
  }

  return businesses;
}

// Scrape Medellín business directories
async function scrapeMedellinDirectories(): Promise<Partial<MedellinBusiness>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const businesses: Partial<MedellinBusiness>[] = [];

  try {
    const page = await context.newPage();

    // Medellín business directory sites
    const directories = [
      'https://www.medellindirectory.com/businesses',
      'https://www.directoriomedellin.com/',
      'https://www.guiamedellin.com/directorio-empresarial/'
    ];

    for (const directoryUrl of directories) {
      try {
        console.log(`📑 Scraping directorio: ${directoryUrl}`);
        await page.goto(directoryUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Extract businesses from directory
        const directoryBusinesses = await page.$$eval('.business-listing, .company-item, .directory-item', (elements) => {
          return elements.slice(0, 10).map(el => {
            const name = el.querySelector('h3, .business-name, .company-name')?.textContent?.trim();
            const address = el.querySelector('.address, .location')?.textContent?.trim();
            const phone = el.querySelector('.phone, .contact')?.textContent?.trim();
            const industry = el.querySelector('.category, .industry')?.textContent?.trim();

            return {
              name,
              address,
              phone,
              industry
            };
          }).filter(item => item.name);
        });

        for (const business of directoryBusinesses) {
          businesses.push({
            ...business,
            neighborhood: 'Centro', // Default to center if not specified
            data_source: 'directorio_medellin'
          });
        }

      } catch (e) {
        console.warn(`No se pudo scrapear directorio ${directoryUrl}:`, e);
      }
    }

    console.log(`✅ Encontrados ${businesses.length} negocios en directorios`);

  } catch (e) {
    console.warn('Error general en scraping de directorios:', e);
  } finally {
    await browser.close();
  }

  return businesses;
}

// Main scraping function for Medellín
export async function scrapeMedellinBusinesses(targetCount: number = 10000): Promise<MedellinBusiness[]> {
  const existingData = loadBusinessData();
  console.log(`📊 Comenzando con ${existingData.length} negocios existentes`);

  let allBusinesses = [...existingData];
  const industries = Object.keys(INDUSTRY_PROFILES);

  // Scrape data from Medellín sources
  for (const neighborhood of MEDELLIN_NEIGHBORHOODS) {
    if (allBusinesses.length >= targetCount) break;

    for (const industry of industries) {
      if (allBusinesses.length >= targetCount) break;

      console.log(`🏙️  Scraping ${neighborhood} - ${industry} (${allBusinesses.length}/${targetCount})`);

      // Scrape from multiple sources in parallel
      const [yellowPagesData, googleMapsData] = await Promise.all([
        scrapeMedellinYellowPages(neighborhood, industry),
        scrapeMedellinGoogleMaps(neighborhood, industry)
      ]);

      // Combine and deduplicate
      const newBusinesses = [...yellowPagesData, ...googleMapsData];
      const uniqueBusinesses = newBusinesses.filter(newBiz =>
        !allBusinesses.some(existing =>
          existing.name?.toLowerCase() === newBiz.name?.toLowerCase() &&
          existing.neighborhood === newBiz.neighborhood
        )
      );

      console.log(`✨ Encontrados ${uniqueBusinesses.length} negocios únicos nuevos`);

      // Analyze each business
      for (const business of uniqueBusinesses) {
        if (allBusinesses.length >= targetCount) break;

        const analyzedBusiness = await analyzeBusiness(business);
        allBusinesses.push(analyzedBusiness);

        console.log(`📝 Analizado: ${analyzedBusiness.name} (${analyzedBusiness.revenue_estimate} ingresos, prioridad: ${analyzedBusiness.contact_priority})`);
      }

      // Save progress every 50 businesses
      if (allBusinesses.length % 50 === 0) {
        saveBusinessData(allBusinesses);
        console.log(`💾 Progreso guardado: ${allBusinesses.length} negocios`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Also scrape general directories
  if (allBusinesses.length < targetCount) {
    console.log('📑 Scraping directorios generales de Medellín...');
    const directoryData = await scrapeMedellinDirectories();

    for (const business of directoryData) {
      if (allBusinesses.length >= targetCount) break;

      const analyzedBusiness = await analyzeBusiness(business);
      allBusinesses.push(analyzedBusiness);
    }
  }

  // Sort by priority (highest first)
  allBusinesses.sort((a, b) => b.contact_priority - a.contact_priority);

  saveBusinessData(allBusinesses);
  console.log(`🎯 Scraping completado: ${allBusinesses.length} negocios listos para outreach`);

  return allBusinesses;
}

// Get businesses ready for email campaign (prioritized for Medellín)
export function getMedellinEmailCampaignTargets(): MedellinBusiness[] {
  const businesses = loadBusinessData();

  // Filter for high-priority targets in high-value Medellín areas
  const highValueNeighborhoods = ['El Poblado', 'Laureles', 'Centro', 'Envigado', 'Itagüí', 'Sabaneta'];

  return businesses
    .filter(biz =>
      biz.contact_priority >= 7 || // High priority overall
      (biz.contact_priority >= 5 && highValueNeighborhoods.includes(biz.neighborhood)) // Medium priority in high-value areas
    )
    .sort((a, b) => {
      // Sort by revenue (high first), then neighborhood value, then priority, then owner-occupied
      const neighborhoodValueA = highValueNeighborhoods.includes(a.neighborhood) ? 2 : 1;
      const neighborhoodValueB = highValueNeighborhoods.includes(b.neighborhood) ? 2 : 1;

      if (a.revenue_estimate !== b.revenue_estimate) {
        const revenueOrder = { alto: 3, medio: 2, bajo: 1 };
        return revenueOrder[b.revenue_estimate] - revenueOrder[a.revenue_estimate];
      }
      if (neighborhoodValueB !== neighborhoodValueA) {
        return neighborhoodValueB - neighborhoodValueA;
      }
      if (a.contact_priority !== b.contact_priority) {
        return b.contact_priority - a.contact_priority;
      }
      return b.owner_occupied ? 1 : -1;
    });
}

// Run scraper if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const targetCount = parseInt(process.argv[2] || '10000');
  scrapeMedellinBusinesses(targetCount).catch(console.error);
}