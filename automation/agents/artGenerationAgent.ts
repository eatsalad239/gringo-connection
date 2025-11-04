/**
 * Art Generation Agent
 * Creates AI-generated images for ads, social media, websites
 * Uses Hugging Face SDXL, HiDiffusion, etc.
 */

import { llm, media } from '../providers.js';
import { mail } from '../providers.js';

const TO_EMAIL = process.env.ART_AGENT_TO || 'dan@doorknockingsucks.com, eddy@doorknockingsucks.com';

interface ArtRequest {
  prompt: string;
  style?: 'realistic' | 'cartoon' | 'abstract' | 'modern' | 'vintage';
  dimensions?: 'square' | 'landscape' | 'portrait';
  useCase: 'ad' | 'social' | 'website' | 'presentation';
  language?: 'en' | 'es';
}

/**
 * Generate art/images based on request
 */
export async function generateArt(request: ArtRequest): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> {
  try {
    console.log(`🎨 Generating art: ${request.prompt}`);

    // Enhance prompt with style and use case
    const enhancedPrompt = await enhanceArtPrompt(request);

    // Generate image using SDXL
    const imageResult = await media.image.sdxl({
      prompt: enhancedPrompt,
      negativePrompt: getNegativePrompt(request.style),
      width: getDimensions(request.dimensions).width,
      height: getDimensions(request.dimensions).height,
    });

    if (!imageResult.ok || !imageResult.url) {
      // Fallback to HiDiffusion
      console.log('⚠️ SDXL failed, trying HiDiffusion...');
      const fallback = await media.image.hidiffusion({
        prompt: enhancedPrompt,
        width: getDimensions(request.dimensions).width,
        height: getDimensions(request.dimensions).height,
      });

      if (!fallback.ok || !fallback.url) {
        return { success: false, error: 'All image generation methods failed' };
      }

      return { success: true, imageUrl: fallback.url };
    }

    return { success: true, imageUrl: imageResult.url };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Enhance prompt with AI for better results
 */
async function enhanceArtPrompt(request: ArtRequest): Promise<string> {
  const styleGuide = {
    realistic: 'highly detailed, photorealistic, professional photography',
    cartoon: 'colorful cartoon style, animated, playful',
    abstract: 'abstract art, modern, artistic, creative',
    modern: 'modern design, clean, minimalist, contemporary',
    vintage: 'vintage style, retro, classic, nostalgic',
  };

  const useCaseGuide = {
    ad: 'marketing ad, eye-catching, professional, high quality',
    social: 'social media post, engaging, vibrant, shareable',
    website: 'website hero image, professional, modern, clean',
    presentation: 'presentation slide, professional, clear, informative',
  };

  const systemPrompt = `You are an expert art director. Enhance this art prompt to be more descriptive and effective for AI image generation.

Original prompt: ${request.prompt}
Style: ${request.style || 'realistic'}
Use case: ${request.useCase}

Provide an enhanced prompt that includes:
- More descriptive details
- Style-specific elements: ${styleGuide[request.style || 'realistic']}
- Use case optimization: ${useCaseGuide[request.useCase]}
- Technical quality markers (4K, high resolution, professional)

Return ONLY the enhanced prompt, nothing else.`;

  const enhanced = await llm.text({
    system: systemPrompt,
    user: request.prompt,
    maxTokens: 200,
  });

  return enhanced.text || request.prompt;
}

function getNegativePrompt(style?: string): string {
  const base = 'blurry, low quality, distorted, watermark, text, signature';
  
  const styleSpecific: Record<string, string> = {
    realistic: 'cartoon, anime, illustration, drawing',
    cartoon: 'photorealistic, realistic, photo',
    abstract: 'realistic, photorealistic, concrete objects',
  };

  return `${base}, ${styleSpecific[style || 'realistic'] || ''}`;
}

function getDimensions(dim?: string): { width: number; height: number } {
  const dims = {
    square: { width: 1024, height: 1024 },
    landscape: { width: 1344, height: 768 },
    portrait: { width: 768, height: 1344 },
  };

  return dims[dim || 'square'] || dims.square;
}

/**
 * Batch generate art for a campaign
 */
export async function batchGenerateArt(
  campaign: string,
  requests: ArtRequest[]
): Promise<{
  success: boolean;
  results: Array<{ request: ArtRequest; imageUrl?: string; error?: string }>;
}> {
  console.log(`🎨 Batch generating ${requests.length} images for campaign: ${campaign}`);

  const results = [];
  
  for (const request of requests) {
    const result = await generateArt(request);
    results.push({ request, ...result });
    
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Send summary email
  const successCount = results.filter((r) => r.success).length;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">🎨 Art Generation Complete</h1>
      <p><strong>Campaign:</strong> ${campaign}</p>
      <p><strong>Generated:</strong> ${successCount}/${requests.length} images</p>
      
      <h2>Results</h2>
      ${results.map((r, i) => `
        <div style="background: ${r.success ? '#f0fdf4' : '#fef2f2'}; padding: 15px; margin: 10px 0; border-radius: 4px;">
          <h4>Image ${i + 1}: ${r.request.prompt}</h4>
          ${r.success && r.imageUrl ? `<img src="${r.imageUrl}" style="max-width: 100%; border-radius: 8px;" />` : ''}
          ${r.error ? `<p style="color: #dc2626;">Error: ${r.error}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  await mail.send({
    to: TO_EMAIL.split(',').map((e) => e.trim()),
    subject: `🎨 Art Generation — ${successCount}/${requests.length} Generated`,
    html,
  });

  return { success: successCount > 0, results };
}

/**
 * Run art generation agent (on-demand)
 */
export async function runArtGenerationAgent(): Promise<void> {
  console.log('🎨 Running Art Generation Agent...');
  
  // Example: Generate art for social media posts
  // This would typically be triggered with specific requests
  console.log('✅ Art Generation Agent ready (on-demand)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runArtGenerationAgent().catch(console.error);
}

