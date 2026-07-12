const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '', 
    database: process.env.MYSQLDATABASE || 'medicore_db',
    port: process.env.MYSQLPORT || 3306
});

db.connect((err) => {
    if (err) return console.error('fail to connect MySQL:', err);
    console.log('connect with MySQL Database succed! 🚀');

    // Teburorin
    db.query(`CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(255),
        customer_name VARCHAR(255),
        amount DECIMAL(10, 2),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.query(`CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255),
        password VARCHAR(255),
        role VARCHAR(255),
        name VARCHAR(255),
        staffId VARCHAR(255),
        specialty_or_ward VARCHAR(255)
    )`);

    db.query(`CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        age INT,
        gender VARCHAR(50),
        complaint TEXT
    )`);
});

// --- API Endpoints ---

// LOGIN
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;
    db.query('SELECT * FROM staff WHERE username = ? AND password = ? AND role = ?', [username, password, role], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0) res.json({ success: true, user: results[0] });
        else res.status(401).json({ success: false });
    });
});

// STAFF
app.get('/api/staff', (req, res) => {
    db.query('SELECT * FROM staff', (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json(results);
    });
});

app.post('/api/register-staff', (req, res) => {
    const { username, password, role, name, staffId, specialty } = req.body;
    db.query('INSERT INTO staff (username, password, role, name, staffId, specialty_or_ward) VALUES (?, ?, ?, ?, ?, ?)', 
    [username, password, role, name, staffId, specialty], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true });
    });
});

app.delete('/api/staff/:id', (req, res) => {
    db.query('DELETE FROM staff WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// PATIENTS
app.get('/api/patients', (req, res) => {
    db.query('SELECT * FROM patients', (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json(results);
    });
});

app.post('/api/register-patient', (req, res) => {
    // Ƙara phone da doctor a nan
    const { name, age, gender, complaint, phone, doctor } = req.body; 

    // Ƙara columns ɗin a cikin SQL query ɗin ka
    db.query('INSERT INTO patients (name, age, gender, complaint, phone, doctor) VALUES (?, ?, ?, ?, ?, ?)', 
    [name, age, gender, complaint, phone, doctor], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true });
    });
});







// --- AN ƘARA WANNAN: INVOICE ENDPOINTS ---
app.get('/api/invoices', (req, res) => {
    db.query('SELECT * FROM invoices', (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json(results);
    });
});

app.post('/api/invoices', (req, res) => {
    const { invoice_number, customer_name, amount, status } = req.body;
    db.query('INSERT INTO invoices (invoice_number, customer_name, amount, status) VALUES (?, ?, ?, ?)', 
    [invoice_number, customer_name, amount, status], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true });
    });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Backend work at port ${PORT}`));