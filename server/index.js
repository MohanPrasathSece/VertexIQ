require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const EXCEL_FILE_PATH = path.join(__dirname, 'users.xlsx');

// ---- CRM Helper ----
async function pushLeadToCRM(user, description = "VertexIQ Signup") {
  try {
    const CRM_URL = process.env.CRM_API_URL || 'https://inwo.crmcore.me/api/lead_management/api/affiliates';
    const CRM_TOKEN = process.env.CRM_API_TOKEN || 'AFF_1_92cbc1bc76284e19b711bab22587d75f';

    const names = (user.name || '').trim().split(/\s+/);
    const first_name = names[0] || 'Unknown';
    const last_name = names.length > 1 ? names.slice(1).join(' ') : 'Doe';

    const payload = {
      country_name: "fr", // Defaulting to France based on language
      description: description,
      phone: user.phone || "0000000000",
      email: user.email,
      first_name: first_name,
      last_name: last_name,
      custom_fields: {
        Source_ID: "vertexiq_web",
        How_Much_Invested: "0",
        Outline_Your_Case: user.message || "Signup"
      }
    };

    const response = await fetch(CRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': CRM_TOKEN
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn('⚠️  CRM API Error:', response.status, text);
    } else {
      console.log(`✅ Lead pushed to CRM: ${user.email}`);
    }
  } catch (err) {
    console.warn('⚠️  Failed to push lead to CRM:', err.message);
  }
}

// ---- Vercel Blob Database Helper ----
const { put, list } = require('@vercel/blob');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function getDatabase() {
  try {
    const { blobs } = await list({ prefix: 'database.json', token: BLOB_TOKEN });
    if (blobs.length > 0) {
      const res = await fetch(`${blobs[0].url}?ts=${Date.now()}`, {
        headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
        cache: 'no-store'
      });
      if (res.ok) return await res.json();
    }
    return []; // Return empty array if not found
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
      addRandomSuffix: false,
      allowOverwrite: true
    });
    return true;
  } catch (err) {
    console.error('Error saving database to Blob:', err);
    return false;
  }
}

// ---- Signup ----
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const users = await getDatabase();

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    users.push({ name, email, phone: phone || '', createdAt: new Date().toISOString() });
    await saveDatabase(users);

    // Push to CRM — fire and forget
    pushLeadToCRM({ name, email, phone }, "VertexIQ Signup").catch(() => {});

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

    const users = await getDatabase();
    const user = users.find(u => u.email === email);

    if (!user) return res.status(401).json({ error: 'Invalid email' });

    res.status(200).json({
      message: 'Login successful',
      user: { name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Download Excel DB ----
app.get('/api/database/download', async (req, res) => {
  try {
    const users = await getDatabase();
    if (users.length === 0) {
      return res.status(404).json({ error: 'Database is empty' });
    }
    
    const wb = xlsx.utils.book_new();
    const formattedUsers = users.map(u => ({ Name: u.name, Email: u.email, Phone: u.phone }));
    const ws = xlsx.utils.json_to_sheet(formattedUsers);
    
    xlsx.utils.sheet_add_aoa(ws, [['Name', 'Email', 'Phone']], { origin: 'A1' });
    xlsx.utils.book_append_sheet(wb, ws, 'Users');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="vertexiq_database.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Contact form ----
app.post('/api/contact', async (req, res) => {
  try {
    const { name, message, email, subject } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom requis' });

    const msgContent = message || '';

    // Push to CRM — fire and forget
    pushLeadToCRM({ name, email, phone: req.body.phone, message: msgContent }, "VertexIQ Contact Form").catch(() => {});

    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    console.error('Contact email error:', error.message);
    res.status(200).json({ message: 'Message received' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
