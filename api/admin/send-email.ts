import type { VercelRequest, VercelResponse } from '@vercel/node';

// This endpoint proxies sending email via SendGrid. Configure SENDGRID_API_KEY and EMAIL_FROM in your environment.
// It expects JSON: { to: string, subject: string, html: string }

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, html } = req.body ?? {};
  if (!to || !subject || !html) return res.status(400).json({ error: 'Missing to, subject, or html' });

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM;
  if (!SENDGRID_API_KEY || !EMAIL_FROM) return res.status(500).json({ error: 'Email service not configured' });

  try {
    const payload = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: EMAIL_FROM },
      subject,
      content: [{ type: 'text/html', value: html }],
    };

    const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('sendgrid error', r.status, text);
      return res.status(500).json({ error: 'SendGrid error', details: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('send-email handler error', err);
    return res.status(500).json({ error: err.message ?? 'send failed' });
  }
}
