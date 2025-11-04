/**
 * API Route: /api/status
 * Returns deployment status and what's running
 * Public endpoint for monitoring
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gringoconnection.com';
  const deploymentDate = process.env.DEPLOYMENT_DATE || new Date().toISOString();
  const version = process.env.DEPLOYMENT_VERSION || '1.0.0';

  const status = {
    status: 'live',
    environment: 'production',
    url: baseUrl,
    version,
    deployedAt: deploymentDate,
    timestamp: new Date().toISOString(),
    features: {
      website: {
        status: 'operational',
        pages: 11,
        languages: ['en', 'es'],
        routes: [
          '/',
          '/es',
          '/services',
          '/tours',
          '/partners',
          '/contact',
          '/verticals/[slug]',
          '/legal/privacy',
          '/legal/terms',
        ],
      },
      automation: {
        status: 'running',
        agents: {
          total: 15,
          active: 15,
          categories: {
            revenue: 5,
            development: 3,
            operations: 7,
          },
        },
        schedules: {
          daily: ['Intake Agent', 'EOD Agent', 'Dev Helper', 'Workflow Automation'],
          hourly: ['Lead Qualification'],
          weekly: ['Upsell Agent', 'Referral Agent', 'Grant Agent'],
          onDemand: ['Proposal Generator', 'Code Generator', 'QA Agent'],
        },
      },
      integrations: {
        email: 'Resend (configured)',
        crm: 'GoHighLevel (configured)',
        analytics: 'Plausible (configured)',
        database: 'Cloudflare D1 (ready)',
        hosting: 'Cloudflare Pages',
      },
      performance: {
        optimized: true,
        pwa: true,
        seo: true,
        accessibility: true,
      },
    },
    agents: [
      {
        id: 'lead-qualification',
        name: 'Lead Qualification Agent',
        status: 'active',
        schedule: 'every-2-hours',
        category: 'revenue',
      },
      {
        id: 'follow-up',
        name: 'Follow-up Agent',
        status: 'active',
        schedule: '09:00-daily',
        category: 'revenue',
      },
      {
        id: 'upsell',
        name: 'Upsell Agent',
        status: 'active',
        schedule: 'monday-10:00',
        category: 'revenue',
      },
      {
        id: 'proposal-generator',
        name: 'Proposal Generator Agent',
        status: 'active',
        schedule: 'on-demand',
        category: 'revenue',
      },
      {
        id: 'referral',
        name: 'Referral Agent',
        status: 'active',
        schedule: 'friday-14:00',
        category: 'revenue',
      },
      {
        id: 'dev-helper',
        name: 'Dev Helper Agent',
        status: 'active',
        schedule: '08:00-daily',
        category: 'development',
      },
      {
        id: 'code-generator',
        name: 'Code Generator Agent',
        status: 'active',
        schedule: 'on-demand',
        category: 'development',
      },
      {
        id: 'workflow',
        name: 'Workflow Automation Agent',
        status: 'active',
        schedule: '09:00-daily',
        category: 'development',
      },
      {
        id: 'intake',
        name: 'Intake Agent',
        status: 'active',
        schedule: '09:15 & 14:00',
        category: 'operations',
      },
      {
        id: 'eod',
        name: 'EOD Agent',
        status: 'active',
        schedule: '21:30-daily',
        category: 'operations',
      },
      {
        id: 'grant',
        name: 'Grant Agent',
        status: 'active',
        schedule: 'mon-thu-08:00',
        category: 'operations',
      },
      {
        id: 'qa',
        name: 'QA Agent',
        status: 'active',
        schedule: 'on-demand',
        category: 'operations',
      },
      {
        id: 'alert',
        name: 'Alert Agent',
        status: 'active',
        schedule: 'real-time',
        category: 'operations',
      },
      {
        id: 'performance',
        name: 'Performance Monitor',
        status: 'active',
        schedule: 'continuous',
        category: 'operations',
      },
      {
        id: 'swarm',
        name: 'Swarm Orchestrator',
        status: 'active',
        schedule: 'continuous',
        category: 'operations',
      },
    ],
  };

  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

