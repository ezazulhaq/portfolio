import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { handleChatRequest } from './chatHandler';
import { handleLeadRequest } from './leadHandler';
import { checkCorsOrigin } from './security';

if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (checkCorsOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '64kb' }));

// Health check route
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'ezaz-digital-twin-api',
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Chat streaming endpoint (supports both direct and rewritten paths)
app.post(['/api/chat', '/chat'], handleChatRequest);

// Recruiter / visitor lead capture endpoint
app.post(['/api/lead', '/lead'], handleLeadRequest);

// Export Firebase Cloud Function v2
export const api = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 2,
    secrets: ['GEMINI_API_KEY'],
  },
  app
);
