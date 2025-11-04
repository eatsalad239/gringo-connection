/**
 * SDXL Image Generation via Hugging Face
 */

import { HfInference } from '@huggingface/inference';

const hf = process.env.HUGGINGFACE_KEY
  ? new HfInference(process.env.HUGGINGFACE_KEY)
  : null;

export async function generateSDXL(
  prompt: string,
  opts?: { refiner?: boolean; numSteps?: number; guidanceScale?: number }
): Promise<{ ok: boolean; buffer?: Buffer; reason?: string }> {
  if (!hf) {
    return { ok: false, reason: 'HuggingFace key missing' };
  }

  try {
    const baseModel = 'stabilityai/stable-diffusion-xl-base-1.0';
    
    const image = await hf.textToImage({
      model: baseModel,
      inputs: prompt,
      parameters: {
        num_inference_steps: opts?.numSteps || 30,
        guidance_scale: opts?.guidanceScale || 7.5,
      },
    });

    let buffer = Buffer.from(await image.arrayBuffer());

    // Optional refiner pass
    if (opts?.refiner) {
      try {
        const refinerModel = 'stabilityai/stable-diffusion-xl-refiner-1.0';
        const refined = await hf.textToImage({
          model: refinerModel,
          inputs: prompt,
          parameters: {},
        });
        buffer = Buffer.from(await refined.arrayBuffer());
      } catch (e) {
        console.warn('Refiner failed, using base image:', e);
      }
    }

    return { ok: true, buffer };
  } catch (e) {
    return { ok: false, reason: `SDXL generation failed: ${e}` };
  }
}

