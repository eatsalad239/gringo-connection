/**
 * Agent Swarm Orchestrator
 * Manages all agents, schedules runs, handles dependencies
 * The brain of the agent swarm
 */

import { formatInTimeZone } from 'date-fns-tz';
import { mail } from '../providers.js';

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Bogota';
const EOD_TO = process.env.EOD_TO || 'dan@doorknockingsucks.com, Eddy@doorknockingsucks.com';

interface Agent {
  id: string;
  name: string;
  category: 'revenue' | 'development' | 'operations' | 'intelligence' | 'automation';
  schedule: string; // Cron-like or time-based
  dependencies?: string[]; // Agent IDs this depends on
  status: 'active' | 'paused' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  avgDuration?: number; // seconds
  successRate?: number; // 0-100
}

// Agent registry
const agents: Agent[] = [
  // Revenue Swarm
  {
    id: 'lead-qualification',
    name: 'Lead Qualification Agent',
    category: 'revenue',
    schedule: 'every-2-hours', // 08:00, 10:00, 12:00, 14:00, 16:00, 18:00
    status: 'active',
  },
  {
    id: 'follow-up',
    name: 'Follow-up Agent',
    category: 'revenue',
    schedule: '09:00-daily',
    dependencies: ['lead-qualification'],
    status: 'active',
  },
  {
    id: 'upsell',
    name: 'Upsell Agent',
    category: 'revenue',
    schedule: 'monday-10:00',
    status: 'active',
  },
  {
    id: 'proposal-generator',
    name: 'Proposal Generator Agent',
    category: 'revenue',
    schedule: 'on-demand',
    dependencies: ['lead-qualification'],
    status: 'active', // ✅ Built!
  },
  {
    id: 'referral',
    name: 'Referral Agent',
    category: 'revenue',
    schedule: 'friday-14:00',
    status: 'active', // ✅ Built!
  },
  // Development Swarm
  {
    id: 'code-generator',
    name: 'Code Generator Agent',
    category: 'development',
    schedule: 'on-demand',
    status: 'active',
  },
  {
    id: 'dev-helper',
    name: 'Dev Helper Agent',
    category: 'development',
    schedule: '08:00-daily',
    status: 'active',
  },
  {
    id: 'workflow',
    name: 'Workflow Automation Agent',
    category: 'development',
    schedule: '09:00-daily',
    status: 'active',
  },
  {
    id: 'test-generator',
    name: 'Test Generator Agent',
    category: 'development',
    schedule: 'on-demand',
    dependencies: ['code-generator'],
    status: 'paused',
  },
  {
    id: 'documentation',
    name: 'Documentation Agent',
    category: 'development',
    schedule: 'on-demand',
    dependencies: ['code-generator'],
    status: 'paused',
  },
  // Operations Swarm
  {
    id: 'content-performance',
    name: 'Content Performance Agent',
    category: 'operations',
    schedule: 'sunday-20:00',
    status: 'paused',
  },
  {
    id: 'client-retention',
    name: 'Client Retention Agent',
    category: 'operations',
    schedule: '11:00-daily',
    status: 'paused',
  },
  {
    id: 'competitor-intel',
    name: 'Competitor Intelligence Agent',
    category: 'operations',
    schedule: '07:00-daily',
    status: 'paused',
  },
  {
    id: 'deployment-status',
    name: 'Deployment Status Agent',
    category: 'operations',
    schedule: 'on-demand',
    status: 'active', // ✅ Built - monitors deployments and notifies team
  },
  // Creative Swarm (NEW - Using Top Repos)
  {
    id: 'art-generation',
    name: 'Art Generation Agent',
    category: 'automation',
    schedule: 'on-demand',
    status: 'active', // ✅ Built - generates images for ads/social
  },
  {
    id: 'video-generation',
    name: 'Video Generation Agent',
    category: 'automation',
    schedule: 'on-demand',
    status: 'active', // ✅ Built - generates videos for ads/social
  },
  {
    id: 'ad-automation',
    name: 'Ad Automation Agent',
    category: 'automation',
    schedule: 'on-demand',
    status: 'active', // ✅ Built - creates complete ad campaigns
  },
  {
    id: 'website-builder',
    name: 'Website Builder Agent',
    category: 'development',
    schedule: 'on-demand',
    status: 'active', // ✅ Built - builds complete websites
  },
  {
    id: 'coding-assistant',
    name: 'Coding Assistant Agent',
    category: 'development',
    schedule: 'on-demand',
    status: 'active', // ✅ Built - helps with coding tasks
  },
  {
    id: 'advice',
    name: 'Advice Agent',
    category: 'intelligence',
    schedule: 'on-demand',
    status: 'active', // ✅ Built - provides business/technical advice
  },
];

