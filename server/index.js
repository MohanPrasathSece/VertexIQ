const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

const EXCEL_FILE_PATH = path.join(__dirname, 'users.xlsx');

// ---- SMTP transporter ----
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zyradigitalsofficial@gmail.com',
    pass: 'kzzrojfvjuqabomc',
  },
});

async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: '"VertexIQ" <zyradigitalsofficial@gmail.com>',
    to,
    subject,
    html,
  });
}

// Helper to get or create the workbook
function getWorkbook() {
  if (fs.existsSync(EXCEL_FILE_PATH)) {
    return xlsx.readFile(EXCEL_FILE_PATH);
  } else {
    const wb = xlsx.utils.book_new();
    // Create an empty worksheet with headers
    const ws = xlsx.utils.json_to_sheet([]);
    xlsx.utils.sheet_add_aoa(ws, [['Name', 'Email', 'Phone']], { origin: 'A1' });
    xlsx.utils.book_append_sheet(wb, ws, 'Users');
    xlsx.writeFile(wb, EXCEL_FILE_PATH);
    return wb;
  }
}

// Endpoint: Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const wb = getWorkbook();
    const ws = wb.Sheets['Users'];
    const users = xlsx.utils.sheet_to_json(ws);

    // Check if user already exists
    const existingUser = users.find(u => u.Email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Save user
    const newUser = {
      Name: name,
      Email: email,
      Phone: phone || '',
    };
    users.push(newUser);

    // Update worksheet
    const newWs = xlsx.utils.json_to_sheet(users);
    wb.Sheets['Users'] = newWs;
    xlsx.writeFile(wb, EXCEL_FILE_PATH);

    // Send notification email to admin
    try {
      await sendEmail({
        to: 'zyradigitalsofficial@gmail.com',
        subject: '🚀 Nouvel inscrit VertexIQ',
        html: `<h2>Nouvel inscrit</h2>
               <p><strong>Nom:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>`,
      });
    } catch (mailErr) {
      console.warn('Email notification failed:', mailErr.message);
    }

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const wb = getWorkbook();
    const ws = wb.Sheets['Users'];
    const users = xlsx.utils.sheet_to_json(ws);

    // Find the user
    const user = users.find(u => u.Email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    // Login successful
    res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.Name,
        email: user.Email,
        phone: user.Phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Download DB
app.get('/api/database/download', (req, res) => {
  if (fs.existsSync(EXCEL_FILE_PATH)) {
    res.download(EXCEL_FILE_PATH, 'vertexiq_database.xlsx');
  } else {
    res.status(404).json({ error: 'Database not found' });
  }
});

// Endpoint: Contact form (dashboard + public page)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, message, email, subject } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Nom et message requis' });
    }

    await sendEmail({
      to: 'zyradigitalsofficial@gmail.com',
      subject: `📩 Contact VertexIQ${subject ? ' — ' + subject : ''}`,
      html: `<h2>Nouveau message de contact</h2>
             <p><strong>Nom:</strong> ${name}</p>
             ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
             ${subject ? `<p><strong>Sujet:</strong> ${subject}</p>` : ''}
             <p><strong>Message:</strong></p>
             <blockquote style="border-left:3px solid #A78BFA;padding-left:12px;color:#555">${message}</blockquote>`,
    });

    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Server running on http://localhost:${PORT}`);
});
