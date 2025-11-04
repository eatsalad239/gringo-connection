#!/usr/bin/env tsx

/**
 * 🔍 INTELLIGENT BUSINESS DISCOVERY
 * 
 * Find Medellín businesses by type and extract contact information
 * - Uses Google Search API / Business Directories
 * - Extracts business details
 * - Finds website URLs and contact forms
 * - Prioritizes by business size and website quality
 */

import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();
const BUSINESSES_DB = join(ROOT_DIR, 'content/discovered-businesses.json');

interface DiscoveredBusiness {
  id: string;
  name: string;
  type: string;
  website: string;
  phone?: string;
  address?: string;
  city: string;
  country: string;
  hasContactForm: boolean;
  formUrl?: string;
  businessPhone?: string;
  businessEmail?: string;
  discoveredAt: number;
  priority: number;
}

class BusinessDiscovery {
  // Top 10 business types in Medellín with search terms
  private readonly BUSINESS_CATEGORIES = [
    {
      type: 'Restaurantes y Cafés',
      keywords: [
        'restaurantes medellín',
        'cafés medellín',
        'comedores medellín',
        'asadero medellín',
        'pizzería medellín'
      ],
      searchTerms: [
        'site:com.co restaurante medellín',
        'site:co restaurante medellín',
        '"restaurante" "medellín" "contacto"'
      ]
    },
    {
      type: 'Belleza y Salones',
      keywords: [
        'peluquerías medellín',
        'salones de belleza medellín',
        'spas medellín',
        'barbería medellín',
        'salón estética medellín'
      ],
      searchTerms: [
        'site:com.co peluquería medellín',
        '"salón de belleza" "medellín" web'
      ]
    },
    {
      type: 'Agencias Inmobiliarias',
      keywords: [
        'inmobiliarias medellín',
        'bienes raíces medellín',
        'apartamentos medellín',
        'agencias propiedad medellín'
      ],
      searchTerms: [
        'site:com.co inmobiliaria medellín',
        '"agencia inmobiliaria" "medellín"'
      ]
    },
    {
      type: 'Clínicas Médicas',
      keywords: [
        'clínicas medellín',
        'consultorios médicos medellín',
        'dentistas medellín',
        'hospitales medellín'
      ],
      searchTerms: [
        'site:com.co clínica medellín',
        '"consultorio" "medellín" "contacto"'
      ]
    },
    {
      type: 'Tiendas Retail',
      keywords: [
        'tiendas medellín',
        'boutiques medellín',
        'comercios medellín',
        'tiendas ropa medellín'
      ],
      searchTerms: [
        'site:com.co tienda medellín',
        '"tienda online" "medellín"'
      ]
    },
    {
      type: 'Oficinas Legales',
      keywords: [
        'abogados medellín',
        'bufetes medellín',
        'asesorías legales medellín',
        'servicios jurídicos medellín'
      ],
      searchTerms: [
        'site:com.co abogado medellín',
        '"bufete" "medellín" "contacto"'
      ]
    },
    {
      type: 'Gimnasios y Fitness',
      keywords: [
        'gimnasios medellín',
        'academias fitness medellín',
        'yoga medellín',
        'centros de entrenamiento medellín'
      ],
      searchTerms: [
        'site:com.co gimnasio medellín',
        '"academia de fitness" "medellín"'
      ]
    },
    {
      type: 'Hoteles y Turismo',
      keywords: [
        'hoteles medellín',
        'hostales medellín',
        'alojamientos medellín',
        'agencias turismo medellín'
      ],
      searchTerms: [
        'site:com.co hotel medellín',
        '"hotel" "medellín" "reserva"'
      ]
    },
    {
      type: 'Servicios Automotrices',
      keywords: [
        'talleres mecánicos medellín',
        'servicio de autos medellín',
        'concesionarios medellín',
        'vulcanizadoras medellín'
      ],
      searchTerms: [
        'site:com.co taller mecánico medellín',
        '"servicio de autos" "medellín"'
      ]
    },
    {
      type: 'Servicios del Hogar',
      keywords: [
        'plomería medellín',
        'electricidad medellín',
        'servicios de reparación medellín',
        'mantenimiento medellín',
        'construcción medellín'
      ],
      searchTerms: [
        'site:com.co plomería medellín',
        '"servicio de reparación" "medellín"'
      ]
    }
  ];

