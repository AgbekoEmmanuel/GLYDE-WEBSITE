import { readFileSync, existsSync } from 'fs';
import path from 'path';

// ─── DB abstraction ───────────────────────────────────────────────────────────
const { Redis } = await import('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function dbGet(key) {
  return redis.get(key);
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code parameter' });

  try {
    const cleanCode = code.trim().toUpperCase();
    const referrerEmail = await dbGet(`ref:${cleanCode}`);

    if (!referrerEmail) {
      return res.status(404).json({ valid: false });
    }

    const referrerData = await dbGet(`waitlist:${referrerEmail}`);
    if (!referrerData) {
      return res.status(404).json({ valid: false });
    }

    // Return just enough to show a friendly banner — no sensitive info
    return res.status(200).json({
      valid: true,
      referrerFirstName: referrerData.name.split(' ')[0]
    });

  } catch (error) {
    console.error('check-referral error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
