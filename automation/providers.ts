/**
 * Provider dispatch layer - gracefully degrades if keys missing
 * Never throws past boundary; returns {ok, ...} or {ok:false, reason}
 */

import { HfInference } from '@huggingface/inference';
import { retry, fetchWithRetry } from './utils/retry.js';
import { cached } from './utils/cache.js';

const hf = process.env.HUGGINGFACE_KEY
  ? new HfInference(process.env.HUGGINGFACE_KEY)
  : null;

// LLM Provider Chain: GEMINI → GROK → PERPLEXITY → AIMLAPI → POE → LOCAL
// AIMLAPI supports 300+ models - using best models for different tasks
export const llm = {
  async text(
    prompt: string,
    opts?: { maxTokens?: number; temperature?: number; system?: string; model?: string }
  ): Promise<{ ok: boolean; text?: string; reason?: string }> {
    const systemPrompt = opts?.system || '';
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    // Try Gemini (with retry and cache)
    if (process.env.GEMINI_API_KEY) {
      try {
        const cacheKey = `llm:gemini:${fullPrompt.substring(0, 100)}`;
        const result = await cached(cacheKey, async () => {
          const res = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                  maxOutputTokens: opts?.maxTokens || 2048,
                  temperature: opts?.temperature || 0.7,
                },
              }),
            },
            { maxAttempts: 3, retryableErrors: [429, 500, 502, 503, 504] }
          );
          return await res.json();
        }, 3600); // Cache for 1 hour

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          return { ok: true, text: result.candidates[0].content.parts[0].text };
        }
      } catch (e) {
        console.warn('Gemini failed:', e);
      }
    }

    // Try Grok (with retry and cache)
    if (process.env.GROK_API_KEY) {
      try {
        const cacheKey = `llm:grok:${fullPrompt.substring(0, 100)}`;
        const result = await cached(cacheKey, async () => {
          const res = await fetchWithRetry(
            'https://api.x.ai/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROK_API_KEY}`,
              },
              body: JSON.stringify({
                model: 'grok-beta',
                messages: [
                  ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                  { role: 'user', content: prompt },
                ],
                max_tokens: opts?.maxTokens || 2048,
                temperature: opts?.temperature || 0.7,
              }),
            },
            { maxAttempts: 3, retryableErrors: [429, 500, 502, 503, 504] }
          );
          return await res.json();
        }, 3600);

        if (result.choices?.[0]?.message?.content) {
          return { ok: true, text: result.choices[0].message.content };
        }
      } catch (e) {
        console.warn('Grok failed:', e);
      }
    }

    // Try Perplexity (with retry and cache)
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        const cacheKey = `llm:perplexity:${fullPrompt.substring(0, 100)}`;
        const result = await cached(cacheKey, async () => {
          const res = await fetchWithRetry(
            'https://api.perplexity.ai/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
              },
              body: JSON.stringify({
                model: 'llama-3.1-sonar-large-128k-online',
                messages: [
                  ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                  { role: 'user', content: prompt },
                ],
                max_tokens: opts?.maxTokens || 2048,
                temperature: opts?.temperature || 0.7,
              }),
            },
            { maxAttempts: 3, retryableErrors: [429, 500, 502, 503, 504] }
          );
          return await res.json();
        }, 3600);

        if (result.choices?.[0]?.message?.content) {
          return { ok: true, text: result.choices[0].message.content };
        }
      } catch (e) {
        console.warn('Perplexity failed:', e);
      }
    }

    // Try AIMLAPI (300+ models available!) with retry and cache
    if (process.env.AIMLAPI_API_KEY) {
      try {
        // Select best model based on task or use default
        // AIMLAPI supports: gpt-4-turbo, claude-3-opus, claude-3-sonnet, gemini-pro, llama-3-70b, etc.
        const aimlapiModel = opts?.model || process.env.AIMLAPI_MODEL || 'gpt-4-turbo';
        const cacheKey = `llm:aimlapi:${aimlapiModel}:${fullPrompt.substring(0, 100)}`;
        
        const result = await cached(cacheKey, async () => {
          const res = await fetchWithRetry(
            'https://api.aimlapi.com/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.AIMLAPI_API_KEY}`,
              },
              body: JSON.stringify({
                model: aimlapiModel,
                messages: [
                  ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                  { role: 'user', content: prompt },
                ],
                max_tokens: opts?.maxTokens || 2048,
                temperature: opts?.temperature || 0.7,
              }),
            },
            { maxAttempts: 3, retryableErrors: [429, 500, 502, 503, 504] }
          );
          return await res.json();
        }, 3600);

        if (result.choices?.[0]?.message?.content) {
          return { ok: true, text: result.choices[0].message.content };
        }
      } catch (e) {
        console.warn('AIMLAPI failed:', e);
      }
    }

    // Try POE (with retry and cache)
    if (process.env.POE_API_KEY) {
      try {
        const cacheKey = `llm:poe:${fullPrompt.substring(0, 100)}`;
        const result = await cached(cacheKey, async () => {
          const res = await fetchWithRetry(
            'https://api.poe.com/api/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.POE_API_KEY}`,
              },
              body: JSON.stringify({
                model: 'claude-3-opus',
                messages: [
                  ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                  { role: 'user', content: prompt },
                ],
                max_tokens: opts?.maxTokens || 2048,
                temperature: opts?.temperature || 0.7,
              }),
            },
            { maxAttempts: 3, retryableErrors: [429, 500, 502, 503, 504] }
          );
          return await res.json();
        }, 3600);

        if (result.choices?.[0]?.message?.content) {
          return { ok: true, text: result.choices[0].message.content };
        }
      } catch (e) {
        console.warn('POE failed:', e);
      }
    }

    // Try Local LLM
    if (process.env.LOCAL_LLM === 'true' && process.env.OLLAMA_URL) {
      try {
        const res = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama2',
            prompt: fullPrompt,
            stream: false,
          }),
        });
        const data = await res.json();
        if (data.response) {
          return { ok: true, text: data.response };
        }
      } catch (e) {
        console.warn('Local LLM failed:', e);
      }
    }

    return { ok: false, reason: 'No LLM provider available' };
  },
};

