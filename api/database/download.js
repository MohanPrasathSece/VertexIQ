import xlsx from 'xlsx';
import { list } from '@vercel/blob';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

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
    return res.status(500).json({ error: 'Internal server error' });
  }
};
