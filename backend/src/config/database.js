// backend/src/config/database.js
const mongoose = require('mongoose');
const config = require('./index'); // Importa las configuraciones desde index.js

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Salir del proceso con un código de error en caso de fallo de conexión a la DB
        process.exit(1);
    }
};

module.exports = connectDB;