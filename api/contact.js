const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'zyradigitalsofficial@gmail.com',
    pass: (process.env.GMAIL_PASS || 'kzzrojfvjuqabomc'),
  },
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, message, email, subject } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Nom et message requis' });
    }

    await transporter.sendMail({
      from: '"VertexIQ Contact" <zyradigitalsofficial@gmail.com>',
      to: 'zyradigitalsofficial@gmail.com',
      subject: `📩 Contact VertexIQ${subject ? ' — ' + subject : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#A78BFA,#7C3AED);padding:24px;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">Nouveau Message de Contact</h1>
          </div>
          <div style="padding:24px">
            <p><strong>Nom:</strong> ${name}</p>
            ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
            ${subject ? `<p><strong>Sujet:</strong> ${subject}</p>` : ''}
            <p><strong>Message:</strong></p>
            <blockquote style="border-left:4px solid #A78BFA;margin:0;padding:12px 16px;background:#fff;border-radius:8px;color:#444">
              ${message}
            </blockquote>
            <p style="color:#999;font-size:12px;margin-top:24px">Envoyé le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    console.error('Contact email error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
