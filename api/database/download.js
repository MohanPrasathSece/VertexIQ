// On Vercel serverless, the filesystem is read-only and ephemeral.
// Files cannot persist between function invocations.
// All signups are emailed to the admin in real-time via SMTP.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    message: `User data is emailed to ${process.env.GMAIL_USER} on every signup. Check your inbox for signup notifications.`,
    tip: 'To persist a database on Vercel, connect Supabase, PlanetScale, or Airtable.',
  });
};
