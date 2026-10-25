import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { checkRateLimit } from './security';

/**
 * Handles recording visitor / recruiter inquiries from the digital twin into Firestore
 */
export async function handleLeadRequest(req: Request, res: Response): Promise<void> {
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a few moments.' });
    return;
  }

  const { name, email, company, message } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: 'A valid email address is required' });
    return;
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'Message or inquiry details are required' });
    return;
  }

  try {
    const db = admin.firestore();
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown';

    const docRef = await db.collection('leads').add({
      name: name.trim().slice(0, 150),
      email: email.trim().toLowerCase().slice(0, 150),
      company: typeof company === 'string' ? company.trim().slice(0, 150) : '',
      message: message.trim().slice(0, 2000),
      source: 'digital-twin-chat',
      userAgent: req.headers['user-agent']?.slice(0, 255) || '',
      ip: ip.replace(/:[0-9a-fA-F]+$/, ':*'), // Anonymize last octet/hextet for privacy
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received by Ezaz. He will get back to you shortly.',
      leadId: docRef.id,
    });
  } catch (err: any) {
    console.error('Error saving lead to Firestore:', err);
    res.status(500).json({
      error: 'Failed to record your inquiry. Please feel free to email ezazulhaq.it@gmail.com directly.',
    });
  }
}

