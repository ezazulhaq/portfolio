import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { EZAZ_PROFILE_CONTEXT } from './profileContext';
import { checkRateLimit, validateChatPayload } from './security';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

/**
 * Handles streaming chat interactions with Gemini for Ezazul's Digital Twin
 */
export async function handleChatRequest(req: Request, res: Response): Promise<void> {
  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) {
    res.status(429).json({
      error: 'Too many requests. Please slow down and try again shortly.',
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return;
  }

  // 2. Payload Validation
  const validation = validateChatPayload(req.body);
  if (!validation.valid || !validation.message) {
    res.status(400).json({ error: validation.error || 'Invalid request body' });
    return;
  }

  const { message, history = [] } = validation;

  // 3. API Key Check
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please configure it via Firebase Secrets.',
    });
    return;
  }

  // 4. Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  // Send initial keepalive/handshake
  res.write(': keep-alive\n\n');

  let isClientConnected = true;
  req.on('close', () => {
    isClientConnected = false;
  });

  const ai = new GoogleGenAI({ apiKey });

  // Format multi-turn conversation
  const contents = [
    ...history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.content }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  const modelsToTry = [DEFAULT_MODEL, ...FALLBACK_MODELS.filter((m) => m !== DEFAULT_MODEL)];

  let streamedSuccessfully = false;
  let lastError: any = null;

  for (const model of modelsToTry) {
    if (!isClientConnected) break;

    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: EZAZ_PROFILE_CONTEXT,
          temperature: 0.65,
        },
      });

      for await (const chunk of responseStream) {
        if (!isClientConnected) break;
        const textChunk = chunk.text;
        if (textChunk) {
          res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
        }
      }

      streamedSuccessfully = true;
      break; // Successfully completed streaming
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed, attempting next fallback model:`, err?.message || err);
      // If error is authentication/quota error, trying other models won't help
      if (err?.status === 401 || err?.status === 403) {
        break;
      }
    }
  }

  if (streamedSuccessfully) {
    res.write('data: [DONE]\n\n');
  } else if (isClientConnected) {
    const errorMessage = lastError?.message || 'Failed to generate response from digital twin.';
    res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
  }

  res.end();
}

