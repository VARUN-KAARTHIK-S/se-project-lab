const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./Db/connection');
const userRoutes = require('./route/userRoute');
const carRoutes = require('./route/carRoute');
const bookingRoutes = require('./route/bookingRoute');
const orgRoutes = require('./route/orgRoute');

connectDB();

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/orgs', orgRoutes);

app.get('/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.send('Self-Driving Car Rental API is running');
});

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => console.log(`Server started on port ${port}`));
