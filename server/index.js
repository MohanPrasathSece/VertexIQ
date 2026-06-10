const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

const EXCEL_FILE_PATH = path.join(__dirname, 'users.xlsx');

// Helper to get or create the workbook
function getWorkbook() {
  if (fs.existsSync(EXCEL_FILE_PATH)) {
    return xlsx.readFile(EXCEL_FILE_PATH);
  } else {
    const wb = xlsx.utils.book_new();
    // Create an empty worksheet with headers
    const ws = xlsx.utils.json_to_sheet([]);
    xlsx.utils.sheet_add_aoa(ws, [['Name', 'Email', 'Phone']], { origin: 'A1' });
    xlsx.utils.book_append_sheet(wb, ws, 'Users');
    xlsx.writeFile(wb, EXCEL_FILE_PATH);
    return wb;
  }
}

// Endpoint: Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const wb = getWorkbook();
    const ws = wb.Sheets['Users'];
    const users = xlsx.utils.sheet_to_json(ws);

    // Check if user already exists
    const existingUser = users.find(u => u.Email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Append new user
    const newUser = {
      Name: name,
      Email: email,
      Phone: phone || '',
    };
    users.push(newUser);

    // Update worksheet
    const newWs = xlsx.utils.json_to_sheet(users);
    wb.Sheets['Users'] = newWs;
    xlsx.writeFile(wb, EXCEL_FILE_PATH);

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const wb = getWorkbook();
    const ws = wb.Sheets['Users'];
    const users = xlsx.utils.sheet_to_json(ws);

    // Find the user
    const user = users.find(u => u.Email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    // Login successful
    res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.Name,
        email: user.Email,
        phone: user.Phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Download DB
app.get('/api/database/download', (req, res) => {
  if (fs.existsSync(EXCEL_FILE_PATH)) {
    res.download(EXCEL_FILE_PATH, 'vertexiq_database.xlsx');
  } else {
    res.status(404).json({ error: 'Database not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Server running on http://localhost:${PORT}`);
});
