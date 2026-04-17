const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); 
const app = express();

const API_BASE = '/api';

app.use(express.json());
app.use(cors()); 

// استخدام المتغيرات البيئية (Environment Variables) لقاعدة البيانات
const dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '1234', 
    database: process.env.DB_NAME || 'flights_db',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false } // مهم للاتصال بـ Cloud Databases
});

app.get(`${API_BASE}/flights`, async (req, res) => {
    const { departure, destination, date } = req.query;
    let sql = 'SELECT * FROM Flights WHERE 1=1';
    const params = [];

    if (departure) {
        sql += ' AND departure_city LIKE ?';
        params.push(`%${departure}%`);
    }
    if (destination) {
        sql += ' AND destination_city LIKE ?';
        params.push(`%${destination}%`);
    }

    try {
        const [rows] = await dbPool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ message: 'Error fetching data from database.', error: error.message });
    }
});

app.post(`${API_BASE}/bookings`, async (req, res) => {
    const { flightId, passengerName, passengers } = req.body;
    const bookingReference = 'BK-' + Math.random().toString(36).slice(2,8).toUpperCase();

    if (!flightId || !passengerName || !passengers) {
        return res.status(400).json({ message: 'Missing required booking details.' });
    }

    try {
        await dbPool.query(
            'INSERT INTO Bookings (bookingReference, passengerName, passengers, FlightId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())', 
            [bookingReference, passengerName, passengers, flightId]
        );
        const [flightRow] = await dbPool.query('SELECT * FROM Flights WHERE id = ?', [flightId]);
        const flight = flightRow[0];

        res.json({ 
            id: bookingReference,
            bookingReference, 
            passengerName, 
            passengers,
            flight: flight 
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Database insertion error.', error: error.message });
    }
});

app.get(`${API_BASE}/bookings`, async (req, res) => {
    try {
        const [rows] = await dbPool.query(
            `SELECT 
                b.*, 
                f.airline, 
                f.flight_number 
            FROM Bookings b
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
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings data.' });
    }
});

module.exports = app; // لكي يعمل مع Vercless Functions
