require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const EXCEL_FILE_PATH = path.join(__dirname, 'users.xlsx');
const ADMIN_EMAIL = process.env.GMAIL_USER;

// ---- SMTP transporter (Gmail) ----
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"VertexIQ" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ---- Workbook helper ----
function getWorkbook() {
  if (fs.existsSync(EXCEL_FILE_PATH)) {
    return xlsx.readFile(EXCEL_FILE_PATH);
  }
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet([]);
  xlsx.utils.sheet_add_aoa(ws, [['Name', 'Email', 'Phone']], { origin: 'A1' });
  xlsx.utils.book_append_sheet(wb, ws, 'Users');
  xlsx.writeFile(wb, EXCEL_FILE_PATH);
  return wb;
}

// ---- Signup ----
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const wb = getWorkbook();
    const ws = wb.Sheets['Users'];
    const users = xlsx.utils.sheet_to_json(ws);

    if (users.find(u => u.Email === email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    users.push({ Name: name, Email: email, Phone: phone || '' });
    wb.Sheets['Users'] = xlsx.utils.json_to_sheet(users);
    xlsx.writeFile(wb, EXCEL_FILE_PATH);

    // Admin notification — fire and forget (don't fail signup if email fails)
    sendEmail({
      to: ADMIN_EMAIL,
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
    }).catch(err => console.warn('⚠️  Email failed (likely firewall):', err.message));

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Login ----
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const wb = getWorkbook();
    const users = xlsx.utils.sheet_to_json(wb.Sheets['Users']);
    const user = users.find(u => u.Email === email);

    if (!user) return res.status(401).json({ error: 'Invalid email' });

    res.status(200).json({
      message: 'Login successful',
      user: { name: user.Name, email: user.Email, phone: user.Phone },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Download Excel DB ----
app.get('/api/database/download', (req, res) => {
  if (fs.existsSync(EXCEL_FILE_PATH)) {
    res.download(EXCEL_FILE_PATH, 'vertexiq_database.xlsx');
  } else {
    res.status(404).json({ error: 'Database not found' });
  }
});

// ---- Contact form ----
app.post('/api/contact', async (req, res) => {
  try {
    const { name, message, email, subject } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Nom et message requis' });

    await sendEmail({
      to: ADMIN_EMAIL,
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
            <blockquote style="border-left:4px solid #A78BFA;margin:0;padding:12px 16px;background:#fff;border-radius:8px;color:#444">${message}</blockquote>
            <p style="color:#999;font-size:12px;margin-top:24px">Envoyé le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>`,
    });

    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    console.error('Contact email error:', error.message);
    // Still return success to user — email failure shouldn't block them
    res.status(200).json({ message: 'Message received' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  // Verify SMTP on startup
  transporter.verify((err) => {
    if (err) {
      console.warn('⚠️  SMTP not reachable (firewall?):', err.message);
      console.warn('   Emails will be skipped locally. Works fine on Vercel/production.');
    } else {
      console.log('📧 SMTP connected — emails active');
    }
  });
});
