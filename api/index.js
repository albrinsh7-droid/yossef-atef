const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); 
const fs = require('fs');
const path = require('path');
const app = express();

const API_BASE = '/api';
app.use(express.json());
app.use(cors()); 

const dbConfig = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
    charset: 'utf8mb4' // سر اللغة العربية
};

app.get(`${API_BASE}/setup`, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query('SET NAMES utf8mb4');
        const sql = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
        await connection.query(sql);
        await connection.end();
        res.send('✅ Database setup successfully! Arabic Fixed.');
    } catch (e) { res.status(500).send('❌ Setup failed: ' + e.message); }
});

app.get(`${API_BASE}/flights`, async (req, res) => {
    const { departure, destination } = req.query;
    let sql = 'SELECT * FROM Flights WHERE 1=1';
    const params = [];
    if (departure) { sql += ` AND departure_city LIKE ?`; params.push(`%${departure}%`); }
    if (destination) { sql += ` AND destination_city LIKE ?`; params.push(`%${destination}%`); }

    try {
        const dbPool = mysql.createPool(dbConfig);
        const [rows] = await dbPool.query(sql, params);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post(`${API_BASE}/bookings`, async (req, res) => {
    const { flightId, passengerName, passengers } = req.body;
    const bookingReference = 'BK-' + Math.random().toString(36).slice(2,8).toUpperCase();
    try {
        const dbPool = mysql.createPool(dbConfig);
        await dbPool.query(
            'INSERT INTO Bookings (bookingReference, passengerName, passengers, FlightId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())', 
            [bookingReference, passengerName, passengers, flightId]
        );
        res.json({ bookingReference });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get(`${API_BASE}/bookings`, async (req, res) => {
    try {
        const dbPool = mysql.createPool(dbConfig);
        const [rows] = await dbPool.query(`SELECT b.*, f.airline FROM Bookings b LEFT JOIN Flights f ON b.FlightId = f.id ORDER BY b.createdAt DESC`);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = app;
