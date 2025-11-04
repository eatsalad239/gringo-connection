/**
 * Ad Automation Agent
 * Creates complete ad campaigns: copy, images, videos, targeting
 * Uses Stagehand for browser automation, Art/Video agents for media
 */

import { llm } from '../providers.js';
import { mail } from '../providers.js';
import { generateArt } from './artGenerationAgent.js';
import { generateVideo } from './videoGenerationAgent.js';

const TO_EMAIL = process.env.AD_AGENT_TO || 'dan@doorknockingsucks.com, eddy@doorknockingsucks.com';

interface AdCampaign {
  name: string;
  platform: 'facebook' | 'instagram' | 'google' | 'linkedin' | 'tiktok';
  objective: 'awareness' | 'traffic' | 'conversions' | 'engagement';
  targetAudience: string;
  budget?: number;
  duration?: number; // days
  language: 'en' | 'es';
}

interface AdCreative {
  headline: string;
  description: string;
  cta: string;
  imageUrl?: string;
  videoUrl?: string;
}

/**
 * Generate complete ad campaign
 */
export async function generateAdCampaign(campaign: AdCampaign): Promise<{
  success: boolean;
  creatives: AdCreative[];
  error?: string;
}> {
  try {
    console.log(`📢 Generating ad campaign: ${campaign.name}`);

    // Generate ad copy variations
    const creatives = await generateAdCopy(campaign);

    // Generate images for each creative
    for (const creative of creatives) {
      const imageResult = await generateArt({
        prompt: `${creative.headline}. ${creative.description}`,
        style: 'modern',
        dimensions: getAdDimensions(campaign.platform),
        useCase: 'ad',
        language: campaign.language,
      });

      if (imageResult.success) {
        creative.imageUrl = imageResult.imageUrl;
      }

      // Optional: Generate video
      if (campaign.platform === 'instagram' || campaign.platform === 'tiktok') {
        const videoResult = await generateVideo({
          prompt: `${creative.headline}. ${creative.description}`,
          duration: 15,
          style: 'dynamic',
          useCase: 'ad',
          language: campaign.language,
        });

        if (videoResult.success) {
          creative.videoUrl = videoResult.videoUrl;
        }
      }
    }

    // Send campaign summary
    await sendCampaignSummary(campaign, creatives);

    return { success: true, creatives };
  } catch (error) {
    return { success: false, creatives: [], error: String(error) };
  }
}

/**
 * Generate ad copy variations
 */
async function generateAdCopy(campaign: AdCampaign): Promise<AdCreative[]> {
  const platformGuides = {
    facebook: 'conversational, engaging, community-focused',
    instagram: 'visual, aesthetic, lifestyle-oriented',
    google: 'clear, direct, benefit-focused',
    linkedin: 'professional, B2B, value-driven',
    tiktok: 'trendy, catchy, short-form',
  };

  const objectiveGuides = {
    awareness: 'brand awareness, visibility, reach',
    traffic: 'click-through, website visits, engagement',
    conversions: 'purchases, sign-ups, actions',
    engagement: 'likes, comments, shares, interaction',
  };

  const systemPrompt = `You are an expert ad copywriter specializing in ${campaign.platform} ads.

Campaign: ${campaign.name}
Platform: ${campaign.platform}
Objective: ${campaign.objective}
Target Audience: ${campaign.targetAudience}
Language: ${campaign.language}

Generate 3 ad creative variations. Each should include:
- Headline (max 30 characters for ${campaign.platform})
- Description (max 125 characters for ${campaign.platform})
- Call-to-Action (${campaign.platform}-appropriate CTA)

Style: ${platformGuides[campaign.platform]}
Focus: ${objectiveGuides[campaign.objective]}

Return JSON array with format:
[
  {
    "headline": "...",
    "description": "...",
    "cta": "..."
  },
  ...
]`;

  const response = await llm.text({
    system: systemPrompt,
    user: `Create ad copy for: ${campaign.name}`,
    maxTokens: 1000,
  });

  try {
    const jsonMatch = response.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse ad copy JSON:', e);
  }

  // Fallback: Generate manually
  return generateFallbackAdCopy(campaign);
}

function generateFallbackAdCopy(campaign: AdCampaign): AdCreative[] {
  const ctas = {
    facebook: 'Learn More',
    instagram: 'Swipe Up',
    google: 'Get Started',
    linkedin: 'Connect',
    tiktok: 'Learn More',
  };

  return [
    {
      headline: campaign.name,
      description: `Discover ${campaign.name} - ${campaign.targetAudience}`,
      cta: ctas[campaign.platform],
    },
    {
      headline: `Transform Your ${campaign.targetAudience}`,
      description: `Join thousands using ${campaign.name}`,
      cta: ctas[campaign.platform],
    },
    {
      headline: `Get Started Today`,
      description: `${campaign.name} - Perfect for ${campaign.targetAudience}`,
      cta: ctas[campaign.platform],
    },
  ];
}

function getAdDimensions(platform: string): 'square' | 'landscape' | 'portrait' {
  const dims: Record<string, 'square' | 'landscape' | 'portrait'> = {
    facebook: 'square',
    instagram: 'square',
    google: 'landscape',
    linkedin: 'landscape',
    tiktok: 'portrait',
  };

  return dims[platform] || 'square';
}

async function sendCampaignSummary(campaign: AdCampaign, creatives: AdCreative[]): Promise<void> {
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">📢 Ad Campaign Generated</h1>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Campaign Details</h3>
        <p><strong>Name:</strong> ${campaign.name}</p>
        <p><strong>Platform:</strong> ${campaign.platform}</p>
        <p><strong>Objective:</strong> ${campaign.objective}</p>
        <p><strong>Target:</strong> ${campaign.targetAudience}</p>
        ${campaign.budget ? `<p><strong>Budget:</strong> $${campaign.budget}</p>` : ''}
      </div>

      <h2>Ad Creatives (${creatives.length})</h2>
      ${creatives.map((creative, i) => `
        <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h3>Creative ${i + 1}</h3>
          <p><strong>Headline:</strong> ${creative.headline}</p>
          <p><strong>Description:</strong> ${creative.description}</p>
          <p><strong>CTA:</strong> ${creative.cta}</p>
          ${creative.imageUrl ? `<img src="${creative.imageUrl}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;" />` : ''}
          ${creative.videoUrl ? `<video src="${creative.videoUrl}" controls style="max-width: 100%; border-radius: 8px; margin-top: 10px;" />` : ''}
        </div>
      `).join('')}

      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 30px;">
        <h3>Next Steps</h3>
        <ul>
          <li>Review and approve creatives</li>
          <li>Set up campaign in ${campaign.platform} Ads Manager</li>
          <li>Upload media assets</li>
          <li>Launch campaign</li>
        </ul>
      </div>
    </div>
  `;

  await mail.send({
    to: TO_EMAIL.split(',').map((e) => e.trim()),
    subject: `📢 Ad Campaign Generated — ${campaign.name}`,
    html,
  });
}

/**
 * Run ad automation agent (on-demand)
 */
export async function runAdAutomationAgent(): Promise<void> {
  console.log('📢 Running Ad Automation Agent...');
  console.log('✅ Ad Automation Agent ready (on-demand)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAdAutomationAgent().catch(console.error);
}

