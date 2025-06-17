// backend/src/server.js
require('dotenv').config(); // Carga las variables de entorno desde .env al inicio
const app = require('./app'); // Importa la instancia de Express desde app.js
const connectDB = require('./config/database'); // Importa la función de conexión a la DB

const PORT = process.env.PORT || 5000; // Puerto donde se ejecutará el servidor, por defecto 5000

// Conectar a la base de datos y luego iniciar el servidor
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access it at: http://localhost:${PORT}`);
});