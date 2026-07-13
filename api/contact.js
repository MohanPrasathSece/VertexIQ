import nodemailer from 'nodemailer';

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

async function incrementLeadDashboard(leadType) {
  try {
    await fetch('https://lead-dashboard-orcin.vercel.app/api/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: leadType }),
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

    if (process.env.CRM_API_URL && process.env.CRM_API_TOKEN) {
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
        const crmRes = await fetch(process.env.CRM_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': process.env.CRM_API_TOKEN,
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

        console.log('CRM response:', crmRes.status, crmBody.slice(0, 200));
      } catch (crmErr) {
        console.error('CRM error:', crmErr);
      }
    } else {
      // No CRM configured — treat as accepted
      crmAccepted = true;
    }

    // Increment lead dashboard only if CRM accepted
    if (crmAccepted) {
      await incrementLeadDashboard('contact');
    }

    // Send admin notification email
    await transporter.sendMail({
      from: `"VertexIQ Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
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
            <p><strong>Pays:</strong> ${countryCode}</p>
            <p><strong>Téléphone:</strong> ${formattedPhone}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left:4px solid #A78BFA;margin:0;padding:12px 16px;background:#fff;border-radius:8px;color:#444">${message}</blockquote>
            <p style="color:#999;font-size:12px;margin-top:24px">Envoyé le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>`,
    });

    // Return appropriate response
    if (crmAlreadyExists) {
      return res.status(200).json({ message: 'Message received', crmStatus: 'already_exists' });
    }
    return res.status(200).json({ message: 'Message sent', crmStatus: crmAccepted ? 'accepted' : 'pending' });

  } catch (error) {
    console.error('Contact email error:', error.message);
    return res.status(200).json({ message: 'Message received', crmStatus: 'pending' });
  }
};
