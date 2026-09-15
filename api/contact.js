// Country code → dial code mapping
const DIAL_CODES = {
  IE: '353', CH: '41', FR: '33', BE: '32', CA: '1',  US: '1',
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

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY || '6LeTTLstAAAAAEFOxv4nGhX-GanXxi8pRSl0uDP0';

async function verifyRecaptcha(token, ip) {
  if (!token) return false;
  try {
    const formData = new URLSearchParams();
    formData.append('secret', RECAPTCHA_SECRET_KEY);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    const data = await res.json();
    console.log('[reCAPTCHA] Verification result:', data);
    return data.success === true;
  } catch (err) {
    console.error('reCAPTCHA verification error:', err);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, message, email, phone, subject, countryCode = 'CH', recaptchaToken, captchaToken, turnstileToken } = req.body;
    const token = recaptchaToken || captchaToken || turnstileToken;

    // Validate Google reCAPTCHA
    if (token) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
      const isHuman = await verifyRecaptcha(token, clientIp);
      if (!isHuman) {
        return res.status(400).json({ error: 'Échec de vérification Google reCAPTCHA. Veuillez réessayer.' });
      }
    }

    if (!name) {
      return res.status(400).json({ error: 'Nom requis' });
    }

    // Name parsing
    const [first_name, ...lastNameParts] = (name || 'Unknown').trim().split(' ');
    const last_name = lastNameParts.length > 0 ? lastNameParts.join(' ') : '';

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
        let parsedJson = null;
        try {
          parsedJson = JSON.parse(crmBody);
        } catch (e) {}

        const bodyStr = crmBody.toLowerCase();
        const isDuplicateError = bodyStr.includes('already') || bodyStr.includes('exist') || (bodyStr.includes('duplicate') && !bodyStr.includes('"duplicate":false'));

        // Detect "already exists" patterns across CRM responses
        if (
          (parsedJson && (parsedJson.duplicate === true || (parsedJson.lead && parsedJson.lead.duplicate === true))) ||
          crmRes.status === 500 ||
          crmRes.status === 409 ||
          crmRes.status === 422 ||
          isDuplicateError
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
      console.warn(`[Contact API] CRM did not accept the lead. Returning 502 error.`);
      return res.status(502).json({ error: 'CRM submission failed', crmStatus: 'failed' });
    }
  } catch (error) {
    console.error('Contact error:', error.message);
    const rawMsg = (error.message || error.toString() || '').toLowerCase();
    if (rawMsg.includes('already') || rawMsg.includes('exist') || rawMsg.includes('contacted') || rawMsg.includes('500') || rawMsg.includes('internal server')) {
      return res.status(200).json({ message: 'Message received', crmStatus: 'already_exists' });
    }
    return res.status(502).json({ error: error.message || 'CRM submission failed', crmStatus: 'failed' });
  }
};
