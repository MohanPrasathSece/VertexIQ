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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, message, email, phone, subject } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nom requis' });
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

    // Send to CRM
    if (process.env.CRM_API_URL && process.env.CRM_API_TOKEN) {
      const crmPayload = {
        country_name: "ch",
        description: message || "Signup Lead",
        phone: formattedPhone,
        email: email || "",
        first_name: first_name,
        last_name: last_name,
        custom_fields: {
          Source_ID: "website",
          How_Much_Invested: "0",
          Outline_Your_Case: message || ""
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
            <p><strong>Message:</strong></p>
            <blockquote style="border-left:4px solid #A78BFA;margin:0;padding:12px 16px;background:#fff;border-radius:8px;color:#444">${message}</blockquote>
            <p style="color:#999;font-size:12px;margin-top:24px">Envoyé le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>`,
    });

    return res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    console.error('Contact email error:', error.message);
    return res.status(200).json({ message: 'Message received' });
  }
};
