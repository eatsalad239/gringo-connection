/**
 * Business data loader/scraper using cheap APIs
 * Uses Grok API for data enrichment and cheap scraping
 */

import { llm } from '../providers.js';
import type { ColombianBusiness } from '../types/business.js';
import { BusinessScraper } from './businessScraper.js';

export interface BusinessSource {
  name: string;
  email: string;
  phone?: string;
  industry?: string;
  city?: string;
  website?: string;
}

export class BusinessLoader {
  public scraper: BusinessScraper;

  constructor() {
    this.scraper = new BusinessScraper();
  }

  /**
   * Load businesses from CSV/JSON file
   */
  async loadFromFile(filePath: string): Promise<ColombianBusiness[]> {
    const { readFileSync, existsSync } = await import('fs');
    const { extname } = await import('path');

    if (!existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return [];
    }

    const content = readFileSync(filePath, 'utf-8');
    const ext = extname(filePath).toLowerCase();

    if (ext === '.json') {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data.map((item) => this.mapToBusiness(item));
      }
    } else if (ext === '.csv') {
      return this.parseCSV(content);
    }

    return [];
  }

  /**
   * Load businesses by scraping with Grok
   */
  async loadByScraping(queries: string[], city: string = 'Medellín'): Promise<ColombianBusiness[]> {
    const sources = await this.scraper.scrapeMultiple(queries, city);
    return this.enrichBatch(sources);
  }

  /**
   * Parse CSV content
   */
  private parseCSV(content: string): ColombianBusiness[] {
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const businesses: ColombianBusiness[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      if (row.name && row.email) {
        businesses.push(this.mapToBusiness(row));
      }
    }

    return businesses;
  }

  /**
   * Map raw data to ColombianBusiness
   */
  private mapToBusiness(data: any): ColombianBusiness {
    return {
      id: data.id || this.generateId({ name: data.name, email: data.email }),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || data.telefono || '',
      industry: data.industry || data.industria || 'Unknown',
      vertical: data.vertical || this.inferVertical(data.industry || ''),
      city: data.city || data.ciudad || 'Medellín',
      netWorth: (data.netWorth || data.net_worth || 'medium') as 'high' | 'medium' | 'low',
      ownerOccupied: data.ownerOccupied || data.owner_occupied || false,
      website: data.website || data.sitio || '',
      painPoints: data.painPoints || data.pain_points || [],
      estimatedRevenue: data.estimatedRevenue || data.estimated_revenue,
      employeeCount: data.employeeCount || data.employee_count,
    };
  }

  /**
   * Enrich business data using Grok API
   * Takes basic business info and enriches with industry, vertical, pain points, etc.
   */
  async enrichBusiness(source: BusinessSource): Promise<ColombianBusiness> {
    // Use Grok to determine industry, vertical, and pain points
    const prompt = `Analyze this Colombian business and provide detailed information:

Business Name: ${source.name}
Industry: ${source.industry || 'Unknown'}
City: ${source.city || 'Unknown'}
Website: ${source.website || 'None'}

Provide a JSON response with:
{
  "industry": "specific industry name",
  "vertical": "law|clinics|restaurants|education|startups|other",
  "netWorth": "high|medium|low" (estimate based on business type),
  "ownerOccupied": true|false (likely if it's a small business),
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "estimatedRevenue": number (optional, in USD),
  "employeeCount": number (optional)
}

Be specific and accurate.`;

    const result = await llm.text(prompt, {
      maxTokens: 500,
      temperature: 0.3, // Lower temperature for factual analysis
    });

    let enriched: Partial<ColombianBusiness> = {
      industry: source.industry || 'Unknown',
      vertical: 'other',
      netWorth: 'medium',
      ownerOccupied: false,
      painPoints: [],
    };

    if (result.ok && result.text) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          enriched = { ...enriched, ...parsed };
        }
      } catch (e) {
        console.warn('Failed to parse Grok enrichment:', e);
      }
    }

    // Build final business object
    return {
      id: this.generateId(source),
      name: source.name,
      email: source.email,
      phone: source.phone,
      industry: enriched.industry || source.industry || 'Unknown',
      vertical: enriched.vertical || this.inferVertical(source.industry || ''),
      city: source.city || 'Medellín',
      netWorth: enriched.netWorth || 'medium',
      ownerOccupied: enriched.ownerOccupied ?? this.inferOwnerOccupied(source),
      website: source.website,
      painPoints: enriched.painPoints || [],
      estimatedRevenue: enriched.estimatedRevenue,
      employeeCount: enriched.employeeCount,
    };
  }

  /**
   * Batch enrich multiple businesses
   */
  async enrichBatch(sources: BusinessSource[]): Promise<ColombianBusiness[]> {
    const results: ColombianBusiness[] = [];

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((source) => this.enrichBusiness(source))
      );
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < sources.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Generate sample businesses for testing
   * In production, this would load from actual data sources
   */
  generateSampleBusinesses(count: number): ColombianBusiness[] {
    const industries = ['Legal', 'Healthcare', 'Restaurant', 'Education', 'Retail'];
    const cities = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena'];
    const verticals = ['law', 'clinics', 'restaurants', 'education', 'startups'];
    const netWorths: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

    const businesses: ColombianBusiness[] = [];

    for (let i = 0; i < count; i++) {
      const industryIndex = i % industries.length;
      const cityIndex = i % cities.length;
      const verticalIndex = i % verticals.length;
      const netWorthIndex = Math.floor(i / (count / 3)) % netWorths.length;

      businesses.push({
        id: `business-${i + 1}`,
        name: `Empresa ${industries[industryIndex]} ${i + 1}`,
        email: `contacto${i + 1}@empresa${i + 1}.com`,
        phone: `+57 300 ${String(i).padStart(7, '0')}`,
        industry: industries[industryIndex],
        vertical: verticals[verticalIndex],
        city: cities[cityIndex],
        netWorth: netWorths[netWorthIndex],
        ownerOccupied: i % 2 === 0, // 50% owner occupied
        website: i % 3 === 0 ? `https://empresa${i + 1}.com` : undefined,
        painPoints: this.getDefaultPainPoints(verticals[verticalIndex]),
        estimatedRevenue: this.estimateRevenue(netWorths[netWorthIndex]),
        employeeCount: this.estimateEmployees(netWorths[netWorthIndex]),
      });
    }

    return businesses;
  }

  private generateId(source: BusinessSource): string {
    return `business-${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }

  private inferVertical(industry: string): string {
    const lower = industry.toLowerCase();
    if (lower.includes('legal') || lower.includes('law') || lower.includes('abogado')) {
      return 'law';
    }
    if (lower.includes('health') || lower.includes('clinic') || lower.includes('medic')) {
      return 'clinics';
    }
    if (lower.includes('restaurant') || lower.includes('food') || lower.includes('comida')) {
      return 'restaurants';
    }
    if (lower.includes('education') || lower.includes('school') || lower.includes('educación')) {
      return 'education';
    }
    if (lower.includes('startup') || lower.includes('tech') || lower.includes('software')) {
      return 'startups';
    }
    return 'other';
  }

  private inferOwnerOccupied(source: BusinessSource): boolean {
    // Heuristics: likely owner-occupied if small business name or no website
    return !source.website || source.name.length < 30;
  }

  private getDefaultPainPoints(vertical: string): string[] {
    const painPoints: Record<string, string[]> = {
      law: ['Tiempo excesivo en intake de clientes', 'Comunicación manual con clientes'],
      clinics: ['Agendamiento manual de pacientes', 'Falta de recordatorios automáticos'],
      restaurants: ['Pedidos por teléfono', 'Gestión manual de reservas'],
      education: ['Procesos administrativos manuales', 'Comunicación con padres'],
      startups: ['Falta de automatización', 'Procesos manuales costosos'],
    };

    return painPoints[vertical] || ['Procesos manuales', 'Falta de automatización'];
  }

  private estimateRevenue(netWorth: string): number {
    switch (netWorth) {
      case 'high':
        return 500000 + Math.random() * 2000000; // $500K - $2.5M
      case 'medium':
        return 100000 + Math.random() * 400000; // $100K - $500K
      case 'low':
        return 10000 + Math.random() * 90000; // $10K - $100K
      default:
        return 50000;
    }
  }

  private estimateEmployees(netWorth: string): number {
    switch (netWorth) {
      case 'high':
        return 50 + Math.floor(Math.random() * 450); // 50-500
      case 'medium':
        return 10 + Math.floor(Math.random() * 40); // 10-50
      case 'low':
        return 1 + Math.floor(Math.random() * 9); // 1-10
      default:
        return 5;
    }
  }
}
