import nodemailer from 'nodemailer';
import { put, list } from '@vercel/blob';
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
  if (!BLOB_TOKEN) throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
  const { blobs } = await list({ prefix: 'database.json', token: BLOB_TOKEN });
  if (blobs.length > 0) {
    const res = await fetch(`${blobs[0].url}?ts=${Date.now()}`, {
      headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
      cache: 'no-store'
    });
    if (res.ok) return await res.json();
  }
  return [];
}

async function saveDatabase(users) {
  if (!BLOB_TOKEN) throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
  await put('database.json', JSON.stringify(users, null, 2), {
    access: 'private',
    token: BLOB_TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

export default async function handler(req, res) {
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

    // Backend Name Parsing
    const [first_name, ...lastNameParts] = (name || "Unknown").trim().split(" ");
    const last_name = lastNameParts.length > 0 ? lastNameParts.join(" ") : "Lead";

    // Backend Swiss Phone Auto-Formatter
    let formattedPhone = (phone || "").replace(/[^0-9+]/g, '');
    if (formattedPhone) {
      if (formattedPhone.startsWith('+')) {
        formattedPhone = '00' + formattedPhone.slice(1);
      }
      if (formattedPhone.startsWith('41') && formattedPhone.length === 11) {
        formattedPhone = '00' + formattedPhone;
      }
      if (!formattedPhone.startsWith('0041')) {
        if (formattedPhone.startsWith('0') && !formattedPhone.startsWith('00')) {
          formattedPhone = '0041' + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('00')) {
          formattedPhone = '0041' + formattedPhone;
        }
      }
    } else {
      formattedPhone = "0000000000";
    }

    users.push({ name, email, phone: formattedPhone, createdAt: new Date().toISOString() });
    await saveDatabase(users);

    // Send to CRM
    if (process.env.CRM_API_URL && process.env.CRM_API_TOKEN) {
      const crmPayload = {
        country_name: "ch",
        description: "Signup Lead",
        phone: formattedPhone,
        email: email || "",
        first_name: first_name,
        last_name: last_name,
        custom_fields: {
          Source_ID: "website",
          How_Much_Invested: "0",
          Outline_Your_Case: ""
        }
      };

      try {
        await fetch(process.env.CRM_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': process.env.CRM_API_TOKEN
          },
          body: JSON.stringify(crmPayload)
        });
      } catch (crmErr) {
        console.error('CRM error:', crmErr);
      }
    }

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
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
