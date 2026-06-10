// On Vercel serverless, the filesystem is read-only and ephemeral.
// We can't persist an Excel file between requests.
// This endpoint returns a note explaining how to get the data,
// and all signups are emailed to the admin in real-time.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Return a helpful JSON response
  return res.status(200).json({
    message: 'On Vercel serverless, user data is emailed to zyradigitalsofficial@gmail.com on every signup. Check your inbox for individual signup notifications.',
    tip: 'To collect data in a database, connect a service like PlanetScale, Supabase, or Airtable.',
  });
};
