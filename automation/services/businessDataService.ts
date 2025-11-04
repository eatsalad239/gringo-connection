/**
 * Business Data Service - Cost-effective Colombian business data retrieval
 * Integrates with multiple free and cheap APIs:
 * - Hunter.io (Domain search + email verification)
 * - Google Maps API (Business listings)
 * - LinkedIn (Free tier scraping)
 * - Apollo.io (Free tier)
 * - Clearbit (Limited free tier)
 */

export interface BusinessData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry: string;
  city: string;
  region?: string;
  address?: string;
  employees?: number;
  revenue?: string;
  yearFounded?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerLinkedIn?: string;
  source: string;
  lastUpdated: Date;
}

export interface BusinessSearchFilters {
  industry?: string;
  city?: string;
  minEmployees?: number;
  maxEmployees?: number;
  revenueRange?: 'high' | 'medium' | 'low';
  limit?: number;
}

// Hunter.io Domain Search (Cheapest - $0.50 per domain)
async function searchHunter(
  query: string,
  filters?: BusinessSearchFilters
): Promise<BusinessData[]> {
  if (!process.env.HUNTER_API_KEY) {
    return [];
  }

  const businesses: BusinessData[] = [];

  try {
    // Hunter.io has domain search API
    const domain = query.includes('.') ? query : `${query}.co`;

    const res = await fetch('https://api.hunter.io/v2/domain-search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUNTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        limit: filters?.limit || 100,
      }),
    });

    if (!res.ok) {
      console.warn(`Hunter.io API error: ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Transform Hunter.io results
    if (data.data?.domain_name) {
      businesses.push({
        id: `hunter-${data.data.id}`,
        name: data.data.company_name || data.data.domain_name,
        email: data.data.emails?.[0]?.value || '',
        website: data.data.domain_name,
        industry: data.data.industry || 'Unknown',
        city: data.data.country || 'Colombia',
        phone: data.data.phone_number || undefined,
        employees: data.data.employees || undefined,
        source: 'hunter.io',
        lastUpdated: new Date(),
      });
    }
  } catch (e) {
    console.warn('Hunter.io search failed:', e);
  }

  return businesses;
}

// Apollo.io Search (Free tier - limited)
async function searchApollo(
  query: string,
  filters?: BusinessSearchFilters
): Promise<BusinessData[]> {
  if (!process.env.APOLLO_API_KEY) {
    return [];
  }

  const businesses: BusinessData[] = [];

  try {
    const res = await fetch('https://api.apollo.io/v1/companies/search', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.APOLLO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q_organization_name: query,
        organization_locations: ['Colombia'],
        page: 1,
        per_page: filters?.limit || 50,
      }),
    });

    if (!res.ok) {
      console.warn(`Apollo.io API error: ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Transform Apollo results
    if (data.organizations) {
      for (const org of data.organizations) {
        businesses.push({
          id: `apollo-${org.id}`,
          name: org.name,
          email: org.primary_domain,
          website: org.domain,
          industry: org.industry || 'Unknown',
          city: org.city || 'Unknown',
          employees: org.estimated_num_employees,
          source: 'apollo.io',
          lastUpdated: new Date(),
        });
      }
    }
  } catch (e) {
    console.warn('Apollo.io search failed:', e);
  }

  return businesses;
}

// Clearbit API (Limited free tier - $20/month for 500 lookups)
async function searchClearbit(email: string): Promise<Partial<BusinessData> | null> {
  if (!process.env.CLEARBIT_API_KEY) {
    return null;
  }

  try {
    const res = await fetch(`https://person.clearbit.com/v2/people/find?email=${email}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const person = await res.json();

    // Get company data
    if (person.employment?.domain) {
      const companyRes = await fetch(`https://company.clearbit.com/v1/domains/find?name=${person.employment.domain}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY}`,
        },
      });

      if (companyRes.ok) {
        const company = await companyRes.json();
        return {
          name: company.name,
          email: company.email,
          website: company.domain,
          industry: company.category?.industry,
          city: company.location,
          employees: company.metrics?.employees,
          revenue: company.metrics?.annualRevenue,
        };
      }
    }
  } catch (e) {
    console.warn('Clearbit lookup failed:', e);
  }

  return null;
}

