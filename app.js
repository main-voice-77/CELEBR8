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

// login for customers
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(404).send('Email not found');
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).send('Wrong password');
    }

    // Success
    res.status(200).send('Login successful');
  });
});
//login for vendors
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(404).send('Email not found');
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).send('Wrong password');
    }

    // Success
    res.status(200).send('Login successful');
  });
});
//storing booking form info
app.post('/book-event', (req, res) => {
  const {
    name,
    email,
    phone,
    eventType,
    vendorName,
    bookingFor,
    eventDate,
    eventTime,
    attendees,
    budget,
    theme,
    specs
  } = req.body;

  const sql = `
    INSERT INTO bookings (
      name, email, phone, event_type, vendor_name, booking_for,
      event_date, event_time, attendees, budget, theme, specs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    email,
    phone,
    eventType,
    vendorName,
    bookingFor,
    eventDate,
    eventTime,
    attendees,
    budget || null,
    theme || null,
    specs || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Booking insert error:', err);
      return res.status(500).send('Something went wrong while booking.');
    }

    res.redirect('/mybookings.html');
  });
});
//for custoomer bookings
app.get('/api/bookings', (req, res) => {
  const email = req.query.email;
  const query = 'SELECT * FROM bookings WHERE email = ? ORDER BY event_date DESC';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});
// ✅ Add this new API endpoint for vendor bookings
app.get('/api/vendor-bookings', (req, res) => {
  const vendorName = req.query.vendor_name;
  
  if (!vendorName) {
    return res.status(400).json({ error: 'Vendor name is required' });
  }

  const sql = 'SELECT * FROM bookings WHERE vendor_name = ? ORDER BY event_date DESC';

  db.query(sql, [vendorName], (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
    res.json(results);
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
