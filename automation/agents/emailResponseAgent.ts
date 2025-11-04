/**
 * Email Response Agent - Creative Operations Agent
 * Generates email responses in real-time, drafts replies based on context
 * Uses creative AI to craft personalized, professional responses
 */

import { llm } from '../providers.js';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  attachments?: string[];
}

interface EmailResponse {
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'formal' | 'casual';
  suggestedActions?: string[];
  urgency: 'low' | 'medium' | 'high';
}

// Generate creative email response
export async function generateEmailResponse(
  originalEmail: Email,
  context?: {
    previousEmails?: Email[];
    clientInfo?: { name: string; company?: string; relationship?: string };
    language?: 'en' | 'es';
  }
): Promise<EmailResponse> {
  const language = context?.language || 'en';
  const isEs = language === 'es';

  const contextInfo = context?.clientInfo
    ? `Client: ${context.clientInfo.name}${context.clientInfo.company ? ` (${context.clientInfo.company})` : ''}\nRelationship: ${context.clientInfo.relationship || 'Client'}\n`
    : '';

  const previousContext = context?.previousEmails
    ? `Previous emails:\n${context.previousEmails.map((e) => `- ${e.subject}: ${e.body.substring(0, 100)}...`).join('\n')}\n`
    : '';

  const prompt = isEs
    ? `Eres un experto en redacción de emails profesionales y efectivos.

Email original:
De: ${originalEmail.from}
Asunto: ${originalEmail.subject}
Cuerpo: ${originalEmail.body}

${contextInfo}${previousContext}

Genera una respuesta profesional que:
1. Sea relevante y directa
2. Responda todas las preguntas/puntos del email original
3. Mantenga un tono apropiado (profesional pero cálido)
4. Sea clara y fácil de entender
5. Incluya llamados a la acción específicos si es necesario
6. Sea personalizada (no genérica)

Considera:
- El tono del email original (formal, casual, urgente, etc.)
- Si requiere respuesta inmediata o puede esperar
- Qué información adicional podría ser útil incluir
- Si hay oportunidades de venta o upsell (sutilmente)

Genera JSON:
{
  "subject": "Re: [asunto original] o nuevo asunto más específico",
  "body": "cuerpo completo del email (2-4 párrafos)",
  "tone": "professional|friendly|formal|casual",
  "suggestedActions": ["acción1", "acción2"],
  "urgency": "low|medium|high"
}`
    : `You are an expert at writing professional, effective emails.

Original email:
From: ${originalEmail.from}
Subject: ${originalEmail.subject}
Body: ${originalEmail.body}

${contextInfo}${previousContext}

Generate a professional response that:
1. Is relevant and direct
2. Answers all questions/points from the original email
3. Maintains appropriate tone (professional but warm)
4. Is clear and easy to understand
5. Includes specific calls to action if needed
6. Is personalized (not generic)

Consider:
- The tone of the original email (formal, casual, urgent, etc.)
- Whether it requires immediate response or can wait
- What additional information might be useful to include
- If there are sales or upsell opportunities (subtly)

Generate JSON:
{
  "subject": "Re: [original subject] or new more specific subject",
  "body": "complete email body (2-4 paragraphs)",
  "tone": "professional|friendly|formal|casual",
  "suggestedActions": ["action1", "action2"],
  "urgency": "low|medium|high"
}`;

  try {
    const result = await llm.text(prompt, {
      model: process.env.OLLAMA_MODEL_QUALITY || 'phi3:mini',
      temperature: 0.7, // Balanced creativity
      maxTokens: 1500,
    });

    if (!result.ok || !result.text) {
      throw new Error(result.reason || 'Failed to generate email response');
    }

    const response = result.text;

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        subject: parsed.subject || `Re: ${originalEmail.subject}`,
        body: parsed.body || response,
        tone: parsed.tone || 'professional',
        suggestedActions: parsed.suggestedActions || [],
        urgency: parsed.urgency || 'medium',
      };
    }

    // Fallback
    return {
      subject: `Re: ${originalEmail.subject}`,
      body: response,
      tone: 'professional',
      urgency: 'medium',
    };
  } catch (error) {
    console.error('Error generating email response:', error);
    throw error;
  }
}

// Quick response generator (for common templates)
export async function generateQuickResponse(
  intent: 'thank-you' | 'follow-up' | 'pricing' | 'scheduling' | 'support',
  language: 'en' | 'es' = 'en'
): Promise<string> {
  const templates = {
    'thank-you': {
      en: 'Thank you for reaching out! We appreciate your interest and will get back to you soon.',
      es: '¡Gracias por contactarnos! Apreciamos tu interés y te responderemos pronto.',
    },
    'follow-up': {
      en: 'Following up on our previous conversation. How can we help move things forward?',
      es: 'Siguiendo con nuestra conversación anterior. ¿Cómo podemos ayudar a avanzar?',
    },
    'pricing': {
      en: 'I\'d be happy to discuss pricing options that fit your budget. Let\'s schedule a call.',
      es: 'Estaré encantado de discutir opciones de precios que se ajusten a tu presupuesto. Agendemos una llamada.',
    },
    'scheduling': {
      en: 'Let\'s find a time that works for both of us. Here are some options...',
      es: 'Encontremos un momento que funcione para ambos. Aquí hay algunas opciones...',
    },
    'support': {
      en: 'I\'m here to help! Let me look into this and get back to you.',
      es: '¡Estoy aquí para ayudar! Déjame revisar esto y te responderé.',
    },
  };

  return templates[intent][language];
}

