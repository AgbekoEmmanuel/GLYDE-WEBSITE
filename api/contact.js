import { Resend } from 'resend';

// Initialize Resend with the provided API key
// NOTE: In the future, this should be: process.env.RESEND_API_KEY
const resend = new Resend('re_jEj8xf4T_4yLVCfLiFjNAEbDSnwGtUYid');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Send the notification email to GLYDE
    await resend.emails.send({
      from: 'GLYDE Website <no-reply@glydegh.com>', // MUST be a verified domain on Resend
      to: [
        'info@glydegh.com',
        'emmanuel.agbeko@glydegh.com',
        'jabez.clottey@glydegh.com',
        'lawrence.benson@glydegh.com'
      ],
      subject: `New Contact Form Submission: ${subject || 'General Enquiry'}`,
      html: `
        <h2>New Message from GLYDE Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });

    // 2. Send the automatic reply to the user
    await resend.emails.send({
      from: 'GLYDE Team <no-reply@glydegh.com>', // MUST be a verified domain on Resend
      to: [email],
      subject: 'We received your message!',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; line-height: 1.6; padding: 20px 0;">
          <h2 style="color: #1a1a1a; font-weight: 600;">Hi ${name},</h2>
          <p>Thank you for reaching out to GLYDE.</p>
          <p>We've safely received your message regarding <strong>${subject || 'your enquiry'}</strong>. A member of our team will review it and get back to you as soon as possible.</p>
          <br>
          <p>Best regards,</p>
          
          <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px; width: 100%;">
            <tr>
              <td width="70" style="padding-right: 15px; border-right: 2px solid #2ECC71; vertical-align: top;">
                <img src="https://www.glydegh.com/assets/logo.svg" alt="GLYDE Logo" width="60" style="display: block; max-width: 60px;">
              </td>
              <td style="padding-left: 15px; vertical-align: top;">
                <p style="margin: 0; font-weight: bold; color: #1a1a1a; font-size: 16px;">The GLYDE Team</p>
                <p style="margin: 2px 0 0; color: #666; font-size: 14px;">Move Smarter Across Accra</p>
                <p style="margin: 6px 0 0; font-size: 14px;">
                  <a href="https://www.glydegh.com" style="color: #2ECC71; text-decoration: none; font-weight: 500;">www.glydegh.com</a> &nbsp;|&nbsp; 
                  <a href="mailto:info@glydegh.com" style="color: #2ECC71; text-decoration: none; font-weight: 500;">info@glydegh.com</a>
                </p>
              </td>
            </tr>
          </table>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
