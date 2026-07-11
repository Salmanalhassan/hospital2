const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Haɗin Database na MySQL
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '', 
    database: process.env.MYSQLDATABASE || 'medicore_db',
    port: process.env.MYSQLPORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('fail to connect MySQL:', err);
        return;
    }
    console.log('connect with MySQL Database succed! 🚀');
});

// ==========================================
// API ENDPOINTS
// ==========================================

// Login
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ success: false, message: 'requred!' });

    const query = 'SELECT * FROM staff WHERE username = ? AND password = ? AND role = ?';
    db.query(query, [username, password, role], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'error connect to server.' });
        if (results.length > 0) res.json({ success: true, message: 'login was sucessfull!', user: results[0] });
        else res.status(401).json({ success: false, message: 'Username, Password or Role incorrect!' });
    });
});

// Register Staff
app.post('/api/register-staff', (req, res) => {
    const { username, password, role, name, staffId, specialty_or_ward } = req.body;
    if (!username || !password || !role || !name || !staffId) return res.status(400).json({ success: false, message: 'requred!' });

    const query = `INSERT INTO staff (username, password, role, name, staffId, specialty_or_ward) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [username, password, role, name, staffId, specialty_or_ward || null], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'error connect to server.' });
        res.status(201).json({ success: true, message: 'staff added sucessfull!' });
    });
});

// Patients
app.get('/api/patients', (req, res) => {
    db.query('SELECT * FROM patients', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'error to manage imformation.' });
        res.json(results);
    });
});

app.post('/api/patients', (req, res) => {
    const { name, age, gender, condition } = req.body;
    db.query('INSERT INTO patients (name, age, gender, `condition`) VALUES (?, ?, ?, ?)', [name, age, gender, condition], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'fail to add pattien.' });
        res.status(201).json({ success: true, id: result.insertId, message: 'pattien added succesfull!' });
    });
});

// Invoices
app.post('/api/invoices', (req, res) => {
    const { invoice_number, customer_name, amount, status } = req.body;
    if (!invoice_number || !customer_name || !amount) return res.status(400).json({ success: false, message: 'requred!' });

    db.query('INSERT INTO invoices (invoice_number, customer_name, amount, status) VALUES (?, ?, ?, ?)', [invoice_number, customer_name, amount, status || 'Pending'], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Fail to add invoice in database' });
        res.status(201).json({ success: true, message: 'succesfully added!', id: result.insertId });
    });
});

app.get('/api/invoices', (req, res) => {
    db.query('SELECT * FROM amiradata_db.invoices ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'fail to generate invoices.' });
        res.json(results);
    });
});

// Staff Management
app.get('/api/staff', (req, res) => {
    db.query('SELECT id, username, role, name, staffId, specialty_or_ward FROM staff ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'fail to add staff.' });
        res.json(results);
    });
});

app.delete('/api/staff/:id', (req, res) => {
    db.query('DELETE FROM staff WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'fail to delete staff.' });
        res.json({ success: true, message: 'An goge ma’aikaci cikin nasara!' });
    });
});

// Test Route (Hada duka guri guda)
app.get('/', (req, res) => {
  res.send('new backend MediCare works correctly!');
});

// Tayar da Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend work at port ${PORT}`);
});