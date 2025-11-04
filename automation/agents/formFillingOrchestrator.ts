#!/usr/bin/env tsx

/**
 * Form Filling Orchestrator - Runs 20 agents in parallel to fill forms on Medellín business websites
 * 
 * Usage: pnpm tsx automation/agents/formFillingOrchestrator.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns-tz';
import { runFormFillingAgent, FormSubmission } from './formFillingAgent.js';
import { mail } from '../providers.js';

const CONTENT_DIR = join(process.cwd(), 'content');
const BUSINESSES_PATH = join(CONTENT_DIR, 'medellin-businesses.json');
const RESULTS_PATH = join(CONTENT_DIR, 'form-submissions-results.json');
const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

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

interface RunResults {
  timestamp: string;
  totalAgents: number;
  totalBusinesses: number;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  totalFormsFound: number;
  totalSubmitted: number;
  results: FormSubmission[];
  byBusinessType: Record<string, {
    total: number;
    success: number;
    failed: number;
  }>;
  duration: number;
}

// Load businesses from database
function loadBusinesses(): Business[] {
  if (!existsSync(BUSINESSES_PATH)) {
    console.error(`❌ Business database not found at ${BUSINESSES_PATH}`);
    return [];
  }

  const data = JSON.parse(readFileSync(BUSINESSES_PATH, 'utf-8'));
  return data.businesses || [];
}

// Filter businesses by top business types
function filterTopBusinessTypes(businesses: Business[]): Business[] {
  const topTypes = [
    'restaurant',
    'beauty',
    'gym',
    'realestate',
    'medical',
    'law',
    'accounting',
    'tourism',
    'retail',
    'tech'
  ];

  return businesses.filter(b => topTypes.includes(b.businessType));
}

// Distribute businesses evenly across agents
function distributeBusinesses(businesses: Business[], numAgents: number): Business[][] {
  const distribution: Business[][] = [];
  const businessesPerAgent = Math.ceil(businesses.length / numAgents);

  for (let i = 0; i < numAgents; i++) {
    const start = i * businessesPerAgent;
    const end = start + businessesPerAgent;
    distribution.push(businesses.slice(start, end));
  }

  return distribution;
}

// Main orchestrator function
export async function runFormFillingOrchestrator(
  numAgents: number = 20,
  maxFormsPerAgent: number = 5
): Promise<RunResults> {
  const startTime = Date.now();
  console.log(`🚀 Starting Form Filling Orchestrator with ${numAgents} agents...\n`);

  // Load businesses
  const allBusinesses = loadBusinesses();
  if (allBusinesses.length === 0) {
    throw new Error('No businesses found in database');
  }

  // Filter to top business types
  const topBusinesses = filterTopBusinessTypes(allBusinesses);
  console.log(`📊 Loaded ${topBusinesses.length} businesses from top 10 categories\n`);

  // Distribute businesses across agents
  const distribution = distributeBusinesses(topBusinesses, numAgents);
  console.log(`📦 Distributed ${topBusinesses.length} businesses across ${numAgents} agents\n`);

  // Run all agents in parallel
  console.log(`⚡ Launching ${numAgents} agents in parallel...\n`);
  const agentPromises = distribution.map((businesses, index) =>
    runFormFillingAgent(index + 1, businesses, maxFormsPerAgent)
      .then(results => {
        console.log(`✅ Agent ${index + 1} completed: ${results.filter(r => r.success).length}/${results.length} successful\n`);
        return results;
      })
      .catch(error => {
        console.error(`❌ Agent ${index + 1} failed:`, error);
        return [] as FormSubmission[];
      })
  );

  // Wait for all agents to complete
  const allResults = await Promise.all(agentPromises);
  const flatResults = allResults.flat();

  const duration = Date.now() - startTime;

  // Calculate statistics
  const totalProcessed = flatResults.length;
  const totalSuccess = flatResults.filter(r => r.success).length;
  const totalFailed = flatResults.filter(r => !r.success).length;
  const totalFormsFound = flatResults.filter(r => r.formFound).length;
  const totalSubmitted = flatResults.filter(r => r.submitted).length;

  // Group by business type
  const byBusinessType: Record<string, { total: number; success: number; failed: number }> = {};
  flatResults.forEach(result => {
    const type = result.business.businessType;
    if (!byBusinessType[type]) {
      byBusinessType[type] = { total: 0, success: 0, failed: 0 };
    }
    byBusinessType[type].total++;
    if (result.success) {
      byBusinessType[type].success++;
    } else {
      byBusinessType[type].failed++;
    }
  });

  const results: RunResults = {
    timestamp: new Date().toISOString(),
    totalAgents: numAgents,
    totalBusinesses: topBusinesses.length,
    totalProcessed,
    totalSuccess,
    totalFailed,
    totalFormsFound,
    totalSubmitted,
    results: flatResults,
    byBusinessType,
    duration
  };

  // Save results
  writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`💾 Results saved to ${RESULTS_PATH}\n`);

  // Generate and send report
  await generateAndSendReport(results);

  return results;
}

// Generate and send email report
async function generateAndSendReport(results: RunResults): Promise<void> {
  const successRate = results.totalProcessed > 0 
    ? ((results.totalSuccess / results.totalProcessed) * 100).toFixed(1)
    : '0';

  const durationMinutes = (results.duration / 1000 / 60).toFixed(2);
  const formsPerMinute = results.totalProcessed > 0
    ? ((results.totalProcessed / (results.duration / 1000 / 60))).toFixed(1)
    : '0';

  // Generate business type breakdown
  const typeBreakdown = Object.entries(results.byBusinessType)
    .map(([type, stats]) => {
      const rate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0';
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>${type}</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${stats.total}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #16a34a;">${stats.success}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #dc2626;">${stats.failed}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${rate}%</td>
        </tr>
      `;
    })
    .join('');

  // Top successes
  const topSuccesses = results.results
    .filter(r => r.success)
    .slice(0, 10)
    .map(r => `
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px; margin: 5px 0; border-radius: 4px;">
        <strong>${r.business.name}</strong> (${r.business.category})<br>
        <small style="color: #6b7280;">${r.business.website}</small>
      </div>
    `)
    .join('');

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af; margin-bottom: 10px;">🤖 Form Filling Agent Report</h1>
      <p style="color: #6b7280; margin-bottom: 30px;">
        <strong>Date:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: DEFAULT_TZ })}<br>
        <strong>Duration:</strong> ${durationMinutes} minutes<br>
        <strong>Speed:</strong> ${formsPerMinute} forms/minute
      </p>

      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0 0 15px; color: #1e40af;">📊 Overall Statistics</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #1e40af;">${results.totalProcessed}</div>
            <div style="color: #6b7280; font-size: 14px;">Total Processed</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #16a34a;">${results.totalSuccess}</div>
            <div style="color: #6b7280; font-size: 14px;">Successful</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #dc2626;">${results.totalFailed}</div>
            <div style="color: #6b7280; font-size: 14px;">Failed</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #f59e0b;">${successRate}%</div>
            <div style="color: #6b7280; font-size: 14px;">Success Rate</div>
          </div>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <strong>Forms Found:</strong> ${results.totalFormsFound}
            </div>
            <div>
              <strong>Forms Submitted:</strong> ${results.totalSubmitted}
            </div>
          </div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h2 style="color: #1e40af; margin-bottom: 15px;">📈 Performance by Business Type</h2>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Business Type</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Total</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Success</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Failed</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Rate</th>
            </tr>
          </thead>
          <tbody>
            ${typeBreakdown}
          </tbody>
        </table>
      </div>

      ${topSuccesses ? `
        <div style="margin: 30px 0;">
          <h2 style="color: #16a34a; margin-bottom: 15px;">✅ Top Successful Submissions</h2>
          ${topSuccesses}
        </div>
      ` : ''}

      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0;"><strong>📧 Contact Email:</strong> All forms were filled with info@gringoconnection.com</p>
        <p style="margin: 10px 0 0 0;"><strong>💡 Message:</strong> Forms included message about website improvement services</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p><strong>🤖 Agents Used:</strong> ${results.totalAgents}</p>
        <p><strong>🌐 Businesses in Database:</strong> ${results.totalBusinesses}</p>
        <p><strong>⚡ Processing Speed:</strong> ${formsPerMinute} forms per minute</p>
      </div>
    </div>
  `;

  const result = await mail.send({
    to: EOD_TO.split(',').map((e) => e.trim()),
    subject: `🤖 Form Filling Report: ${results.totalSuccess}/${results.totalProcessed} Successful (${successRate}%)`,
    html
  });

  if (result.ok) {
    console.log(`📧 Report sent to ${EOD_TO}`);
  } else {
    console.warn(`⚠️  Email failed: ${result.reason}`);
  }
}

// CLI Interface
async function main() {
  const numAgents = parseInt(process.argv[2] || '20', 10);
  const maxFormsPerAgent = parseInt(process.argv[3] || '5', 10);

  try {
    const results = await runFormFillingOrchestrator(numAgents, maxFormsPerAgent);
    
    console.log('\n🎉 Form Filling Orchestrator Complete!');
    console.log(`📊 Processed: ${results.totalProcessed}`);
    console.log(`✅ Successful: ${results.totalSuccess}`);
    console.log(`❌ Failed: ${results.totalFailed}`);
    console.log(`⏱️  Duration: ${(results.duration / 1000 / 60).toFixed(2)} minutes`);
    console.log(`⚡ Speed: ${(results.totalProcessed / (results.duration / 1000 / 60)).toFixed(1)} forms/minute\n`);
  } catch (error) {
    console.error('\n💥 Orchestrator failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default runFormFillingOrchestrator;
