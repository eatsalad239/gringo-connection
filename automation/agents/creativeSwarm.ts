/**
 * Creative Swarm - Master Orchestrator
 * Coordinates all creative agents: Art, Video, Ads, Websites, Coding, Advice
 * On-demand swarm you can activate when needed
 */

import { generateArt, batchGenerateArt } from './artGenerationAgent.js';
import { generateVideo, generateVideoAdSequence } from './videoGenerationAgent.js';
import { generateAdCampaign } from './adAutomationAgent.js';
import { generateWebsite } from './websiteBuilderAgent.js';
import { handleCodingTask } from './codingAssistantAgent.js';
import { getAdvice } from './adviceAgent.js';
import { mail } from '../providers.js';

const TO_EMAIL = process.env.SWARM_TO || 'dan@doorknockingsucks.com, eddy@doorknockingsucks.com';

interface SwarmRequest {
  type: 'art' | 'video' | 'ads' | 'website' | 'coding' | 'advice' | 'all';
  task: string;
  options?: Record<string, any>;
}

/**
 * Activate creative swarm
 */
export async function activateSwarm(request: SwarmRequest): Promise<{
  success: boolean;
  results: any;
  error?: string;
}> {
  console.log(`🐝 Activating Creative Swarm: ${request.type}`);

  try {
    switch (request.type) {
      case 'art':
        return await handleArtRequest(request);
      
      case 'video':
        return await handleVideoRequest(request);
      
      case 'ads':
        return await handleAdsRequest(request);
      
      case 'website':
        return await handleWebsiteRequest(request);
      
      case 'coding':
        return await handleCodingRequest(request);
      
      case 'advice':
        return await handleAdviceRequest(request);
      
      case 'all':
        return await handleFullSwarm(request);
      
      default:
        return { success: false, results: null, error: 'Unknown swarm type' };
    }
  } catch (error) {
    return { success: false, results: null, error: String(error) };
  }
}

async function handleArtRequest(request: SwarmRequest): Promise<any> {
  if (request.options?.batch) {
    return await batchGenerateArt(
      request.options.campaign || 'Art Campaign',
      request.options.requests || []
    );
  }
  
  return await generateArt({
    prompt: request.task,
    style: request.options?.style || 'modern',
    dimensions: request.options?.dimensions || 'square',
    useCase: request.options?.useCase || 'ad',
    language: request.options?.language || 'en',
  });
}

async function handleVideoRequest(request: SwarmRequest): Promise<any> {
  if (request.options?.batch) {
    return await generateVideoAdSequence(
      request.options.campaign || 'Video Campaign',
      request.options.requests || []
    );
  }
  
  return await generateVideo({
    prompt: request.options?.prompt || request.task,
    imageUrl: request.options?.imageUrl,
    duration: request.options?.duration || 4,
    style: request.options?.style || 'smooth',
    useCase: request.options?.useCase || 'ad',
    language: request.options?.language || 'en',
  });
}

async function handleAdsRequest(request: SwarmRequest): Promise<any> {
  return await generateAdCampaign({
    name: request.options?.name || 'Ad Campaign',
    platform: request.options?.platform || 'facebook',
    objective: request.options?.objective || 'awareness',
    targetAudience: request.task,
    budget: request.options?.budget,
    duration: request.options?.duration,
    language: request.options?.language || 'en',
  });
}

async function handleWebsiteRequest(request: SwarmRequest): Promise<any> {
  return await generateWebsite({
    name: request.options?.name || 'New Website',
    type: request.options?.type || 'landing',
    pages: request.options?.pages || ['home', 'about', 'contact'],
    features: request.options?.features || [],
    style: request.options?.style || 'modern',
    language: request.options?.language || 'en',
    destination: request.options?.destination,
  });
}

async function handleCodingRequest(request: SwarmRequest): Promise<any> {
  return await handleCodingTask({
    task: request.task,
    context: request.options?.context,
    language: request.options?.language || 'typescript',
    action: request.options?.action || 'write',
    outputPath: request.options?.outputPath,
  });
}

async function handleAdviceRequest(request: SwarmRequest): Promise<any> {
  return await getAdvice({
    question: request.task,
    category: request.options?.category || 'business',
    context: request.options?.context,
    urgency: request.options?.urgency || 'medium',
  });
}

