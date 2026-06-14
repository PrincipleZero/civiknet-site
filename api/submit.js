// Open-source form handler: emails CivikAccess form submissions via SMTP (Nodemailer).
// Configure these as Environment Variables in Vercel (Project → Settings → Environment Variables):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and optionally NOTIFY_TO / NOTIFY_FROM.
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let data = req.body;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { data = {}; }
    }
    data = data || {};

    // Honeypot — silently accept bot submissions without emailing.
    if (data._gotcha) { res.status(200).json({ ok: true }); return; }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    const NOTIFY_TO = process.env.NOTIFY_TO || 'rsimpson@civiknet.com';
    const NOTIFY_FROM = process.env.NOTIFY_FROM || SMTP_USER;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      res.status(500).json({ error: 'Email delivery is not configured yet.' });
      return;
    }

    const formName = String(data.form || 'Website inquiry').slice(0, 120);
    const page = String(data.page || '');
    const skip = new Set(['form', 'page', '_gotcha']);
    const lines = Object.keys(data)
      .filter((k) => !skip.has(k) && data[k] != null && String(data[k]).trim() !== '')
      .map((k) => `${k}: ${String(data[k])}`);

    const text =
      `New "${formName}" submission from the CivikAccess website\n` +
      (page ? `Page: ${page}\n` : '') +
      `\n${lines.join('\n')}\n`;

    const port = Number(SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const email = String(data.email || '');
    const replyTo = /.+@.+\..+/.test(email) ? email : undefined;

    await transporter.sendMail({
      from: `"CivikAccess website" <${NOTIFY_FROM}>`,
      to: NOTIFY_TO,
      replyTo,
      subject: `CivikAccess — ${formName}${data.name ? ' — ' + data.name : ''}`,
      text,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit error:', err);
    res.status(500).json({ error: 'Could not send. Please try again.' });
  }
};
