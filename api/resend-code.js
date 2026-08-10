import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { Resend } from 'resend';
import { Redis } from '@upstash/redis';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.SITE_URL || 'https://glydegh.com';

// ─── DB abstraction (mirrors waitlist.js) ─────────────────────
const IS_LOCAL = !process.env.UPSTASH_REDIS_REST_URL;
const LOCAL_DB_PATH = path.join(process.cwd(), '.local-waitlist-db.json');

let redis;
if (!IS_LOCAL) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function localRead() {
  if (!existsSync(LOCAL_DB_PATH)) return {};
  try { return JSON.parse(readFileSync(LOCAL_DB_PATH, 'utf-8')); } catch { return {}; }
}

async function dbGet(key) {
  if (IS_LOCAL) return localRead()[key] ?? null;
  return redis.get(key);
}

// ─── Handler ──────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const normalizedEmail = email.toLowerCase().trim();
  const userKey = `waitlist:${normalizedEmail}`;

  try {
    const user = await dbGet(userKey);

    if (!user) {
      // Return success anyway to prevent email enumeration
      return res.status(200).json({ success: true });
    }

    const referralLink = `${SITE_URL}/?ref=${user.referralCode}`;

    // Resend the code email
    await resend.emails.send({
      from: 'GLYDE Team <no-reply@glydegh.com>',
      to: [normalizedEmail],
      subject: 'Your GLYDE referral code 🎁',
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;max-width:600px;line-height:1.6;padding:20px 0;">
          <h2 style="color:#1a1a1a;font-weight:700;">Hi ${user.name},</h2>
          <p>You asked for your GLYDE referral code — here it is!</p>
          <p>For every friend who joins the waitlist using your code or link, you earn <strong>+10 points</strong>.</p>

          <div style="background:#f4fdf7;border:2px solid #2ECC71;border-radius:12px;padding:24px;margin:28px 0;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#555;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Your Referral Code</p>
            <p style="margin:0 0 16px;font-size:28px;font-weight:800;letter-spacing:3px;color:#1a1a1a;">${user.referralCode}</p>
            <a href="${referralLink}" style="display:inline-block;background:#2ECC71;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:15px;">Share Your Link →</a>
            <p style="margin:12px 0 0;font-size:12px;color:#888;word-break:break-all;">${referralLink}</p>
          </div>

          <p>Your current points: <strong>${user.points || 0}</strong></p>
          <p>Friends you've referred: <strong>${(user.referredEmails || []).length}</strong></p>

          <p>Best regards,</p>
          <table cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;border-top:1px solid #eaeaea;padding-top:20px;width:100%;">
            <tr>
              <td width="70" style="padding-right:15px;border-right:2px solid #2ECC71;vertical-align:top;">
                <img src="https://www.glydegh.com/assets/logo.svg" alt="GLYDE Logo" width="60" style="display:block;max-width:60px;">
              </td>
              <td style="padding-left:15px;vertical-align:top;">
                <p style="margin:0;font-weight:bold;color:#1a1a1a;font-size:16px;">The GLYDE Team</p>
                <p style="margin:2px 0 0;color:#666;font-size:14px;">Move Smarter Across Accra</p>
                <p style="margin:6px 0 0;font-size:14px;">
                  <a href="https://www.glydegh.com" style="color:#2ECC71;text-decoration:none;font-weight:500;">www.glydegh.com</a>&nbsp;|&nbsp;
                  <a href="mailto:info@glydegh.com" style="color:#2ECC71;text-decoration:none;font-weight:500;">info@glydegh.com</a>
                </p>
              </td>
            </tr>
          </table>
        </div>
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('resend-code error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