async function handleFullSwarm(request: SwarmRequest): Promise<any> {
  console.log('🐝 Running full creative swarm...');
  
  const results: Record<string, any> = {};
  
  // Run all agents in parallel
  const [art, video, ads, website, coding, advice] = await Promise.allSettled([
    handleArtRequest({ ...request, type: 'art' }),
    handleVideoRequest({ ...request, type: 'video' }),
    handleAdsRequest({ ...request, type: 'ads' }),
    handleWebsiteRequest({ ...request, type: 'website' }),
    handleCodingRequest({ ...request, type: 'coding' }),
    handleAdviceRequest({ ...request, type: 'advice' }),
  ]);

  results.art = art.status === 'fulfilled' ? art.value : { error: art.reason };
  results.video = video.status === 'fulfilled' ? video.value : { error: video.reason };
  results.ads = ads.status === 'fulfilled' ? ads.value : { error: ads.reason };
  results.website = website.status === 'fulfilled' ? website.value : { error: website.reason };
  results.coding = coding.status === 'fulfilled' ? coding.value : { error: coding.reason };
  results.advice = advice.status === 'fulfilled' ? advice.value : { error: advice.reason };

  // Send comprehensive summary
  await sendSwarmSummary(request, results);

  return { success: true, results };
}

async function sendSwarmSummary(request: SwarmRequest, results: any): Promise<void> {
  const successCount = Object.values(results).filter((r: any) => r.success !== false).length;
  
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">🐝 Creative Swarm Complete</h1>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Swarm Details</h3>
        <p><strong>Type:</strong> ${request.type}</p>
        <p><strong>Task:</strong> ${request.task}</p>
        <p><strong>Success Rate:</strong> ${successCount}/${Object.keys(results).length}</p>
      </div>

      <h2>Results</h2>
      ${Object.entries(results).map(([agent, result]: [string, any]) => `
        <div style="background: ${result.success !== false ? '#f0fdf4' : '#fef2f2'}; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid ${result.success !== false ? '#16a34a' : '#ef4444'};">
          <h4>${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent</h4>
          ${result.success !== false ? '<p>✅ Completed successfully</p>' : `<p>❌ Error: ${result.error || 'Unknown error'}</p>`}
        </div>
      `).join('')}
    </div>
  `;

  await mail.send({
    to: TO_EMAIL.split(',').map((e) => e.trim()),
    subject: `🐝 Creative Swarm — ${request.type} ${successCount > 0 ? '✅' : '❌'}`,
    html,
  });
}

/**
 * Quick commands for common tasks
 */
export const SwarmCommands = {
  // Art
  art: (prompt: string, style?: string) => activateSwarm({
    type: 'art',
    task: prompt,
    options: { style },
  }),

  // Video
  video: (prompt: string, duration?: number) => activateSwarm({
    type: 'video',
    task: prompt,
    options: { prompt, duration },
  }),

  // Ads
  ads: (campaign: string, platform: string) => activateSwarm({
    type: 'ads',
    task: campaign,
    options: { name: campaign, platform },
  }),

  // Website
  website: (name: string, type: string) => activateSwarm({
    type: 'website',
    task: name,
    options: { name, type },
  }),

  // Coding
  code: (task: string, language?: string) => activateSwarm({
    type: 'coding',
    task,
    options: { language },
  }),

  // Advice
  advice: (question: string, category?: string) => activateSwarm({
    type: 'advice',
    task: question,
    options: { category },
  }),
};

/**
 * Run creative swarm (on-demand)
 */
export async function runCreativeSwarm(): Promise<void> {
  console.log('🐝 Creative Swarm ready!');
  console.log('Available commands:');
  console.log('  - SwarmCommands.art(prompt, style)');
  console.log('  - SwarmCommands.video(prompt, duration)');
  console.log('  - SwarmCommands.ads(campaign, platform)');
  console.log('  - SwarmCommands.website(name, type)');
  console.log('  - SwarmCommands.code(task, language)');
  console.log('  - SwarmCommands.advice(question, category)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCreativeSwarm().catch(console.error);
}

