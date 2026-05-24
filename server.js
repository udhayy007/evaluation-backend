const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
// Middleware to allow frontend to communicate with backend and parse JSON
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
// This creates a file called 'users.db' in your folder. No extra software needed!
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the SQLite database.');
});

// Create the table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    password TEXT NOT NULL
)`);

// 2. BACKEND LOGIC: POST Route (To save data)
app.post('/register', (req, res) => {
    const { name, email, mobile, password } = req.body;
    
    // Safety check on backend just in case
    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Email should contain @' });
    }

    // SQL query to insert data
    const sql = 'INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)';
    db.run(sql, [name, email, mobile, password], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        // Send back success response with the new user's ID
        res.status(201).json({ id: this.lastID, name, email, mobile });
    });
});

// 3. BACKEND LOGIC: GET Route (To fetch data for frontend)
app.get('/users', (req, res) => {
    // SQL query to grab all users (excluding password for security)
    db.all('SELECT id, name, email, mobile FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // Send data to frontend
    });
});

// Start the server
app.listen(5000, () => {
    console.log('Backend Server is running on http://localhost:5000');
});