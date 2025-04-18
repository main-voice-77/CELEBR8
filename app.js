const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the signup page at the root route ("/")
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html+css', 'customersignup.html'));
});

app.use(express.static(path.join(__dirname, 'public', 'html+css')));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // e.g., 'root'
  password: 'chikkisql@1379',
  database: 'celebr8'
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Handle customer signup POST
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
      res.send('Signup successful!');
    });
  } catch (error) {
    console.error('Hashing error:', error);
    res.status(500).send('Server error');
  }
});

// Handle vendor signup POST
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

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle optional field for "Other" service type
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
        console.error('Error inserting vendor:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.status(200).json({ success: true, message: 'Vendor registered successfully' });
    });

  } catch (error) {
    console.error('Error during vendor signup:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
