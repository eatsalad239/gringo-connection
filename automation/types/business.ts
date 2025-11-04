/**
 * Business data types for Colombian businesses
 */

export interface ColombianBusiness {
  id: string;
  name: string;
  email: string;
  phone?: string;
  industry: string;
  vertical: string; // law, clinics, restaurants, education, startups
  city: string;
  netWorth: 'high' | 'medium' | 'low'; // Priority ranking
  ownerOccupied: boolean; // High priority if true
  website?: string;
  painPoints?: string[]; // Industry-specific pain points
  estimatedRevenue?: number;
  employeeCount?: number;
  notes?: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  language: 'es' | 'en';
}

export interface EmailJob {
  business: ColombianBusiness;
  emailAddress: string; // Rotated email from @gringoconnection.com
  template: EmailTemplate;
  status: 'pending' | 'sent' | 'failed' | 'retry';
  sentAt?: Date;
  error?: string;
  retryCount: number;
}

export interface CampaignStats {
  totalBusinesses: number;
  emailsSent: number;
  emailsFailed: number;
  emailsPending: number;
  startedAt: Date;
  completedAt?: Date;
  byIndustry: Record<string, number>;
  byPriority: Record<string, number>;
}
