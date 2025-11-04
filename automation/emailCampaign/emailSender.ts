/**
 * Multi-agent email sender
 * Sends emails in parallel using multiple agents
 */

import { mail } from '../providers.js';
import { EmailRotator } from './emailRotator.js';
import type { EmailJob, ColombianBusiness, EmailTemplate } from '../types/business.js';
import { rateLimiters } from '../utils/rateLimiter.js';

export interface SenderConfig {
  maxConcurrentAgents: number;
  delayBetweenEmails: number; // ms
  maxRetries: number;
}

export class EmailSender {
  private rotator: EmailRotator;
  private config: SenderConfig;
  private sentEmails = new Set<string>(); // Track sent to avoid duplicates
  private jobs: EmailJob[] = [];

  constructor(rotator: EmailRotator, config: Partial<SenderConfig> = {}) {
    this.rotator = rotator;
    this.config = {
      maxConcurrentAgents: config.maxConcurrentAgents || 10,
      delayBetweenEmails: config.delayBetweenEmails || 100,
      maxRetries: config.maxRetries || 3,
    };
  }

  /**
   * Send emails in parallel using multiple agents
   */
  async sendBatch(
    businesses: ColombianBusiness[],
    templates: Map<string, EmailTemplate>
  ): Promise<EmailJob[]> {
    const jobs: EmailJob[] = [];

    // Create jobs for all businesses
    for (const business of businesses) {
      // Skip if already sent
      if (this.sentEmails.has(business.email)) {
        continue;
      }

      const template = templates.get(business.id);
      if (!template) {
        console.warn(`No template for business ${business.id}`);
        continue;
      }

      const emailAddress = this.rotator.getNext();
      if (!emailAddress) {
        console.warn('No available email addresses');
        break;
      }

      jobs.push({
        business,
        emailAddress: emailAddress.address,
        template,
        status: 'pending',
        retryCount: 0,
      });
    }

    this.jobs = jobs;

    // Process in parallel batches
    await this.processBatch(jobs);

    return this.jobs;
  }

  /**
   * Process batch of jobs with parallel agents
   */
  private async processBatch(jobs: EmailJob[]): Promise<void> {
    const agents: Promise<void>[] = [];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];

      // Wait if we've hit max concurrent agents
      if (agents.length >= this.config.maxConcurrentAgents) {
        await Promise.race(agents);
        // Remove completed promises
        const index = agents.findIndex((p) => {
          // Check if promise is resolved (simplified check)
          return false; // Will be cleaned up by Promise.race
        });
      }

      // Create agent for this job
      const agent = this.sendEmail(job).then(() => {
        // Remove from agents array when done
        const index = agents.indexOf(agent);
        if (index > -1) {
          agents.splice(index, 1);
        }
      });

      agents.push(agent);

      // Small delay between starting agents
      if (i < jobs.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.config.delayBetweenEmails));
      }
    }

    // Wait for all remaining agents
    await Promise.all(agents);
  }

  /**
   * Single email sending agent
   */
  private async sendEmail(job: EmailJob): Promise<void> {
    // Check rate limit
    await rateLimiters.default.waitUntilAllowed('resend');

    try {
      const result = await mail.send({
        to: job.business.email,
        subject: job.template.subject,
        html: job.template.body,
        text: job.template.body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });

      if (result.ok) {
        job.status = 'sent';
        job.sentAt = new Date();
        this.sentEmails.add(job.business.email);

        // Mark email as used
        const emailAddr = this.rotator.getAll().find((e) => e.address === job.emailAddress);
        if (emailAddr) {
          this.rotator.markUsed(emailAddr);
        }

        console.log(`✅ Sent to ${job.business.email} (${job.business.name})`);
      } else {
        job.status = 'failed';
        job.error = result.reason;
        console.error(`❌ Failed to send to ${job.business.email}: ${result.reason}`);

        // Retry if under max retries
        if (job.retryCount < this.config.maxRetries) {
          job.retryCount++;
          job.status = 'retry';
          // Schedule retry
          setTimeout(() => this.sendEmail(job), 5000 * job.retryCount); // Exponential backoff
        }
      }
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      console.error(`❌ Exception sending to ${job.business.email}: ${job.error}`);
    }
  }

  /**
   * Get stats
   */
  getStats() {
    const sent = this.jobs.filter((j) => j.status === 'sent').length;
    const failed = this.jobs.filter((j) => j.status === 'failed').length;
    const pending = this.jobs.filter((j) => j.status === 'pending' || j.status === 'retry').length;

    return {
      total: this.jobs.length,
      sent,
      failed,
      pending,
      successRate: this.jobs.length > 0 ? (sent / this.jobs.length) * 100 : 0,
    };
  }

  /**
   * Check if email was already sent
   */
  hasBeenSent(email: string): boolean {
    return this.sentEmails.has(email);
  }
}
