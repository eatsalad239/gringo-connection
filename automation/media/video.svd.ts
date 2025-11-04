/**
 * Stable Video Diffusion - image to video
 */

import { HfInference } from '@huggingface/inference';

const hf = process.env.HUGGINGFACE_KEY
  ? new HfInference(process.env.HUGGINGFACE_KEY)
  : null;

export async function generateSVD(
  imageUrl: string,
  opts?: { numFrames?: number; numSteps?: number }
): Promise<{ ok: boolean; buffer?: Buffer; reason?: string }> {
  if (!hf) {
    return { ok: false, reason: 'HuggingFace key missing' };
  }

  try {
    const video = await hf.imageToVideo({
      model: 'stabilityai/stable-video-diffusion-img2vid',
      inputs: imageUrl,
      parameters: {
        num_inference_steps: opts?.numSteps || 25,
        num_frames: opts?.numFrames || 25,
      },
    });

    return { ok: true, buffer: Buffer.from(await video.arrayBuffer()) };
  } catch (e) {
    return { ok: false, reason: `SVD generation failed: ${e}` };
  }
}

