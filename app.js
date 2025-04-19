const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Establishing a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost', // or your database server
  user: 'root', // replace with your database username
  password: 'chikkisql@1379', // replace with your database password
  database: 'celebr8' // replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// ✅ Serve main.html at the root route "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// ✅ Handle customer signup POST
app.post('/signup', async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    contact,
    password,
    country,
    state,
    city,
    address
  } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users 
      (first_name, last_name, email, phone, password_hash, country, state, city, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [firstname, lastname, email, contact, hash, country, state, city, address];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).send('Signup failed');
      }
      res.redirect('/customerhmp.html');

    });
  } catch (error) {
    console.error('Hashing error:', error);
    res.status(500).send('Server error');
  }
});

// ✅ Handle vendor signup POST
app.post('/vendorsignup', async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      contact,
      password,
      country,
      state,
      city,
      vendortype,
      otherService,
      experience
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalOtherService = vendortype === "Other" ? otherService : null;

    const sql = `
      INSERT INTO vendors 
        (first_name, last_name, email, contact, password_hash, country, state, city, vendortype, other_service, experience)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      firstname,
      lastname,
      email,
      contact,
      hashedPassword,
      country,
      state,
      city,
      vendortype,
      finalOtherService,
      experience
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Vendor insert error:', err);
        return res.status(500).json({ success: false, message: 'DB error' });
      }
      res.redirect('/vendorhmp.html');
    });

  } catch (error) {
    console.error('Vendor signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