// Run an agent
async function runAgent(agent: Agent): Promise<{ success: boolean; duration: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Dynamic import based on agent ID
    let agentModule;
    switch (agent.id) {
      case 'lead-qualification':
        agentModule = await import('./leadQualificationAgent.js');
        await agentModule.runLeadQualification();
        break;
      case 'follow-up':
        agentModule = await import('./followUpAgent.js');
        await agentModule.runFollowUp();
        break;
      case 'upsell':
        agentModule = await import('./upsellAgent.js');
        await agentModule.runUpsell();
        break;
      case 'code-generator':
        // On-demand only
        return { success: false, duration: 0, error: 'On-demand agent' };
      case 'dev-helper':
        agentModule = await import('./devHelperAgent.js');
        await agentModule.runDevHelper();
        break;
      case 'workflow':
        agentModule = await import('./workflowAutomationAgent.js');
        await agentModule.runWorkflowAutomation();
        break;
      case 'deployment-status':
        agentModule = await import('./deploymentStatusAgent.js');
        await agentModule.runDeploymentStatusCheck();
        break;
      case 'art-generation':
      case 'video-generation':
      case 'ad-automation':
      case 'website-builder':
      case 'coding-assistant':
      case 'advice':
        // Creative swarm agents are on-demand only
        return { success: false, duration: 0, error: 'On-demand agent - use Creative Swarm' };
      default:
        return { success: false, duration: 0, error: 'Agent not implemented' };
    }

    const duration = (Date.now() - startTime) / 1000;
    return { success: true, duration };
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    return { success: false, duration, error: String(error) };
  }
}

// Check if dependencies are met
function checkDependencies(agent: Agent): boolean {
  if (!agent.dependencies || agent.dependencies.length === 0) {
    return true;
  }

  // Check if all dependencies have run successfully recently
  return agent.dependencies!.every((depId) => {
    const dep = agents.find((a) => a.id === depId);
    if (!dep) return false;
    
    // Check if dependency ran in last 24 hours
    if (dep.lastRun) {
      const hoursSinceRun = (Date.now() - dep.lastRun.getTime()) / (1000 * 60 * 60);
      return hoursSinceRun < 24;
    }
    
    return false;
  });
}

// Schedule next run
function scheduleNextRun(agent: Agent): Date | null {
  const now = new Date();
  
  switch (agent.schedule) {
    case 'every-2-hours':
      // Next run in 2 hours
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    case '08:00-daily':
    case '09:00-daily':
    case '11:00-daily':
      // Next run tomorrow at specified time
      const [hour, minute] = agent.schedule.split('-')[0].split(':');
      const nextRun = new Date(now);
      nextRun.setHours(parseInt(hour), parseInt(minute), 0, 0);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      return nextRun;
    
    case 'monday-10:00':
    case 'friday-14:00':
    case 'sunday-20:00':
      // Next run on specified day
      const [day, time] = agent.schedule.split('-');
      const dayMap: Record<string, number> = {
        monday: 1,
        friday: 5,
        sunday: 0,
      };
      const targetDay = dayMap[day];
      const [targetHour, targetMin] = time.split(':');
      const next = new Date(now);
      next.setHours(parseInt(targetHour), parseInt(targetMin), 0, 0);
      
      const daysUntilTarget = (targetDay - next.getDay() + 7) % 7;
      if (daysUntilTarget === 0 && next <= now) {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + daysUntilTarget);
      }
      return next;
    
    case 'on-demand':
      return null; // No scheduled runs
    
    default:
      return null;
  }
}

