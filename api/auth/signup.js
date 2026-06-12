const nodemailer = require('nodemailer');
const { put, list } = require('@vercel/blob');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

async function getDatabase() {
  try {
    const { blobs } = await list({ prefix: 'database.json', token: BLOB_TOKEN });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, {
        headers: { Authorization: `Bearer ${BLOB_TOKEN}` }
      });
      if (res.ok) return await res.json();
    }
    return [];
  } catch (err) {
    console.error('Error fetching database from Blob:', err);
    return [];
  }
}

async function saveDatabase(users) {
  try {
    await put('database.json', JSON.stringify(users, null, 2), {
      access: 'private',
      token: BLOB_TOKEN,
      addRandomSuffix: false
    });
    return true;
  } catch (err) {
    console.error('Error saving database to Blob:', err);
    return false;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const users = await getDatabase();
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    users.push({ name, email, phone: phone || '', createdAt: new Date().toISOString() });
    await saveDatabase(users);

    // Send admin notification — don't block signup if email fails
    transporter.sendMail({
      from: `"VertexIQ" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: '🚀 Nouvel inscrit VertexIQ',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#A78BFA,#7C3AED);padding:24px;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">Nouvel Inscrit VertexIQ</h1>
          </div>
          <div style="padding:24px">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>
            <p style="color:#999;font-size:12px;margin-top:24px">Inscrit le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>`,
    }).catch(err => console.warn('Email failed:', err.message));

    return res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
