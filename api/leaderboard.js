import { readFileSync, existsSync } from 'fs';
import path from 'path';

const IS_LOCAL = !process.env.UPSTASH_REDIS_REST_URL;
const LOCAL_DB_PATH = path.join(process.cwd(), '.local-waitlist-db.json');

let redis;
if (!IS_LOCAL) {
  const { Redis } = await import('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function localRead() {
  if (!existsSync(LOCAL_DB_PATH)) return {};
  try { return JSON.parse(readFileSync(LOCAL_DB_PATH, 'utf-8')); } catch { return {}; }
}

function formatName(fullName) {
  if (!fullName) return 'Anonymous';
  const parts = fullName.trim().split(' ');
  const first = parts[0];
  if (parts.length > 1 && parts[parts.length - 1].length > 0) {
    const last = parts[parts.length - 1];
    return `${first} ${last[0].toUpperCase()}.`;
  }
  return first;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let users = [];

    if (IS_LOCAL) {
      const db = localRead();
      users = Object.keys(db)
        .filter(key => key.startsWith('waitlist:'))
        .map(key => db[key]);
    } else {
      // Get all waitlist keys
      const keys = await redis.keys('waitlist:*');
      if (keys && keys.length > 0) {
        // mget allows fetching multiple keys at once
        const rawUsers = await redis.mget(...keys);
        // parse strings to objects, Upstash returns objects if json parsing is handled but string otherwise.
        users = rawUsers
          .filter(u => u !== null)
          .map(u => typeof u === 'string' ? JSON.parse(u) : u);
      }
    }

    // Sort by points desc, tie-breaker is joinedAt asc
    users.sort((a, b) => {
      const pointsA = a.points || 0;
      const pointsB = b.points || 0;
      if (pointsB !== pointsA) {
        return pointsB - pointsA;
      }
      return new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
    });

    // Extract top 20 and sanitize data
    const top20 = users.slice(0, 20).map((u, index) => ({
      rank: index + 1,
      name: formatName(u.name),
      points: u.points || 0
    }));

    return res.status(200).json({ success: true, leaderboard: top20 });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ error: 'Unable to fetch leaderboard' });
  }
}
