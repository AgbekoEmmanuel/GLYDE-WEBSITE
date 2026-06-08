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
      to: ['info@glydegh.com'],
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
        <div style="font-family: sans-serif; color: #333;">
          <h2>Hi ${name},</h2>
          <p>Thank you for reaching out to GLYDE.</p>
          <p>We've received your message regarding <strong>${subject || 'your enquiry'}</strong> and our team will get back to you shortly.</p>
          <br>
          <p>Best regards,<br>The GLYDE Team</p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
