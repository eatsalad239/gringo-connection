/**
 * Main campaign orchestrator
 * Coordinates all components to send 50,000 emails to Colombian businesses
 */

import { EmailRotator, createDefaultEmailRotator } from './emailRotator.js';
import { EmailGenerator } from './emailGenerator.js';
import { EmailSender } from './emailSender.js';
import { BusinessLoader } from './businessLoader.js';
import type { ColombianBusiness, EmailTemplate, CampaignStats } from '../types/business.js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface CampaignConfig {
  targetCount: number;
  maxConcurrentAgents: number;
  delayBetweenEmails: number;
  priorityOrder: 'high-to-low' | 'low-to-high' | 'random';
  saveProgress: boolean;
  progressFile?: string;
}

export class CampaignOrchestrator {
  private rotator: EmailRotator;
  private generator: EmailGenerator;
  private sender: EmailSender;
  private loader: BusinessLoader;
  private config: CampaignConfig;
  private stats: CampaignStats;

  constructor(config: Partial<CampaignConfig> = {}) {
    this.config = {
      targetCount: config.targetCount || 50000,
      maxConcurrentAgents: config.maxConcurrentAgents || 20,
      delayBetweenEmails: config.delayBetweenEmails || 50,
      priorityOrder: config.priorityOrder || 'high-to-low',
      saveProgress: config.saveProgress ?? true,
      progressFile: config.progressFile || 'campaign-progress.json',
    };

    this.rotator = createDefaultEmailRotator();
    this.generator = new EmailGenerator();
    this.sender = new EmailSender(this.rotator, {
      maxConcurrentAgents: this.config.maxConcurrentAgents,
      delayBetweenEmails: this.config.delayBetweenEmails,
    });
    this.loader = new BusinessLoader();

    this.stats = {
      totalBusinesses: 0,
      emailsSent: 0,
      emailsFailed: 0,
      emailsPending: 0,
      startedAt: new Date(),
      byIndustry: {},
      byPriority: {},
    };
  }

