/**
 * Advice Agent
 * Provides business, technical, and strategic advice
 * Uses Supermemory patterns for context-aware responses
 */

import { llm } from '../providers.js';
import { mail } from '../providers.js';

const TO_EMAIL = process.env.ADVICE_AGENT_TO || 'dan@doorknockingsucks.com, eddy@doorknockingsucks.com';

interface AdviceRequest {
  question: string;
  category: 'business' | 'technical' | 'strategy' | 'marketing' | 'operations';
  context?: string; // Previous conversations, business info, etc.
  urgency?: 'low' | 'medium' | 'high';
}

/**
 * Get advice on a topic
 */
export async function getAdvice(request: AdviceRequest): Promise<{
  success: boolean;
  advice?: string;
  recommendations?: string[];
  error?: string;
}> {
  try {
    console.log(`💡 Getting advice: ${request.question}`);

    const systemPrompt = getSystemPrompt(request.category);
    const userPrompt = `${request.question}\n\n${request.context ? `Context:\n${request.context}` : ''}`;

    const response = await llm.text({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 2000,
    });

    const advice = response.text;
    const recommendations = extractRecommendations(advice);

    // Send advice summary
    await sendAdviceSummary(request, advice, recommendations);

    return {
      success: true,
      advice,
      recommendations,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

function getSystemPrompt(category: string): string {
  const prompts: Record<string, string> = {
    business: `You are an expert business consultant specializing in:
- Business strategy
- Revenue optimization
- Client acquisition
- Operations efficiency
- Growth strategies

Provide actionable, practical advice based on best practices and real-world experience.`,

    technical: `You are an expert technical consultant specializing in:
- Software architecture
- Development best practices
- Performance optimization
- Security
- Modern tech stacks

Provide clear, technical advice with code examples when relevant.`,

    strategy: `You are an expert strategic consultant specializing in:
- Long-term planning
- Market positioning
- Competitive advantage
- Resource allocation
- Strategic partnerships

Provide strategic insights and actionable plans.`,

    marketing: `You are an expert marketing consultant specializing in:
- Digital marketing
- Content strategy
- Social media
- SEO/SEM
- Brand building

Provide data-driven marketing advice and tactics.`,

    operations: `You are an expert operations consultant specializing in:
- Process optimization
- Automation
- Team management
- Workflow improvement
- Efficiency gains

Provide practical operational advice.`,
  };

  return prompts[category] || prompts.business;
}

function extractRecommendations(advice: string): string[] {
  // Extract bullet points, numbered lists, or action items
  const recommendations: string[] = [];
  
  // Match various list formats
  const patterns = [
    /(?:^|\n)[•\-\*]\s+(.+)/gm,
    /(?:^|\n)\d+\.\s+(.+)/gm,
    /(?:^|\n)Recommendation:\s*(.+)/gmi,
    /(?:^|\n)Action:\s*(.+)/gmi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(advice)) !== null) {
      recommendations.push(match[1].trim());
    }
  }

  return recommendations.slice(0, 5); // Top 5
}

async function sendAdviceSummary(
  request: AdviceRequest,
  advice: string,
  recommendations: string[]
): Promise<void> {
  const urgencyColors = {
    low: '#fef3c7',
    medium: '#fef3c7',
    high: '#fee2e2',
  };

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">💡 Advice Generated</h1>
      
      <div style="background: ${urgencyColors[request.urgency || 'medium']}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${request.urgency === 'high' ? '#dc2626' : '#f59e0b'};">
        <h3>Question</h3>
        <p><strong>Category:</strong> ${request.category}</p>
        <p><strong>Urgency:</strong> ${request.urgency || 'medium'}</p>
        <p><strong>Question:</strong> ${request.question}</p>
      </div>

      <div style="background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>Advice</h3>
        <div style="white-space: pre-wrap; line-height: 1.6;">${advice}</div>
      </div>

      ${recommendations.length > 0 ? `
        <div style="background: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Key Recommendations</h3>
          <ul>
            ${recommendations.map((r) => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  await mail.send({
    to: TO_EMAIL.split(',').map((e) => e.trim()),
    subject: `💡 Advice — ${request.category} ${request.urgency === 'high' ? '🚨' : ''}`,
    html,
  });
}

/**
 * Run advice agent (on-demand)
 */
export async function runAdviceAgent(): Promise<void> {
  console.log('💡 Running Advice Agent...');
  console.log('✅ Advice Agent ready (on-demand)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAdviceAgent().catch(console.error);
}

