const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear pool de conexiones (más eficiente que una sola conexión)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para verificar la conexión a la base de datos
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexion exitosa a la base de datos MySQL');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };