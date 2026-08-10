import { Resend } from 'resend';
import { createHash, randomBytes } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

const POINTS_PER_REFERRAL = 10;
const SITE_URL = process.env.SITE_URL || 'https://glydegh.com';

// ─── DB abstraction: Upstash Redis in prod, JSON file locally ────────────────
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
function localWrite(db) {
  writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

async function dbGet(key) {
  if (IS_LOCAL) return localRead()[key] ?? null;
  return redis.get(key);
}
async function dbSet(key, value) {
  if (IS_LOCAL) {
    const db = localRead();
    db[key] = value;
    localWrite(db);
    return;
  }
  await redis.set(key, JSON.stringify(value));
}

// ─── Unique referral code generator ──────────────────────────────────────────
function generateReferralCode(seed) {
  return 'GLYDE-' + createHash('sha256')
    .update(seed + randomBytes(8).toString('hex'))
    .digest('hex')
    .toUpperCase()
    .slice(0, 5);
}

// ─── Email: confirmation to new joiner ───────────────────────────────────────
async function sendJoinerEmail({ name, email, referralCode, points }) {
  const referralLink = `${SITE_URL}/?ref=${referralCode}`;
  await resend.emails.send({
    from: 'GLYDE Team <no-reply@glydegh.com>',
    to: [email],
    subject: "You're on the GLYDE waitlist! 🎉",
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;max-width:600px;line-height:1.6;padding:20px 0;">
        <h2 style="color:#1a1a1a;font-weight:700;">Hi ${name},</h2>
        <p>You're officially on the <strong>GLYDE waitlist</strong>! We'll reach out the moment we're ready to launch.</p>
        <p>Want to move up the list? Share your referral link — every person who joins earns you <strong>+${POINTS_PER_REFERRAL} points</strong>.</p>

        <div style="background:#f4fdf7;border:2px solid #2ECC71;border-radius:12px;padding:24px;margin:28px 0;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:#555;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Your Referral Code</p>
          <p style="margin:0 0 16px;font-size:28px;font-weight:800;letter-spacing:3px;color:#1a1a1a;">${referralCode}</p>
          <a href="${referralLink}" style="display:inline-block;background:#2ECC71;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:15px;">Share Your Link →</a>
          <p style="margin:12px 0 0;font-size:12px;color:#888;word-break:break-all;">${referralLink}</p>
        </div>

        <p>Your current points: <strong>${points}</strong></p>
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
}

// ─── Email: point award to referrer ──────────────────────────────────────────
async function sendReferrerPointsEmail({ referrerName, referrerEmail, referrerCode, newPoints }) {
  const referralLink = `${SITE_URL}/?ref=${referrerCode}`;
  await resend.emails.send({
    from: 'GLYDE Team <no-reply@glydegh.com>',
    to: [referrerEmail],
    subject: `Someone joined GLYDE through you! +${POINTS_PER_REFERRAL} points 🎉`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;max-width:600px;line-height:1.6;padding:20px 0;">
        <h2 style="color:#1a1a1a;font-weight:700;">Great news, ${referrerName}! 🎉</h2>
        <p>Someone just joined the GLYDE waitlist using your referral link. You've earned <strong>+${POINTS_PER_REFERRAL} points!</strong></p>

        <div style="background:#f4fdf7;border:2px solid #2ECC71;border-radius:12px;padding:24px;margin:28px 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#555;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Your Total Points</p>
          <p style="margin:0 0 16px;font-size:40px;font-weight:800;color:#2ECC71;">${newPoints}</p>
          <p style="margin:0 0 16px;font-size:14px;color:#555;">Keep sharing to earn more!</p>
          <a href="${referralLink}" style="display:inline-block;background:#2ECC71;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:15px;">Share Your Link →</a>
          <p style="margin:12px 0 0;font-size:12px;color:#888;word-break:break-all;">${referralLink}</p>
        </div>

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
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      name, email, phone, route, officeLocation, frustration,
      otherOfficeFrom, otherOfficeTo, from: routeFrom, to: routeTo,
      referralCode: incomingRefCode
    } = req.body;

    if (!name || !email || !route || !officeLocation || !frustration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userKey = `waitlist:${normalizedEmail}`;

    // ── Block duplicate submissions ──
    const existing = await dbGet(userKey);
    if (existing) {
      return res.status(409).json({
        error: 'already_exists',
        message: "This email is already on the waitlist! Check your inbox for your referral code."
      });
    }

    // ── Resolve referrer ──
    let referrerData = null;
    let referrerEmail = null;
    const cleanedRefCode = (incomingRefCode || '').trim().toUpperCase();

    if (cleanedRefCode) {
      referrerEmail = await dbGet(`ref:${cleanedRefCode}`);
      if (referrerEmail) {
        referrerData = await dbGet(`waitlist:${referrerEmail}`);
        if (referrerData) {
          // Prevent same-pair fraud (referrer already referred this person)
          const alreadyReferred = (referrerData.referredEmails || []).includes(normalizedEmail);
          // Also prevent self-referral
          const isSelf = referrerEmail === normalizedEmail;
          if (alreadyReferred || isSelf) {
            referrerData = null;
            referrerEmail = null;
          }
        }
      }
    }

    // ── Generate unique referral code for new user ──
    let newRefCode = generateReferralCode(normalizedEmail);
    let collision = await dbGet(`ref:${newRefCode}`);
    let attempts = 0;
    while (collision && attempts < 5) {
      newRefCode = generateReferralCode(normalizedEmail + attempts);
      collision = await dbGet(`ref:${newRefCode}`);
      attempts++;
    }

    // ── Save new user ──
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || '',
      route,
      officeLocation,
      frustration,
      otherOfficeFrom: otherOfficeFrom || '',
      otherOfficeTo: otherOfficeTo || '',
      routeFrom: routeFrom || '',
      routeTo: routeTo || '',
      referralCode: newRefCode,
      referredBy: cleanedRefCode || null,
      referredEmails: [],
      points: 0,
      joinedAt: new Date().toISOString()
    };

    await dbSet(userKey, newUser);
    await dbSet(`ref:${newRefCode}`, normalizedEmail);

    // ── Award points to referrer ──
    if (referrerData && referrerEmail) {
      referrerData.referredEmails = [...(referrerData.referredEmails || []), normalizedEmail];
      referrerData.points = (referrerData.points || 0) + POINTS_PER_REFERRAL;
      await dbSet(`waitlist:${referrerEmail}`, referrerData);

      sendReferrerPointsEmail({
        referrerName: referrerData.name,
        referrerEmail,
        referrerCode: referrerData.referralCode,
        newPoints: referrerData.points
      }).catch(err => console.error('Referrer email error:', err));
    }

    // ── Send confirmation email to new joiner ──
    await sendJoinerEmail({
      name: newUser.name,
      email: normalizedEmail,
      referralCode: newRefCode,
      points: newUser.points
    });

    // ── Notify GLYDE team ──
    resend.emails.send({
      from: 'GLYDE Website <no-reply@glydegh.com>',
      to: ['info@glydegh.com', 'emmanuel.agbeko@glydegh.com', 'jabez.clottey@glydegh.com', 'lawrence.benson@glydegh.com'],
      subject: `New Waitlist Signup: ${newUser.name}`,
      html: `
        <h2>New Waitlist Signup</h2>
        <p><strong>Name:</strong> ${newUser.name}</p>
        <p><strong>Email:</strong> ${normalizedEmail}</p>
        <p><strong>Phone:</strong> ${newUser.phone || 'N/A'}</p>
        <p><strong>Route:</strong> ${route}</p>
        <p><strong>Office Location:</strong> ${officeLocation}</p>
        <p><strong>Frustration:</strong> ${frustration}</p>
        <p><strong>Referred By Code:</strong> ${cleanedRefCode || 'None (organic)'}</p>
        <p><strong>Their New Code:</strong> ${newRefCode}</p>
      `
    }).catch(err => console.error('Team notification error:', err));

    return res.status(200).json({
      success: true,
      referralCode: newRefCode,
      referralLink: `${SITE_URL}/?ref=${newRefCode}`,
      points: newUser.points
    });

  } catch (error) {
    console.error('Waitlist API error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