// Media Generation
export const media = {
  async image(
    prompt: string,
    cfg?: { refiner?: boolean; enhance?: boolean }
  ): Promise<{ ok: boolean; url?: string; buffer?: Buffer; reason?: string }> {
    if (!hf) {
      return { ok: false, reason: 'HuggingFace key missing' };
    }

    try {
      // SDXL base model
      const baseModel = 'stabilityai/stable-diffusion-xl-base-1.0';
      const image = await hf.textToImage({
        model: baseModel,
        inputs: prompt,
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      });

      // Optional refiner
      if (cfg?.refiner) {
        const refiner = await hf.textToImage({
          model: 'stabilityai/stable-diffusion-xl-refiner-1.0',
          inputs: prompt,
          parameters: {
          },
        });
        // Merge base + refiner (simplified - adjust based on actual API)
        return { ok: true, buffer: Buffer.from(await refiner.arrayBuffer()) };
      }

      return { ok: true, buffer: Buffer.from(await image.arrayBuffer()) };
    } catch (e) {
      return { ok: false, reason: `Image generation failed: ${e}` };
    }
  },

  async video(
    prompt: string,
    cfg?: { imageUrl?: string; duration?: number }
  ): Promise<{ ok: boolean; url?: string; buffer?: Buffer; reason?: string }> {
    if (!hf) {
      return { ok: false, reason: 'HuggingFace key missing' };
    }

    try {
      // Try SVD first
      if (cfg?.imageUrl) {
        try {
          const video = await hf.imageToVideo({
            model: 'stabilityai/stable-video-diffusion-img2vid',
            inputs: cfg.imageUrl,
            parameters: {
              num_inference_steps: 25,
            },
          });
          return { ok: true, buffer: Buffer.from(await video.arrayBuffer()) };
        } catch (e) {
          console.warn('SVD failed, trying ZeroScope');
        }
      }

      // Fallback to ZeroScope
      const video = await hf.textToVideo({
        model: 'cerspense/zeroscope_v2_576w',
        inputs: prompt,
        parameters: {
          num_inference_steps: 50,
        },
      });
      return { ok: true, buffer: Buffer.from(await video.arrayBuffer()) };
    } catch (e) {
      return { ok: false, reason: `Video generation failed: ${e}` };
    }
  },
};

