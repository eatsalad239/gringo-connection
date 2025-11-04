/**
 * Cheap business data scraper using Grok API
 * Uses Grok to scrape and extract business information from various sources
 */

import { llm } from '../providers.js';
import type { BusinessSource } from './businessLoader.js';

export interface ScrapeConfig {
  source: 'google' | 'yellowpages' | 'facebook' | 'manual';
  query: string;
  city?: string;
  industry?: string;
  maxResults?: number;
}

export class BusinessScraper {
  /**
   * Scrape businesses using Grok API
   * Grok can help extract business data from search results
   */
  async scrapeBusinesses(config: ScrapeConfig): Promise<BusinessSource[]> {
    const prompt = this.buildScrapePrompt(config);

    const result = await llm.text(prompt, {
      maxTokens: 4000,
      temperature: 0.2, // Low temperature for factual extraction
    });

    if (!result.ok || !result.text) {
      console.error('Failed to scrape businesses');
      return [];
    }

    // Parse scraped businesses
    return this.parseScrapedData(result.text);
  }

  /**
   * Build prompt for Grok to scrape business data
   */
  private buildScrapePrompt(config: ScrapeConfig): string {
    const { source, query, city, industry, maxResults } = config;

    return `You are a business data extraction expert. Extract business information for Colombian businesses.

Search Query: ${query}
${city ? `City: ${city}` : ''}
${industry ? `Industry: ${industry}` : ''}
Source: ${source}
Max Results: ${maxResults || 50}

Extract the following information for each business:
- Business Name
- Email address (if available)
- Phone number (if available)
- Industry/Category
- City/Location
- Website (if available)

Return the data as a JSON array:
[
  {
    "name": "Business Name",
    "email": "email@example.com",
    "phone": "+57 300 123 4567",
    "industry": "Industry name",
    "city": "City name",
    "website": "https://example.com"
  },
  ...
]

Be thorough and extract as many businesses as possible. If email is not directly available, suggest a likely email format based on the business name and website.
Only include businesses in Colombia.`;
  }

  /**
   * Parse scraped data from Grok response
   */
  private parseScrapedData(text: string): BusinessSource[] {
    try {
      // Try to extract JSON array
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => item.name && item.email);
        }
      }

      // Try to extract individual businesses
      const businesses: BusinessSource[] = [];
      const lines = text.split('\n');

      let currentBusiness: Partial<BusinessSource> = {};
      for (const line of lines) {
        if (line.match(/name|nombre/i)) {
          const match = line.match(/[:=]\s*(.+)/i);
          if (match) {
            if (currentBusiness.name) {
              // Save previous business
              if (currentBusiness.name && currentBusiness.email) {
                businesses.push(currentBusiness as BusinessSource);
              }
            }
            currentBusiness = { name: match[1].trim() };
          }
        } else if (line.match(/email|correo/i)) {
          const match = line.match(/[:=]\s*([^\s,]+@[^\s,]+)/i);
          if (match) {
            currentBusiness.email = match[1].trim();
          }
        } else if (line.match(/phone|teléfono|telefono/i)) {
          const match = line.match(/[:=]\s*(.+)/i);
          if (match) {
            currentBusiness.phone = match[1].trim();
          }
        } else if (line.match(/industry|industria|categoría/i)) {
          const match = line.match(/[:=]\s*(.+)/i);
          if (match) {
            currentBusiness.industry = match[1].trim();
          }
        } else if (line.match(/city|ciudad/i)) {
          const match = line.match(/[:=]\s*(.+)/i);
          if (match) {
            currentBusiness.city = match[1].trim();
          }
        } else if (line.match(/website|sitio/i)) {
          const match = line.match(/[:=]\s*(https?:\/\/[^\s,]+)/i);
          if (match) {
            currentBusiness.website = match[1].trim();
          }
        }
      }

      // Save last business
      if (currentBusiness.name && currentBusiness.email) {
        businesses.push(currentBusiness as BusinessSource);
      }

      return businesses;
    } catch (error) {
      console.error('Failed to parse scraped data:', error);
      return [];
    }
  }

  /**
   * Generate business email if not available
   */
  generateBusinessEmail(businessName: string, website?: string): string {
    // Generate likely email based on business name
    const cleanName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .substring(0, 20);

    if (website) {
      // Extract domain from website
      const domainMatch = website.match(/https?:\/\/(?:www\.)?([^\/]+)/);
      if (domainMatch) {
        return `contacto@${domainMatch[1]}`;
      }
    }

    // Default format
    return `contacto@${cleanName}.com`;
  }

  /**
   * Scrape from multiple sources in parallel
   */
  async scrapeMultiple(
    queries: string[],
    city: string = 'Medellín'
  ): Promise<BusinessSource[]> {
    const allBusinesses: BusinessSource[] = [];
    const seen = new Set<string>();

    // Scrape in parallel batches
    const batchSize = 5;
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);

      const results = await Promise.all(
        batch.map((query) =>
          this.scrapeBusinesses({
            source: 'google',
            query: `${query} ${city} Colombia`,
            city,
            maxResults: 20,
          })
        )
      );

      // Merge and deduplicate
      results.forEach((businesses) => {
        businesses.forEach((business) => {
          const key = `${business.name}-${business.email}`.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            allBusinesses.push(business);
          }
        });
      });

      // Delay between batches
      if (i + batchSize < queries.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return allBusinesses;
  }

  /**
   * Get common Colombian business queries by industry
   */
  getIndustryQueries(industry: string): string[] {
    const queries: Record<string, string[]> = {
      law: [
        'bufete de abogados',
        'firma legal',
        'abogado',
        'asesoría jurídica',
        'despacho legal',
      ],
      clinics: [
        'clínica médica',
        'centro de salud',
        'consultorio médico',
        'hospital',
        'médico general',
      ],
      restaurants: [
        'restaurante',
        'cafetería',
        'comida rápida',
        'bar',
        'pizzería',
      ],
      education: [
        'colegio',
        'universidad',
        'instituto',
        'academia',
        'centro educativo',
      ],
      startups: [
        'startup',
        'empresa tecnología',
        'desarrollo software',
        'agencia digital',
        'marketing digital',
      ],
    };

    return queries[industry] || [industry];
  }
}
