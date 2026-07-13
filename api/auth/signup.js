import { put, list } from '@vercel/blob';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

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
  // Strip everything except digits and leading +
  let digits = (rawPhone || '').replace(/[^0-9]/g, '');
  if (!digits) return '0000000000';

  // Remove any existing country codes to avoid duplication
  // Remove leading 00 + dialCode OR leading dialCode if it matches
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

async function incrementLeadDashboard(leadType, name, email) {
  try {
    await fetch('https://lead-dashboard-orcin.vercel.app/api/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website: 'VertexIQ',
        type: leadType,
        name: name,
        email: email
      }),
    });
  } catch (err) {
    console.warn('Lead dashboard increment failed:', err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, countryCode = 'CH' } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const users = await getDatabase();
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Name parsing
    const [first_name, ...lastNameParts] = (name || 'Unknown').trim().split(' ');
    const last_name = lastNameParts.length > 0 ? lastNameParts.join(' ') : 'Lead';

    // Dynamic country-based phone formatting
    const formattedPhone = formatPhoneForCRM(phone, countryCode);
    const countryName = countryCode.toLowerCase();

    // Save to local database
    users.push({ name, email, phone: formattedPhone, country: countryName, createdAt: new Date().toISOString() });
    await saveDatabase(users);

    // Send to CRM — inspect response to decide if we increment dashboard
    let crmAccepted = false;
    let crmAlreadyExists = false;

    if (process.env.CRM_API_URL && process.env.CRM_API_TOKEN) {
      const crmPayload = {
        country_name: countryName,
        description: 'Signup Lead',
        phone: formattedPhone,
        email: email || '',
        first_name,
        last_name,
        custom_fields: {
          Source_ID: 'website',
          How_Much_Invested: '0',
          Outline_Your_Case: '',
        },
      };

      try {
        const crmRes = await fetch(process.env.CRM_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': process.env.CRM_API_TOKEN,
          },
          body: JSON.stringify(crmPayload),
        });

        const crmBody = await crmRes.text();
        const crmJson = (() => { try { return JSON.parse(crmBody); } catch { return {}; } })();

        // Detect "already exists" patterns across CRM responses
        const bodyStr = crmBody.toLowerCase();
        if (
          bodyStr.includes('already') ||
          bodyStr.includes('exist') ||
          bodyStr.includes('duplicate') ||
          crmRes.status === 409 ||
          crmRes.status === 422
        ) {
          crmAlreadyExists = true;
        } else if (crmRes.ok) {
          crmAccepted = true;
        }

        console.log('CRM response:', crmRes.status, crmBody.slice(0, 200));
      } catch (crmErr) {
        console.error('CRM error:', crmErr);
      }
    } else {
      // No CRM configured — treat as accepted so dashboard still increments
      crmAccepted = true;
    }

    // Increment lead dashboard only if CRM accepted the lead
    if (crmAccepted) {
      await incrementLeadDashboard('signup', name, email);
    }

    // Return appropriate response

    // Return appropriate response
    if (crmAlreadyExists) {
      return res.status(200).json({ message: 'User signed up successfully', crmStatus: 'already_exists' });
    }
    return res.status(201).json({ message: 'User signed up successfully', crmStatus: crmAccepted ? 'accepted' : 'pending' });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
