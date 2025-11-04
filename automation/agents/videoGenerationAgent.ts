/**
 * Video Generation Agent
 * Creates AI-generated videos for ads, social media, presentations
 * Uses SVD (Stable Video Diffusion), ZeroScope, HiDiffusion
 */

import { llm, media } from '../providers.js';
import { mail } from '../providers.js';

const TO_EMAIL = process.env.VIDEO_AGENT_TO || 'dan@doorknockingsucks.com, eddy@doorknockingsucks.com';

interface VideoRequest {
  prompt?: string;
  imageUrl?: string; // For img2vid
  duration?: number; // seconds (default: 4)
  style?: 'cinematic' | 'smooth' | 'dynamic' | 'professional';
  useCase: 'ad' | 'social' | 'presentation' | 'website';
  language?: 'en' | 'es';
}

/**
 * Generate video from prompt or image
 */
export async function generateVideo(request: VideoRequest): Promise<{
  success: boolean;
  videoUrl?: string;
  error?: string;
}> {
  try {
    console.log(`🎬 Generating video: ${request.prompt || 'from image'}`);

    // If image provided, use img2vid (SVD)
    if (request.imageUrl) {
      return await generateVideoFromImage(request);
    }

    // Otherwise, generate from prompt (text2vid)
    return await generateVideoFromPrompt(request);
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Generate video from image (img2vid)
 */
async function generateVideoFromImage(request: VideoRequest): Promise<{
  success: boolean;
  videoUrl?: string;
  error?: string;
}> {
  try {
    // Try SVD first (best quality)
    const svdResult = await media.video.svd({
      imageUrl: request.imageUrl!,
      duration: request.duration || 4,
    });

    if (svdResult.ok && svdResult.url) {
      return { success: true, videoUrl: svdResult.url };
    }

    // Fallback to ZeroScope
    console.log('⚠️ SVD failed, trying ZeroScope...');
    const zeroscopeResult = await media.video.zeroscope({
      imageUrl: request.imageUrl!,
      duration: request.duration || 4,
    });

    if (zeroscopeResult.ok && zeroscopeResult.url) {
      return { success: true, videoUrl: zeroscopeResult.url };
    }

    return { success: false, error: 'All video generation methods failed' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Generate video from text prompt
 */
async function generateVideoFromPrompt(request: VideoRequest): Promise<{
  success: boolean;
  videoUrl?: string;
  error?: string;
}> {
  if (!request.prompt) {
    return { success: false, error: 'Prompt or image required' };
  }

  // Enhance prompt
  const enhancedPrompt = await enhanceVideoPrompt(request);

  // Try ZeroScope (better for text2vid)
  const zeroscopeResult = await media.video.zeroscope({
    prompt: enhancedPrompt,
    duration: request.duration || 4,
  });

  if (zeroscopeResult.ok && zeroscopeResult.url) {
    return { success: true, videoUrl: zeroscopeResult.url };
  }

  return { success: false, error: 'Video generation failed' };
}

/**
 * Enhance video prompt with AI
 */
async function enhanceVideoPrompt(request: VideoRequest): Promise<string> {
  const styleGuide = {
    cinematic: 'cinematic camera movement, smooth pan, professional cinematography',
    smooth: 'smooth motion, fluid animation, gentle movement',
    dynamic: 'dynamic movement, energetic, fast-paced',
    professional: 'professional video, clean, polished, high quality',
  };

  const useCaseGuide = {
    ad: 'marketing video, engaging, eye-catching, professional',
    social: 'social media video, short, engaging, shareable',
    presentation: 'presentation video, clear, informative, professional',
    website: 'website hero video, modern, clean, professional',
  };

  const systemPrompt = `You are an expert video director. Enhance this video prompt for AI video generation.

Original prompt: ${request.prompt}
Style: ${request.style || 'smooth'}
Use case: ${request.useCase}
Duration: ${request.duration || 4} seconds

Provide an enhanced prompt that includes:
- More descriptive motion details
- Style-specific elements: ${styleGuide[request.style || 'smooth']}
- Use case optimization: ${useCaseGuide[request.useCase]}
- Technical quality markers (4K, smooth motion, professional)

Return ONLY the enhanced prompt, nothing else.`;

  const enhanced = await llm.text({
    system: systemPrompt,
    user: request.prompt!,
    maxTokens: 200,
  });

  return enhanced.text || request.prompt!;
}

/**
 * Generate video ad sequence
 */
export async function generateVideoAdSequence(
  campaign: string,
  requests: VideoRequest[]
): Promise<{
  success: boolean;
  results: Array<{ request: VideoRequest; videoUrl?: string; error?: string }>;
}> {
  console.log(`🎬 Generating ${requests.length} videos for campaign: ${campaign}`);

  const results = [];
  
  for (const request of requests) {
    const result = await generateVideo(request);
    results.push({ request, ...result });
    
    // Rate limiting (videos take longer)
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Send summary email
  const successCount = results.filter((r) => r.success).length;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">🎬 Video Generation Complete</h1>
      <p><strong>Campaign:</strong> ${campaign}</p>
      <p><strong>Generated:</strong> ${successCount}/${requests.length} videos</p>
      
      <h2>Results</h2>
      ${results.map((r, i) => `
        <div style="background: ${r.success ? '#f0fdf4' : '#fef2f2'}; padding: 15px; margin: 10px 0; border-radius: 4px;">
          <h4>Video ${i + 1}: ${r.request.prompt || 'From Image'}</h4>
          ${r.success && r.videoUrl ? `<video src="${r.videoUrl}" controls style="max-width: 100%; border-radius: 8px;" />` : ''}
          ${r.error ? `<p style="color: #dc2626;">Error: ${r.error}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  await mail.send({
    to: TO_EMAIL.split(',').map((e) => e.trim()),
    subject: `🎬 Video Generation — ${successCount}/${requests.length} Generated`,
    html,
  });

  return { success: successCount > 0, results };
}

/**
 * Run video generation agent (on-demand)
 */
export async function runVideoGenerationAgent(): Promise<void> {
  console.log('🎬 Running Video Generation Agent...');
  console.log('✅ Video Generation Agent ready (on-demand)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runVideoGenerationAgent().catch(console.error);
}

