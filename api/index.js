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
    multipleStatements: true 
};

app.get(`${API_BASE}/setup`, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const sqlPath = path.join(__dirname, 'setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await connection.query(sql);
        await connection.end();
        res.send('✅ Database setup successfully! Tables created and demo data added.');
    } catch (error) {
        console.error('Setup Error:', error);
        res.status(500).send('❌ Setup failed: ' + error.message);
    }
});

app.get(`${API_BASE}/flights`, async (req, res) => {
    const { departure, destination } = req.query;
    let sql = 'SELECT * FROM Flights WHERE 1=1';
    const params = [];

    const normalizeArabic = (str) => {
        if (!str) return '';
        return str
            .replace(/[أإآ]/g, 'a') // تحويل كل الألفات لشيء واحد
            .replace(/ة/g, 'h');    // التاء المربوطة لـ هاء
    };

    if (departure) {
        const normalized = normalizeArabic(departure);
        sql += ` AND REPLACE(REPLACE(REPLACE(REPLACE(departure_city, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ة', 'ه') LIKE ?`;
        params.push(`%${departure.replace(/ة/g, 'ه').replace(/[أإآ]/g, 'ا')}%`);
    }
    if (destination) {
        sql += ` AND REPLACE(REPLACE(REPLACE(REPLACE(destination_city, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ة', 'ه') LIKE ?`;
        params.push(`%${destination.replace(/ة/g, 'ه').replace(/[أإآ]/g, 'ا')}%`);
    }

    try {
        const dbPool = mysql.createPool(dbConfig);
        const [rows] = await dbPool.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flights.', error: error.message });
    }
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
        const [flightRow] = await dbPool.query('SELECT * FROM Flights WHERE id = ?', [flightId]);
        res.json({ id: bookingReference, bookingReference, passengerName, passengers, flight: flightRow[0] });
    } catch (error) {
        res.status(500).json({ message: 'Booking error.', error: error.message });
    }
});

app.get(`${API_BASE}/bookings`, async (req, res) => {
    try {
        const dbPool = mysql.createPool(dbConfig);
        const [rows] = await dbPool.query(
            `SELECT b.*, f.airline, f.flight_number FROM Bookings b
            LEFT JOIN Flights f ON b.FlightId = f.id
            ORDER BY b.createdAt DESC`
        );
        const bookings = rows.map(row => ({
            id: row.id,
            bookingReference: row.bookingReference,
            passengerName: row.passengerName,
            passengers: row.passengers,
            flightId: row.FlightId,
            flight: { airline: row.airline, flight_number: row.flight_number }
        }));
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings.' });
    }
});

module.exports = app;
