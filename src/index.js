const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const roomsRoutes = require('./routes/rooms');
const reservationsRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// Middlewares
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// Rutas
// =============================================

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: 'API Hotel - Sistema de Gestion de Reservas',
        version: '1.0.0',
        endpoints: {
            habitaciones: {
                'GET /rooms': 'Consultar todas las habitaciones',
                'GET /rooms/:codigo': 'Consultar habitación por código',
                'POST /rooms': 'Crear nueva habitación',
                'PATCH /rooms/:codigo': 'Actualizar habitación',
                'DELETE /rooms/:codigo': 'Eliminar habitación'
            },
            reservas: {
                'GET /reservations': 'Consultar todas las reservas',
                'GET /reservations/:codigo': 'Consultar reserva por código',
                'POST /reservations': 'Crear nueva reserva',
                'PATCH /reservations/:codigo': 'Actualizar reserva',
                'DELETE /reservations/:codigo': 'Eliminar reserva'
            }
        }
    });
});

// Rutas de la API
app.use('/rooms', roomsRoutes);
app.use('/reservations', reservationsRoutes);

// =============================================
// Manejo de rutas no encontradas
// =============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.method} ${req.originalUrl} no encontrada`
    });
});

// =============================================
// Manejo global de errores
// =============================================
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: err.message
    });
});

// =============================================
// Iniciar servidor
// =============================================
const startServer = async () => {
    // Verificar conexión a la base de datos antes de iniciar
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.error('[ERROR] No se pudo conectar a la base de datos.');
        console.error('   Verifica que MySQL esté corriendo y las credenciales del .env sean correctas.');
        console.error('   El servidor iniciará de todas formas, pero las consultas fallarán.');
    }

    app.listen(PORT, () => {
        console.log(`\nServidor corriendo en http://localhost:${PORT}`);
        console.log(`Documentacion en http://localhost:${PORT}/`);
        console.log(`Habitaciones en http://localhost:${PORT}/rooms`);
        console.log(`Reservas en http://localhost:${PORT}/reservations\n`);
    });
};

startServer();