/**
 * Coding Assistant Agent
 * Helps with coding tasks, debugging, refactoring, best practices
 * Uses Claude Code patterns + codebase understanding
 */

import { llm } from '../providers.js';
import { mail } from '../providers.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const TO_EMAIL = process.env.CODING_AGENT_TO || 'dan@doorknockingsucks.com, eddy@doorknockingsucks.com';

interface CodingTask {
  task: string;
  context?: string; // File paths, code snippets, etc.
  language?: 'typescript' | 'javascript' | 'python' | 'bash';
  action: 'write' | 'debug' | 'refactor' | 'explain' | 'optimize';
  outputPath?: string;
}

/**
 * Handle coding task
 */
export async function handleCodingTask(task: CodingTask): Promise<{
  success: boolean;
  code?: string;
  explanation?: string;
  error?: string;
}> {
  try {
    console.log(`💻 Handling coding task: ${task.task}`);

    let contextCode = '';
    if (task.context) {
      // Read context files if provided
      const contextFiles = task.context.split(',').map((f) => f.trim());
      for (const file of contextFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          contextCode += `\n\n// ${file}\n${content}`;
        } catch (e) {
          console.warn(`Could not read ${file}:`, e);
        }
      }
    }

    const systemPrompt = getSystemPrompt(task);
    const userPrompt = `${task.task}\n\n${contextCode ? `Context:\n${contextCode}` : ''}`;

    const response = await llm.text({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 4000,
    });

    const result = parseCodeResponse(response.text, task.action);

    // Save code if output path provided
    if (result.code && task.outputPath) {
      await fs.mkdir(path.dirname(task.outputPath), { recursive: true });
      await fs.writeFile(task.outputPath, result.code);
    }

    // Send summary
    await sendCodingSummary(task, result);

    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

function getSystemPrompt(task: CodingTask): string {
  const basePrompt = `You are an expert ${task.language || 'TypeScript'} developer.`;

  const actionPrompts = {
    write: `Write clean, production-ready code following best practices:
- TypeScript types
- Error handling
- Comments for complex logic
- Modern syntax
- Performance optimized`,
    
    debug: `Debug the code and provide:
- Root cause analysis
- Fixed code
- Explanation of the bug
- Prevention tips`,
    
    refactor: `Refactor the code to be:
- More maintainable
- Better organized
- Following best practices
- More readable
- Well documented`,
    
    explain: `Explain the code clearly:
- What it does
- How it works
- Key concepts
- Potential issues
- Best practices`,
    
    optimize: `Optimize the code for:
- Performance
- Memory usage
- Readability
- Maintainability
- Best practices`,
  };

  return `${basePrompt}\n\n${actionPrompts[task.action]}\n\nReturn code in markdown code blocks with language specified.`;
}

function parseCodeResponse(text: string, action: string): {
  success: boolean;
  code?: string;
  explanation?: string;
  error?: string;
} {
  // Extract code blocks
  const codeBlockRegex = /```(?:typescript|javascript|ts|js|python|bash)?\n([\s\S]*?)```/g;
  const codeBlocks: string[] = [];
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    codeBlocks.push(match[1]);
  }

  // Extract explanation (text outside code blocks)
  const explanation = text.replace(codeBlockRegex, '').trim();

  if (action === 'explain') {
    return {
      success: true,
      explanation: explanation || text,
    };
  }

  if (codeBlocks.length === 0) {
    return {
      success: false,
      error: 'No code found in response',
      explanation,
    };
  }

  return {
    success: true,
    code: codeBlocks[0],
    explanation: explanation || undefined,
  };
}

async function sendCodingSummary(task: CodingTask, result: {
  success: boolean;
  code?: string;
  explanation?: string;
  error?: string;
}): Promise<void> {
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">💻 Coding Task ${result.success ? 'Completed' : 'Failed'}</h1>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Task Details</h3>
        <p><strong>Action:</strong> ${task.action}</p>
        <p><strong>Language:</strong> ${task.language || 'TypeScript'}</p>
        <p><strong>Task:</strong> ${task.task}</p>
        ${task.outputPath ? `<p><strong>Output:</strong> <code>${task.outputPath}</code></p>` : ''}
      </div>

      ${result.code ? `
        <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Generated Code</h3>
          <pre style="background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 8px; overflow-x: auto;"><code>${result.code}</code></pre>
        </div>
      ` : ''}

      ${result.explanation ? `
        <div style="background: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Explanation</h3>
          <p>${result.explanation}</p>
        </div>
      ` : ''}

      ${result.error ? `
        <div style="background: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Error</h3>
          <p style="color: #dc2626;">${result.error}</p>
        </div>
      ` : ''}
    </div>
  `;

  await mail.send({
    to: TO_EMAIL.split(',').map((e) => e.trim()),
    subject: `💻 Coding Task — ${task.action} ${result.success ? '✅' : '❌'}`,
    html,
  });
}

/**
 * Run coding assistant agent (on-demand)
 */
export async function runCodingAssistantAgent(): Promise<void> {
  console.log('💻 Running Coding Assistant Agent...');
  console.log('✅ Coding Assistant Agent ready (on-demand)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCodingAssistantAgent().catch(console.error);
}

