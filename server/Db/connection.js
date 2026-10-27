const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

const connectDB = async () => {
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/self-driving-car';

    try {
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.warn('Primary MongoDB connection failed. Falling back to in-memory MongoDB for local development.');
        try {
            memoryServer = await MongoMemoryServer.create();
            const fallbackUri = memoryServer.getUri();
            const conn = await mongoose.connect(fallbackUri);
            console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
            return conn;
        } catch (fallbackError) {
            console.error(`Error: ${fallbackError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