// Get agents to run now
export function getAgentsToRun(): Agent[] {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  return agents.filter((agent) => {
    if (agent.status !== 'active') return false;
    if (agent.schedule === 'on-demand') return false;
    
    // Check if it's time to run
    switch (agent.schedule) {
      case 'every-2-hours':
        // Run at 08:00, 10:00, 12:00, 14:00, 16:00, 18:00
        const evenHours = [8, 10, 12, 14, 16, 18];
        return evenHours.includes(currentHour) && now.getMinutes() < 15;
      
      case '08:00-daily':
        return currentHour === 8 && now.getMinutes() < 15;
      
      case '09:00-daily':
        return currentHour === 9 && now.getMinutes() < 15;
      
      case '11:00-daily':
        return currentHour === 11 && now.getMinutes() < 15;
      
      case '07:00-daily':
        return currentHour === 7 && now.getMinutes() < 15;
      
      case 'monday-10:00':
        return currentDay === 1 && currentHour === 10 && now.getMinutes() < 15;
      
      case 'friday-14:00':
        return currentDay === 5 && currentHour === 14 && now.getMinutes() < 15;
      
      case 'sunday-20:00':
        return currentDay === 0 && currentHour === 20 && now.getMinutes() < 15;
      
      default:
        return false;
    }
  });
}

// Run swarm orchestration
export async function runSwarmOrchestrator(): Promise<void> {
  console.log('🐝 Running agent swarm orchestrator...');

  const agentsToRun = getAgentsToRun();
  
  if (agentsToRun.length === 0) {
    console.log('No agents scheduled to run right now');
    return;
  }

  console.log(`Found ${agentsToRun.length} agents to run`);

  const results = [];
  
  for (const agent of agentsToRun) {
    // Check dependencies
    if (!checkDependencies(agent)) {
      console.warn(`⚠️  ${agent.name} dependencies not met, skipping`);
      continue;
    }

    console.log(`Running ${agent.name}...`);
    const result = await runAgent(agent);
    
    // Update agent status
    agent.lastRun = new Date();
    agent.nextRun = scheduleNextRun(agent);
    
    if (result.success) {
      agent.status = 'active';
      agent.avgDuration = agent.avgDuration
        ? (agent.avgDuration + result.duration) / 2
        : result.duration;
      agent.successRate = agent.successRate
        ? (agent.successRate + 100) / 2
        : 100;
      console.log(`✅ ${agent.name} completed in ${result.duration.toFixed(1)}s`);
    } else {
      agent.status = 'failed';
      agent.successRate = agent.successRate
        ? (agent.successRate + 0) / 2
        : 0;
      console.error(`❌ ${agent.name} failed: ${result.error}`);
    }

    results.push({ agent, result });
    
    // Small delay between agents
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Generate swarm status report
  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const totalAgents = agents.length;
  const successCount = results.filter((r) => r.result.success).length;

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">🐝 Agent Swarm Status</h1>
      <p><strong>Date:</strong> ${formatInTimeZone(new Date(), DEFAULT_TZ, 'yyyy-MM-dd HH:mm')}</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px;">📊 Swarm Statistics</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div>
            <div style="font-size: 32px; font-weight: bold; color: #2563eb;">${activeAgents}/${totalAgents}</div>
            <div style="color: #6b7280;">Active Agents</div>
          </div>
          <div>
            <div style="font-size: 32px; font-weight: bold; color: #16a34a;">${successCount}/${results.length}</div>
            <div style="color: #6b7280;">Successful Runs</div>
          </div>
          <div>
            <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${results.length}</div>
            <div style="color: #6b7280;">Ran This Cycle</div>
          </div>
        </div>
      </div>
      
      <h2 style="color: #1e40af; margin-top: 30px;">🔄 Run Results</h2>
      ${results.map((r) => `
        <div style="background: ${r.result.success ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${r.result.success ? '#16a34a' : '#ef4444'}; padding: 15px; margin: 10px 0; border-radius: 4px;">
          <h4 style="margin: 0;">${r.result.success ? '✅' : '❌'} ${r.agent.name}</h4>
          <p style="margin: 5px 0;">Duration: ${r.result.duration.toFixed(1)}s</p>
          ${r.result.error ? `<p style="margin: 5px 0; color: #dc2626;">Error: ${r.result.error}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  if (results.length > 0) {
    const result = await mail.send({
      to: EOD_TO.split(',').map((e) => e.trim()),
      subject: `🐝 Agent Swarm — ${successCount}/${results.length} Successful`,
      html,
    });

    if (result.ok) {
      console.log(`✅ Swarm status report sent`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSwarmOrchestrator().catch(console.error);
}

