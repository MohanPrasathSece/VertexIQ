import { list } from '@vercel/blob';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function getDatabase() {
  if (!BLOB_TOKEN) throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
  const { blobs } = await list({ prefix: 'database.json', token: BLOB_TOKEN });
  if (blobs.length > 0) {
    const res = await fetch(blobs[0].url, {
      headers: { Authorization: `Bearer ${BLOB_TOKEN}` }
    });
    if (res.ok) return await res.json();
  }
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const users = await getDatabase();
    const user = users.find(u => u.email === email);

    if (!user) return res.status(401).json({ error: 'Invalid email' });

    return res.status(200).json({
      message: 'Login successful',
      user: { name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