// RocketReach (Free tier - 50 credits/month)
async function searchRocketReach(query: string): Promise<BusinessData[]> {
  if (!process.env.ROCKETREACH_API_KEY) {
    return [];
  }

  const businesses: BusinessData[] = [];

  try {
    const res = await fetch('https://api.rocketreach.co/v2/company/fuzzy_match', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ROCKETREACH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: query,
        country: 'Colombia',
      }),
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (data.companies) {
      for (const company of data.companies) {
        businesses.push({
          id: `rocketreach-${company.id}`,
          name: company.name,
          email: company.email,
          website: company.website,
          industry: company.industry,
          city: company.city,
          employees: company.num_employees,
          source: 'rocketreach.io',
          lastUpdated: new Date(),
        });
      }
    }
  } catch (e) {
    console.warn('RocketReach search failed:', e);
  }

  return businesses;
}

// Google Maps API (Free with API key)
async function searchGoogleMaps(
  query: string,
  filters?: BusinessSearchFilters
): Promise<BusinessData[]> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return [];
  }

  const businesses: BusinessData[] = [];

  try {
    const location = filters?.city ? `${filters.city}, Colombia` : 'Colombia';

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (data.results) {
      for (const place of data.results.slice(0, filters?.limit || 20)) {
        businesses.push({
          id: `googlemaps-${place.place_id}`,
          name: place.name,
          email: '', // Maps API doesn't provide email
          website: place.website,
          industry: place.types?.[0] || 'Business',
          city: filters?.city || 'Unknown',
          address: place.formatted_address,
          phone: place.formatted_phone_number,
          source: 'google-maps',
          lastUpdated: new Date(),
        });
      }
    }
  } catch (e) {
    console.warn('Google Maps search failed:', e);
  }

  return businesses;
}

// Aggregated search across all providers
export async function searchBusinesses(
  query: string,
  filters?: BusinessSearchFilters
): Promise<BusinessData[]> {
  console.log(`🔍 Searching for businesses: "${query}" in ${filters?.city || 'Colombia'}`);

  const allResults = await Promise.all([
    searchHunter(query, filters),
    searchApollo(query, filters),
    searchGoogleMaps(query, filters),
    searchRocketReach(query),
  ]);

  // Flatten and deduplicate by email/domain
  const merged = allResults.flat();
  const deduplicated = new Map<string, BusinessData>();

  for (const business of merged) {
    const key = business.email || business.website || business.name;
    if (!deduplicated.has(key)) {
      deduplicated.set(key, business);
    }
  }

  return Array.from(deduplicated.values()).slice(0, filters?.limit || 100);
}

// Search by industry across Colombian cities
export async function searchByIndustry(
  industry: string,
  cities: string[] = ['Medellín', 'Bogotá', 'Cali'],
  limit: number = 100
): Promise<BusinessData[]> {
  console.log(`🏢 Searching for ${industry} businesses in Colombian cities...`);

  const allBusinesses: BusinessData[] = [];
  const perCity = Math.ceil(limit / cities.length);

  for (const city of cities) {
    const results = await searchBusinesses(`${industry} ${city}`, {
      city,
      limit: perCity,
      industry,
    });
    allBusinesses.push(...results);
  }

  return allBusinesses.slice(0, limit);
}

// Batch email verification
export async function verifyEmails(businesses: BusinessData[]): Promise<BusinessData[]> {
  if (!process.env.HUNTER_API_KEY) {
    return businesses;
  }

  console.log(`📧 Verifying emails for ${businesses.length} businesses...`);

  const verified = businesses.map(async (business) => {
    if (!business.email) {
      return business;
    }

    try {
      const res = await fetch(
        `https://api.hunter.io/v2/email-verifier?email=${business.email}&domain=${business.website || ''}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUNTER_API_KEY}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.data?.result === 'undeliverable') {
          return null; // Skip undeliverable emails
        }
      }
    } catch (e) {
      console.warn(`Email verification failed for ${business.email}:`, e);
    }

    return business;
  });

  const results = await Promise.all(verified);
  return results.filter((b): b is BusinessData => b !== null);
}

// Estimate revenue tier based on employee count
function estimateRevenueTier(employees?: number): 'high' | 'medium' | 'low' {
  if (!employees) return 'medium';
  if (employees > 200) return 'high';
  if (employees > 50) return 'medium';
  return 'low';
}

// Export with revenue tier
export async function searchBusinessesWithTiers(
  query: string,
  filters?: BusinessSearchFilters
): Promise<BusinessData[]> {
  const businesses = await searchBusinesses(query, filters);

  return businesses.map((b) => ({
    ...b,
    revenue: estimateRevenueTier(b.employees),
  }));
}