  // Simulated business database (in production, would use Google Business API)
  private readonly MOCK_BUSINESSES: DiscoveredBusiness[] = [
    // Restaurantes
    { id: 'BUS-001', name: 'Andrés Carne de Res', type: 'Restaurantes y Cafés', website: 'https://www.andrecarner.com', city: 'Medellín', country: 'Colombia', hasContactForm: true, formUrl: 'https://www.andrecarner.com/contacto', priority: 9, discoveredAt: Date.now(), businessPhone: '+57-4-3106000' },
    { id: 'BUS-002', name: 'Carmen Café', type: 'Restaurantes y Cafés', website: 'https://www.carmencafe.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, formUrl: 'https://www.carmencafe.co/formulario', priority: 8, discoveredAt: Date.now() },
    { id: 'BUS-003', name: 'Junín Gastro-Bar', type: 'Restaurantes y Cafés', website: 'https://www.junin.com.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 8, discoveredAt: Date.now() },
    { id: 'BUS-004', name: 'Éclipse Café', type: 'Restaurantes y Cafés', website: 'https://www.eclipsecafe.co', city: 'Medellín', country: 'Colombia', hasContactForm: false, priority: 7, discoveredAt: Date.now() },
    
    // Belleza
    { id: 'BUS-005', name: 'Studio de Belleza Laura', type: 'Belleza y Salones', website: 'https://www.studiobellezalaura.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 8, discoveredAt: Date.now() },
    { id: 'BUS-006', name: 'Salón Diego Velasco', type: 'Belleza y Salones', website: 'https://www.diegovelasco.com', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 9, discoveredAt: Date.now() },
    { id: 'BUS-007', name: 'Barbería Santo Domingo', type: 'Belleza y Salones', website: 'https://www.barberiastodomingo.co', city: 'Medellín', country: 'Colombia', hasContactForm: false, priority: 6, discoveredAt: Date.now() },
    { id: 'BUS-008', name: 'Spa Relajación Total', type: 'Belleza y Salones', website: 'https://www.sparelajaciontotal.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 7, discoveredAt: Date.now() },
    
    // Inmobiliarias
    { id: 'BUS-009', name: 'Inmobiliaria Medellín Select', type: 'Agencias Inmobiliarias', website: 'https://www.medellinselect.com.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 9, discoveredAt: Date.now() },
    { id: 'BUS-010', name: 'Properati Medellín', type: 'Agencias Inmobiliarias', website: 'https://www.properati.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 10, discoveredAt: Date.now() },
    
    // Clínicas
    { id: 'BUS-011', name: 'Clínica Shaio', type: 'Clínicas Médicas', website: 'https://www.clinicashaio.com', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 10, discoveredAt: Date.now() },
    { id: 'BUS-012', name: 'Consultorio Dental Dr. González', type: 'Clínicas Médicas', website: 'https://www.dentalgonzalez.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 7, discoveredAt: Date.now() },
    
    // Tiendas
    { id: 'BUS-013', name: 'Éxito Medellín', type: 'Tiendas Retail', website: 'https://www.exito.com', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 10, discoveredAt: Date.now() },
    { id: 'BUS-014', name: 'Ropa Urban Chic', type: 'Tiendas Retail', website: 'https://www.urbanchic.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 6, discoveredAt: Date.now() },
    
    // Abogados
    { id: 'BUS-015', name: 'Bufete Jurídico Medellín', type: 'Oficinas Legales', website: 'https://www.bufetemedellin.com.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 8, discoveredAt: Date.now() },
    { id: 'BUS-016', name: 'Asesorías Legales Colombia', type: 'Oficinas Legales', website: 'https://www.asesoriascolombia.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 7, discoveredAt: Date.now() },
    
    // Gimnasios
    { id: 'BUS-017', name: 'BodyTech Medellín', type: 'Gimnasios y Fitness', website: 'https://www.bodytech.com.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 9, discoveredAt: Date.now() },
    { id: 'BUS-018', name: 'Smart Fit Medellín', type: 'Gimnasios y Fitness', website: 'https://www.smartfit.com.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 9, discoveredAt: Date.now() },
    
    // Hoteles
    { id: 'BUS-019', name: 'Hotel Dann Carina', type: 'Hoteles y Turismo', website: 'https://www.danncarina.com', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 9, discoveredAt: Date.now() },
    { id: 'BUS-020', name: 'Hostal Casa Kiwi', type: 'Hoteles y Turismo', website: 'https://www.casakiwi.co', city: 'Medellín', country: 'Colombia', hasContactForm: true, priority: 7, discoveredAt: Date.now() },
  ];

  /**
   * Discover businesses by category
   */
  async discoverBusinessesByCategory(
    businessType: string,
    limit: number = 50
  ): Promise<DiscoveredBusiness[]> {
    console.log(`🔍 Discovering ${businessType} businesses in Medellín...`);

    const category = this.BUSINESS_CATEGORIES.find(c => c.type === businessType);
    if (!category) {
      console.log(`⚠️ Category not found: ${businessType}`);
      return [];
    }

    // Filter mock businesses by type
    const discovered = this.MOCK_BUSINESSES
      .filter(b => b.type === businessType)
      .slice(0, limit)
      .map(b => ({
        ...b,
        discoveredAt: Date.now()
      }));

    console.log(`✅ Found ${discovered.length} ${businessType} businesses`);
    return discovered;
  }

  /**
   * Get all businesses ready for targeting
   */
  async getAllTargetBusinesses(): Promise<DiscoveredBusiness[]> {
    console.log(`\n🏢 DISCOVERING TARGET BUSINESSES FOR ALL CATEGORIES\n`);

    const allBusinesses: DiscoveredBusiness[] = [];

    for (const category of this.BUSINESS_CATEGORIES) {
      const businesses = await this.discoverBusinessesByCategory(category.type, 2);
      allBusinesses.push(...businesses);
    }

    // Save to database
    writeFileSync(BUSINESSES_DB, JSON.stringify(allBusinesses, null, 2), 'utf-8');

    console.log(`\n📊 DISCOVERY COMPLETE`);
    console.log(`├─ Total Businesses: ${allBusinesses.length}`);
    console.log(`├─ With Contact Forms: ${allBusinesses.filter(b => b.hasContactForm).length}`);
    console.log(`├─ Avg Priority: ${(allBusinesses.reduce((s, b) => s + b.priority, 0) / allBusinesses.length).toFixed(1)}`);
    console.log(`└─ Saved to: ${BUSINESSES_DB}\n`);

    return allBusinesses;
  }

  /**
   * Get high-priority targets for form filling
   */
  getHighPriorityTargets(minPriority: number = 7): DiscoveredBusiness[] {
    if (!existsSync(BUSINESSES_DB)) {
      console.log(`⚠️ No business database found. Run discovery first.`);
      return [];
    }

    const businesses = JSON.parse(readFileSync(BUSINESSES_DB, 'utf-8'));
    return businesses
      .filter((b: DiscoveredBusiness) => b.priority >= minPriority && b.hasContactForm)
      .sort((a: DiscoveredBusiness, b: DiscoveredBusiness) => b.priority - a.priority);
  }

  /**
   * Format businesses for rapid form filler
   */
  formatForFormFiller(businesses: DiscoveredBusiness[]) {
    return businesses.map(b => ({
      url: b.formUrl || b.website,
      name: b.name,
      businessName: b.name,
      businessEmail: b.businessEmail || 'info@' + new URL(b.website).hostname,
      businessPhone: b.businessPhone || 'N/A'
    }));
  }

  async generateDiscoveryReport(): Promise<void> {
    const businesses = JSON.parse(readFileSync(BUSINESSES_DB, 'utf-8'));

    const report = {
      timestamp: new Date().toISOString(),
      totalDiscovered: businesses.length,
      byCategory: {} as any,
      highPriority: businesses.filter((b: DiscoveredBusiness) => b.priority >= 8).length,
      withContactForms: businesses.filter((b: DiscoveredBusiness) => b.hasContactForm).length,
      topBusinesses: businesses.slice(0, 10)
    };

    // Count by category
    for (const business of businesses) {
      if (!report.byCategory[business.type]) {
        report.byCategory[business.type] = 0;
      }
      report.byCategory[business.type]++;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 BUSINESS DISCOVERY REPORT`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Discovered: ${report.totalDiscovered}`);
    console.log(`High Priority (8+): ${report.highPriority}`);
    console.log(`With Contact Forms: ${report.withContactForms}`);
    console.log(`\nBy Category:`);
    for (const [cat, count] of Object.entries(report.byCategory)) {
      console.log(`  • ${cat}: ${count}`);
    }
    console.log(`${'='.repeat(60)}\n`);

    writeFileSync(
      join(ROOT_DIR, 'content/business-discovery-report.json'),
      JSON.stringify(report, null, 2),
      'utf-8'
    );
  }
}

// Main execution
async function main() {
  const discovery = new BusinessDiscovery();
  const command = process.argv[2] || 'discover';

  try {
    switch (command) {
      case 'discover':
        await discovery.getAllTargetBusinesses();
        await discovery.generateDiscoveryReport();
        break;

      case 'targets':
        const targets = discovery.getHighPriorityTargets(8);
        console.log(`\n🎯 HIGH PRIORITY TARGETS (Priority >= 8)\n`);
        targets.forEach(t => {
          console.log(`✅ ${t.name} (${t.type}) - Priority: ${t.priority}`);
          console.log(`   Website: ${t.website}`);
          console.log(`   Form: ${t.formUrl || 'Contact page'}\n`);
        });
        break;

      default:
        console.log(`Usage: tsx business-discovery.ts [command]`);
        console.log(`  discover - Discover all target businesses`);
        console.log(`  targets  - Show high-priority targets`);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { BusinessDiscovery, DiscoveredBusiness };
