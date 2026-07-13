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

// Country code → dial code mapping
const DIAL_CODES = {
  CH: '41', FR: '33', BE: '32', CA: '1',  US: '1',
  GB: '44', DE: '49', ES: '34', IT: '39', NL: '31',
  SE: '46', AU: '61', IN: '91', AE: '971',SG: '65',
  ZA: '27', BR: '55', MX: '52', JP: '81', CY: '357',
};

/**
 * Format a raw phone number with the correct dial code.
 * CRM expects: 00{dialCode}{localNumber}  e.g. "0041791234567"
 */
function formatPhoneForCRM(rawPhone, countryCode) {
  const dialCode = DIAL_CODES[countryCode] || '41';
  let digits = (rawPhone || '').replace(/[^0-9]/g, '');
  if (!digits) return '0000000000';

  // Remove any existing country codes to avoid duplication
  const withDoubleZero = '00' + dialCode;
  if (digits.startsWith(withDoubleZero)) {
    digits = digits.slice(withDoubleZero.length);
  } else if (digits.startsWith(dialCode) && digits.length > dialCode.length + 6) {
    digits = digits.slice(dialCode.length);
  }
  // Remove leading 0 (local format)
  if (digits.startsWith('0')) digits = digits.slice(1);

  return '00' + dialCode + digits;
}

async function incrementLeadDashboard(leadType, name, email) {
  console.log(`[Dashboard API] Incrementing lead dashboard for ${leadType} (${name}, ${email})...`);
  try {
    const response = await fetch('https://lead-dashboard-orcin.vercel.app/api/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website: 'VertexIQ',
        type: leadType,
        name: name,
        email: email
      }),
    });
    const data = await response.json();
    console.log(`[Dashboard API] Increment response status: ${response.status}`, data);
  } catch (err) {
    console.error('❌ Lead dashboard increment failed:', err.message);
  }
}

// ---- CRM Helper ----
async function pushLeadToCRM(user, description = "VertexIQ Signup", countryCode = 'CH') {
  try {
    const CRM_URL = process.env.CRM_API_URL || 'https://inwo.crmcore.me/api/lead_management/api/affiliates';
    const CRM_TOKEN = process.env.CRM_API_TOKEN || process.env.CRM_TOKEN || 'AFF_1_92cbc1bc76284e19b711bab22587d75f';

    const names = (user.name || '').trim().split(/\s+/);
    const first_name = names[0] || 'Unknown';
    const last_name = names.length > 1 ? names.slice(1).join(' ') : 'Doe';

    const formattedPhone = formatPhoneForCRM(user.phone, countryCode);
    const countryName = countryCode.toLowerCase();

    console.log(`[CRM] Pushing lead to CRM. Endpoint: ${CRM_URL}`);
    console.log(`[CRM] Payload:`, { first_name, last_name, email: user.email, phone: formattedPhone, country: countryName });

    const payload = {
      country_name: countryName,
      description: description,
      phone: formattedPhone,
      email: user.email || '',
      first_name: first_name,
      last_name: last_name,
      custom_fields: {
        Source_ID: 'website',
        How_Much_Invested: '0',
        Outline_Your_Case: user.message || ''
      }
    };

    // Bypass SSL certificate errors for CRM API (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const response = await fetch(CRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': CRM_TOKEN,
        'Authorization': `Bearer ${CRM_TOKEN}`,
        'X-Affiliate-Token': CRM_TOKEN,
        'x-token': CRM_TOKEN
      },
      body: JSON.stringify(payload)
    });

    const responseBody = await response.text();
    console.log(`[CRM] Response status: ${response.status}`);
    console.log(`[CRM] Response body:`, responseBody.slice(0, 1000));

    const bodyStr = responseBody.toLowerCase();
    let accepted = false;
    let alreadyExists = false;

    if (
      bodyStr.includes('already') ||
      bodyStr.includes('exist') ||
      bodyStr.includes('duplicate') ||
      response.status === 409 ||
      response.status === 422
    ) {
      alreadyExists = true;
      console.log(`[CRM] Lead already exists/duplicate: ${user.email}`);
    } else if (response.ok) {
      accepted = true;
      console.log(`[CRM] Lead successfully accepted by CRM: ${user.email}`);
    } else {
      console.warn(`[CRM] Lead rejected by CRM. Status: ${response.status}`);
    }

    return { accepted, alreadyExists };
  } catch (err) {
    console.error('❌ CRM push exception:', err);
    return { accepted: false, alreadyExists: false };
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
    const { name, email, phone, countryCode = 'CH' } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    console.log(`[Signup API] Request received for: ${email}`);

    const users = await getDatabase();

    if (users.find(u => u.email === email)) {
      console.warn(`[Signup API] Email already in use: ${email}`);
      return res.status(409).json({ error: 'Email already in use' });
    }

    const formattedPhone = formatPhoneForCRM(phone, countryCode);
    const countryName = countryCode.toLowerCase();

    users.push({ name, email, phone: formattedPhone, country: countryName, createdAt: new Date().toISOString() });
    await saveDatabase(users);

    // Push to CRM and await response
    const { accepted, alreadyExists } = await pushLeadToCRM({ name, email, phone }, "VertexIQ Signup", countryCode);

    if (accepted) {
      await incrementLeadDashboard('signup', name, email);
    }

    if (alreadyExists) {
      return res.status(200).json({ message: 'User signed up successfully', crmStatus: 'already_exists' });
    }
    
    if (accepted) {
      return res.status(201).json({ message: 'User signed up successfully', crmStatus: 'accepted' });
    } else {
      console.warn(`[Signup API] CRM did not accept the lead. Returning success with ignoredError.`);
      return res.status(200).json({ message: 'User signed up successfully', crmStatus: 'failed', ignoredError: true });
    }
  } catch (error) {
    console.error('❌ Signup error:', error);
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
    const { name, message, email, phone, subject, countryCode = 'CH' } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom requis' });

    console.log(`[Contact API] Request received from: ${name} (${email})`);

    const msgContent = message || '';

    // Push to CRM and await response
    const { accepted, alreadyExists } = await pushLeadToCRM(
      { name, email, phone, message: msgContent },
      "VertexIQ Contact Form",
      countryCode
    );

    if (accepted) {
      await incrementLeadDashboard('contact', name, email);
    }

    if (alreadyExists) {
      return res.status(200).json({ message: 'Message received', crmStatus: 'already_exists' });
    }
    
    if (accepted) {
      return res.status(200).json({ message: 'Message sent', crmStatus: 'accepted' });
    } else {
      console.warn(`[Contact API] CRM did not accept the lead. Returning success with ignoredError.`);
      return res.status(200).json({ message: 'Message received', crmStatus: 'failed', ignoredError: true });
    }
  } catch (error) {
    console.error('❌ Contact error:', error.message);
    res.status(200).json({ message: 'Message received', crmStatus: 'pending' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