  /**
   * Run the full campaign
   */
  async run(): Promise<CampaignStats> {
    console.log('🚀 Starting email campaign...');
    console.log(`📊 Target: ${this.config.targetCount} businesses`);
    console.log(`🤖 Agents: ${this.config.maxConcurrentAgents} concurrent`);
    console.log(`📧 Email addresses: ${this.rotator.getAll().length}`);

    // Load businesses
    let businesses: ColombianBusiness[] = [];

    // Try to load from progress file
    if (this.config.saveProgress && existsSync(this.config.progressFile!)) {
      console.log('📂 Loading progress from file...');
      businesses = this.loadProgress();
    }

    // If not enough businesses, generate/load more
    if (businesses.length < this.config.targetCount) {
      console.log(`📥 Loading businesses (need ${this.config.targetCount - businesses.length} more)...`);
      const additional = await this.loadBusinesses(this.config.targetCount - businesses.length);
      businesses = [...businesses, ...additional];
    }

    // Sort by priority
    businesses = this.sortByPriority(businesses);

    // Limit to target count
    businesses = businesses.slice(0, this.config.targetCount);

    this.stats.totalBusinesses = businesses.length;

    console.log(`✅ Loaded ${businesses.length} businesses`);
    console.log(`📊 Priority breakdown:`);
    const priorityBreakdown = this.getPriorityBreakdown(businesses);
    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count}`);
    });

    // Generate emails in batches
    console.log('✍️  Generating tailored emails...');
    const templates = await this.generateTemplates(businesses);

    // Send emails
    console.log('📤 Sending emails...');
    const jobs = await this.sender.sendBatch(businesses, templates);

    // Update stats
    this.updateStats(jobs);

    // Save progress
    if (this.config.saveProgress) {
      this.saveProgress(businesses, jobs);
    }

    // Final stats
    this.stats.completedAt = new Date();
    this.printFinalStats();

    return this.stats;
  }

  /**
   * Load businesses
   * Tries multiple sources: file → scrape → sample data
   */
  private async loadBusinesses(count: number): Promise<ColombianBusiness[]> {
    let businesses: ColombianBusiness[] = [];

    // Try to load from file first
    const dataFiles = [
      'businesses.json',
      'colombian-businesses.csv',
      'business-data.json',
    ];

    for (const file of dataFiles) {
      try {
        const loaded = await this.loader.loadFromFile(file);
        if (loaded.length > 0) {
          console.log(`📂 Loaded ${loaded.length} businesses from ${file}`);
          businesses = [...businesses, ...loaded];
          if (businesses.length >= count) {
            return businesses.slice(0, count);
          }
        }
      } catch (e) {
        // File doesn't exist or can't be read, continue
      }
    }

    // If not enough, try scraping
    if (businesses.length < count) {
      console.log('🔍 Scraping additional businesses...');
      const industries = ['law', 'clinics', 'restaurants', 'education', 'startups'];
      const cities = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena'];

      const queries: string[] = [];
      industries.forEach((industry) => {
        const industryQueries = this.loader.scraper.getIndustryQueries(industry);
        queries.push(...industryQueries.slice(0, 2)); // Limit queries per industry
      });

      // Scrape businesses (limited to avoid too many API calls)
      const scraped = await this.loader.loadByScraping(queries.slice(0, 10), 'Medellín');
      businesses = [...businesses, ...scraped];

      if (businesses.length >= count) {
        return businesses.slice(0, count);
      }
    }

    // Fill remaining with sample data
    const remaining = count - businesses.length;
    if (remaining > 0) {
      console.log(`📊 Generating ${remaining} sample businesses...`);
      const samples = this.loader.generateSampleBusinesses(remaining);
      businesses = [...businesses, ...samples];
    }

    return businesses.slice(0, count);
  }

  /**
   * Sort businesses by priority (high net worth, owner-occupied first)
   */
  private sortByPriority(businesses: ColombianBusiness[]): ColombianBusiness[] {
    const sorted = [...businesses];

    sorted.sort((a, b) => {
      // Priority: owner-occupied high net worth > owner-occupied medium > owner-occupied low > others
      const aScore = this.getPriorityScore(a);
      const bScore = this.getPriorityScore(b);

      if (this.config.priorityOrder === 'high-to-low') {
        return bScore - aScore;
      } else if (this.config.priorityOrder === 'low-to-high') {
        return aScore - bScore;
      } else {
        return Math.random() - 0.5;
      }
    });

    return sorted;
  }

  private getPriorityScore(business: ColombianBusiness): number {
    let score = 0;

    // Owner-occupied gets high priority
    if (business.ownerOccupied) {
      score += 1000;
    }

    // Net worth weighting
    switch (business.netWorth) {
      case 'high':
        score += 100;
        break;
      case 'medium':
        score += 50;
        break;
      case 'low':
        score += 10;
        break;
    }

    // Has website gets slight boost (less likely to need website service)
    if (business.website) {
      score -= 5;
    }

    return score;
  }

  /**
   * Generate email templates for all businesses
   */
  private async generateTemplates(
    businesses: ColombianBusiness[]
  ): Promise<Map<string, EmailTemplate>> {
    const templates = new Map<string, EmailTemplate>();

    // Generate in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);
      console.log(`   Generating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businesses.length / batchSize)}...`);

      const batchTemplates = await Promise.all(
        batch.map(async (business) => {
          try {
            const template = await this.generator.generateEmail(business);
            return { businessId: business.id, template };
          } catch (error) {
            console.error(`Failed to generate email for ${business.id}:`, error);
            return null;
          }
        })
      );

      batchTemplates.forEach((item) => {
        if (item) {
          templates.set(item.businessId, item.template);
        }
      });

      // Small delay between batches
      if (i + batchSize < businesses.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return templates;
  }

  /**
   * Update campaign stats
   */
  private updateStats(jobs: any[]): void {
    this.stats.emailsSent = jobs.filter((j) => j.status === 'sent').length;
    this.stats.emailsFailed = jobs.filter((j) => j.status === 'failed').length;
    this.stats.emailsPending = jobs.filter((j) => j.status === 'pending' || j.status === 'retry').length;

    // Count by industry
    const industryCount: Record<string, number> = {};
    const priorityCount: Record<string, number> = {};

    jobs.forEach((job) => {
      const industry = job.business.industry;
      industryCount[industry] = (industryCount[industry] || 0) + 1;

      const priority = `${job.business.netWorth}-${job.business.ownerOccupied ? 'owner' : 'other'}`;
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
    });

    this.stats.byIndustry = industryCount;
    this.stats.byPriority = priorityCount;
  }

  /**
   * Get priority breakdown
   */
  private getPriorityBreakdown(businesses: ColombianBusiness[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    businesses.forEach((b) => {
      const key = `${b.netWorth}-${b.ownerOccupied ? 'owner' : 'other'}`;
      breakdown[key] = (breakdown[key] || 0) + 1;
    });

    return breakdown;
  }

  /**
   * Save progress to file
   */
  private saveProgress(businesses: ColombianBusiness[], jobs: any[]): void {
    const progress = {
      businesses,
      jobs: jobs.map((j) => ({
        businessId: j.business.id,
        email: j.business.email,
        status: j.status,
        sentAt: j.sentAt,
        error: j.error,
      })),
      stats: this.stats,
      savedAt: new Date(),
    };

    writeFileSync(this.config.progressFile!, JSON.stringify(progress, null, 2));
    console.log(`💾 Progress saved to ${this.config.progressFile}`);
  }

  /**
   * Load progress from file
   */
  private loadProgress(): ColombianBusiness[] {
    try {
      const content = readFileSync(this.config.progressFile!, 'utf-8');
      const progress = JSON.parse(content);
      return progress.businesses || [];
    } catch {
      return [];
    }
  }

  /**
   * Print final stats
   */
  private printFinalStats(): void {
    console.log('\n📊 Campaign Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`Total Businesses: ${this.stats.totalBusinesses}`);
    console.log(`Emails Sent: ${this.stats.emailsSent}`);
    console.log(`Emails Failed: ${this.stats.emailsFailed}`);
    console.log(`Emails Pending: ${this.stats.emailsPending}`);
    console.log(`Success Rate: ${((this.stats.emailsSent / this.stats.totalBusinesses) * 100).toFixed(2)}%`);
    console.log(`Duration: ${Math.round((this.stats.completedAt!.getTime() - this.stats.startedAt.getTime()) / 1000 / 60)} minutes`);
    console.log('\n📈 By Industry:');
    Object.entries(this.stats.byIndustry).forEach(([industry, count]) => {
      console.log(`   ${industry}: ${count}`);
    });
    console.log('\n🎯 By Priority:');
    Object.entries(this.stats.byPriority).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count}`);
    });
    console.log('\n📧 Email Rotator Stats:');
    this.rotator.getStats().forEach((stat) => {
      console.log(`   ${stat.address}: ${stat.sendCount} sent, ${stat.remaining} remaining`);
    });
  }
}
