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
  
app.use(express.static(path.join(__dirname, 'public/html+css')));

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

// Handle signup POST
app.post('/signup', async (req, res) => {
    console.log(req.body);
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
