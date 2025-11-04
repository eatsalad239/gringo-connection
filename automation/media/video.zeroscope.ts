/**
 * ZeroScope Video Generation (fallback)
 */

import { HfInference } from '@huggingface/inference';

const hf = process.env.HUGGINGFACE_KEY
  ? new HfInference(process.env.HUGGINGFACE_KEY)
  : null;

export async function generateZeroScope(
  prompt: string,
  opts?: { numSteps?: number; width?: number; height?: number }
): Promise<{ ok: boolean; buffer?: Buffer; reason?: string }> {
  if (!hf) {
    return { ok: false, reason: 'HuggingFace key missing' };
  }

  try {
    const video = await hf.textToVideo({
      model: 'cerspense/zeroscope_v2_576w',
      inputs: prompt,
      parameters: {
        num_inference_steps: opts?.numSteps || 50,
        width: opts?.width || 576,
        height: opts?.height || 320,
      },
    });

    return { ok: true, buffer: Buffer.from(await video.arrayBuffer()) };
  } catch (e) {
    return { ok: false, reason: `ZeroScope generation failed: ${e}` };
  }
}

