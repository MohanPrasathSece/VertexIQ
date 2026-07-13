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
    const { name, message, email, phone, subject, countryCode = 'CH' } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nom requis' });
    }

    // Name parsing
    const [first_name, ...lastNameParts] = (name || 'Unknown').trim().split(' ');
    const last_name = lastNameParts.length > 0 ? lastNameParts.join(' ') : 'Lead';

    // Dynamic country-based phone formatting
    const formattedPhone = formatPhoneForCRM(phone, countryCode);
    const countryName = countryCode.toLowerCase();

    // Send to CRM — inspect response to decide if we increment dashboard
    let crmAccepted = false;
    let crmAlreadyExists = false;

    const CRM_URL = process.env.CRM_API_URL || 'https://inwo.crmcore.me/api/lead_management/api/affiliates';
    const CRM_TOKEN = process.env.CRM_API_TOKEN || process.env.CRM_TOKEN || 'AFF_1_92cbc1bc76284e19b711bab22587d75f';

    if (CRM_URL && CRM_TOKEN) {
      const crmPayload = {
        country_name: countryName,
        description: message || 'Contact Lead',
        phone: formattedPhone,
        email: email || '',
        first_name,
        last_name,
        custom_fields: {
          Source_ID: 'website',
          How_Much_Invested: '0',
          Outline_Your_Case: message || '',
        },
      };

      try {
        // Bypass SSL certificate errors for CRM API
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const crmRes = await fetch(CRM_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': CRM_TOKEN,
            'Authorization': `Bearer ${CRM_TOKEN}`,
            'X-Affiliate-Token': CRM_TOKEN,
            'x-token': CRM_TOKEN
          },
          body: JSON.stringify(crmPayload),
        });

        const crmBody = await crmRes.text();
        const bodyStr = crmBody.toLowerCase();

        // Detect "already exists" patterns across CRM responses
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

        console.log('CRM response status:', crmRes.status, 'body:', crmBody.slice(0, 500));
      } catch (crmErr) {
        console.error('CRM error:', crmErr);
      }
    } else {
      // No CRM configured — treat as accepted
      crmAccepted = true;
    }

    // Increment lead dashboard only if CRM accepted
    if (crmAccepted) {
      await incrementLeadDashboard('contact', name, email);
    }

    // Return appropriate response
    if (crmAlreadyExists) {
      return res.status(200).json({ message: 'Message received', crmStatus: 'already_exists' });
    }
    if (crmAccepted) {
      return res.status(200).json({ message: 'Message sent', crmStatus: 'accepted' });
    } else {
      console.warn(`[Contact API] CRM did not accept the lead. Returning success with ignoredError.`);
      return res.status(200).json({ message: 'Message received', crmStatus: 'failed', ignoredError: true });
    }
  } catch (error) {
    console.error('Contact error:', error.message);
    return res.status(200).json({ message: 'Message received', crmStatus: 'failed', ignoredError: true });
  }
};