// Mail via Resend (with retry)
export const mail = {
  async send(msg: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<{ ok: boolean; id?: string; reason?: string }> {
    if (!process.env.RESEND_API_KEY) {
      return { ok: false, reason: 'Resend API key missing' };
    }

    try {
      const res = await retry(
        async () => {
          return await fetchWithRetry(
            'https://api.resend.com/emails',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: process.env.RESEND_FROM || 'Gringo Connection <info@gringoconnection.com>',
                to: Array.isArray(msg.to) ? msg.to : [msg.to],
                subject: msg.subject,
                html: msg.html,
                text: msg.text,
                attachments: msg.attachments?.map((a) => ({
                  filename: a.filename,
                  content: a.content.toString('base64'),
                })),
              }),
            },
            { maxAttempts: 3, retryableErrors: [429, 500, 502, 503, 504] }
          );
        },
        { maxAttempts: 3 }
      );

      const data = await res.json();
      if (data.id) {
        return { ok: true, id: data.id };
      }
      return { ok: false, reason: data.error?.message || 'Unknown error' };
    } catch (e) {
      return { ok: false, reason: `Mail send failed: ${e}` };
    }
  },
};

// CRM via GoHighLevel
export const crm = {
  async lead(payload: {
    name: string;
    email: string;
    phone?: string;
    source?: string;
    tags?: string[];
  }): Promise<{ ok: boolean; id?: string; reason?: string }> {
    if (!process.env.GHL_API_KEY) {
      return { ok: false, reason: 'GHL API key missing' };
    }

    try {
      // GHL API structure - adjust based on actual endpoint
      const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          source: payload.source || 'website',
          tags: payload.tags || [],
        }),
      });

      const data = await res.json();
      if (data.contact?.id) {
        return { ok: true, id: data.contact.id };
      }
      return { ok: false, reason: data.error?.message || 'Unknown error' };
    } catch (e) {
      return { ok: false, reason: `CRM lead failed: ${e}` };
    }
  },
};

// Social Schedulers
export const schedulers = {
  async buffer(post: {
    text: string;
    mediaUrls?: string[];
    platforms?: string[];
    scheduledAt?: Date;
  }): Promise<{ ok: boolean; id?: string; reason?: string }> {
    if (!process.env.BUFFER_TOKEN) {
      return { ok: false, reason: 'Buffer token missing' };
    }

    try {
      const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BUFFER_TOKEN}`,
        },
        body: JSON.stringify({
          text: post.text,
          media: post.mediaUrls?.map((url) => ({ link: url })),
          profile_ids: post.platforms || [],
          scheduled_at: post.scheduledAt?.toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success && data.updates?.[0]?.id) {
        return { ok: true, id: data.updates[0].id };
      }
      return { ok: false, reason: data.message || 'Unknown error' };
    } catch (e) {
      return { ok: false, reason: `Buffer post failed: ${e}` };
    }
  },

  async meta(post: {
    message: string;
    mediaUrl?: string;
    scheduledPublishTime?: Date;
  }): Promise<{ ok: boolean; id?: string; reason?: string }> {
    if (!process.env.META_PAGE_ACCESS_TOKEN) {
      return { ok: false, reason: 'Meta page access token missing' };
    }

    try {
      // Meta Graph API - adjust page ID from token or env
      const pageId = process.env.META_PAGE_ID || 'me';
      const url = `https://graph.facebook.com/v18.0/${pageId}/photos`;

      const params = new URLSearchParams({
        access_token: process.env.META_PAGE_ACCESS_TOKEN,
        message: post.message,
        ...(post.mediaUrl && { url: post.mediaUrl }),
        ...(post.scheduledPublishTime && {
          scheduled_publish_time: Math.floor(post.scheduledPublishTime.getTime() / 1000).toString(),
        }),
      });

      const res = await fetchWithRetry(
        `${url}?${params}`,
        { method: 'POST' },
        { maxAttempts: 3, retryableErrors: [429, 500, 502, 503, 504] }
      );
      const data = await res.json();

      if (data.id) {
        return { ok: true, id: data.id };
      }
      return { ok: false, reason: data.error?.message || 'Unknown error' };
    } catch (e) {
      return { ok: false, reason: `Meta post failed: ${e}` };
    }
  },
};

