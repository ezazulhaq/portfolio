import { Request, Response, NextFunction } from 'express';

const ALLOWED_ORIGINS = [
  'https://portfolio-ezaz.web.app',
  'https://portfolio-ezaz.firebaseapp.com',
  'http://localhost:4200',
  'http://localhost:4201',
  'http://localhost:5000',
  'http://127.0.0.1:4200',
  'http://127.0.0.1:4201',
];

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25; // 25 requests per minute

/**
 * Validate origin for CORS requests
 */
export function checkCorsOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Direct/same-origin or server-to-server
  return ALLOWED_ORIGINS.some((allowed) => origin === allowed || origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com'));
}

/**
 * In-memory sliding rate limiter per client IP
 */
export function checkRateLimit(req: Request): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown';

  const now = Date.now();
  let record = ipRequestMap.get(ip);

  // Periodic cleanup if map grows too large
  if (ipRequestMap.size > 5000) {
    for (const [key, val] of ipRequestMap.entries()) {
      if (val.resetAt < now) {
        ipRequestMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    record = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
    ipRequestMap.set(ip, record);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

/**
 * Sanitize and validate incoming chat messages
 */
export function validateChatPayload(body: any): { valid: boolean; error?: string; message?: string; history?: Array<{ role: 'user' | 'model'; content: string }> } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const message = body.message;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { valid: false, error: 'Message is required and must be a non-empty string' };
  }

  if (message.length > 1500) {
    return { valid: false, error: 'Message exceeds maximum length of 1500 characters' };
  }

  const cleanMessage = message.trim();
  const rawHistory = Array.isArray(body.history) ? body.history : [];

  // Limit conversation history to last 10 messages for context safety
  const safeHistory = rawHistory.slice(-10).map((item: any) => ({
    role: item?.role === 'user' ? ('user' as const) : ('model' as const),
    content: typeof item?.content === 'string' ? item.content.slice(0, 1500) : '',
  }));

  return {
    valid: true,
    message: cleanMessage,
    history: safeHistory,
  };
}

