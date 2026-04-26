const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// =============================================
// GET /reservations - Consultar todas las reservas
// =============================================
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, h.numero AS numero_habitacion, h.tipo AS tipo_habitacion
            FROM reservas r
            INNER JOIN habitaciones h ON r.codigo_habitacion = h.codigo
        `);
        res.json({
            success: true,
            message: 'Reservas obtenidas correctamente',
            data: rows
        });
    } catch (error) {
        console.error('Error al consultar reservas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al consultar las reservas',
            error: error.message
        });
    }
});

// =============================================
// GET /reservations/:codigo - Consultar reserva por código
// =============================================
router.get('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const [rows] = await pool.query(`
            SELECT r.*, h.numero AS numero_habitacion, h.tipo AS tipo_habitacion
            FROM reservas r
            INNER JOIN habitaciones h ON r.codigo_habitacion = h.codigo
            WHERE r.codigo = ?
        `, [codigo]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró la reserva con código ${codigo}`
            });
        }

        res.json({
            success: true,
            message: 'Reserva encontrada',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al consultar reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al consultar la reserva',
            error: error.message
        });
    }
});

// =============================================
// POST /reservations - Crear una nueva reserva
// =============================================
router.post('/', async (req, res) => {
    try {
        const {
            codigo_habitacion,
            nombre_cliente,
            telefono_cliente,
            fecha_reservacion,
            fecha_entrada,
            fecha_salida
        } = req.body;

        // Validar campos requeridos
        if (!codigo_habitacion || !nombre_cliente || !telefono_cliente ||
            !fecha_reservacion || !fecha_entrada || !fecha_salida) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: codigo_habitacion, nombre_cliente, telefono_cliente, fecha_reservacion, fecha_entrada, fecha_salida'
            });
        }

        // Verificar que la habitación existe
        const [habitacion] = await pool.query(
            'SELECT * FROM habitaciones WHERE codigo = ?',
            [codigo_habitacion]
        );

        if (habitacion.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No existe la habitación con código ${codigo_habitacion}`
            });
        }

        // Validar que fecha_entrada sea antes de fecha_salida
        if (new Date(fecha_entrada) >= new Date(fecha_salida)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de entrada debe ser anterior a la fecha de salida'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO reservas 
            (codigo_habitacion, nombre_cliente, telefono_cliente, fecha_reservacion, fecha_entrada, fecha_salida) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [codigo_habitacion, nombre_cliente, telefono_cliente, fecha_reservacion, fecha_entrada, fecha_salida]
        );

        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            data: {
                codigo: result.insertId,
                codigo_habitacion,
                nombre_cliente,
                telefono_cliente,
                fecha_reservacion,
                fecha_entrada,
                fecha_salida
            }
        });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la reserva',
            error: error.message
        });
    }
});

// =============================================
// PATCH /reservations/:codigo - Actualizar reserva
// =============================================
router.patch('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const {
            codigo_habitacion,
            nombre_cliente,
            telefono_cliente,
            fecha_reservacion,
            fecha_entrada,
            fecha_salida
        } = req.body;

        // Verificar que la reserva existe
        const [existing] = await pool.query(
            'SELECT * FROM reservas WHERE codigo = ?',
            [codigo]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró la reserva con código ${codigo}`
            });
        }

        // Si se envía codigo_habitacion, verificar que exista
        if (codigo_habitacion) {
            const [habitacion] = await pool.query(
                'SELECT * FROM habitaciones WHERE codigo = ?',
                [codigo_habitacion]
            );
            if (habitacion.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `No existe la habitación con código ${codigo_habitacion}`
                });
            }
        }

        // Construir query dinámico
        const fields = [];
        const values = [];

        if (codigo_habitacion !== undefined) { fields.push('codigo_habitacion = ?'); values.push(codigo_habitacion); }
        if (nombre_cliente !== undefined) { fields.push('nombre_cliente = ?'); values.push(nombre_cliente); }
        if (telefono_cliente !== undefined) { fields.push('telefono_cliente = ?'); values.push(telefono_cliente); }
        if (fecha_reservacion !== undefined) { fields.push('fecha_reservacion = ?'); values.push(fecha_reservacion); }
        if (fecha_entrada !== undefined) { fields.push('fecha_entrada = ?'); values.push(fecha_entrada); }
        if (fecha_salida !== undefined) { fields.push('fecha_salida = ?'); values.push(fecha_salida); }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe enviar al menos un campo para actualizar'
            });
        }

        values.push(codigo);
        await pool.query(`UPDATE reservas SET ${fields.join(', ')} WHERE codigo = ?`, values);

        const [updated] = await pool.query(`
            SELECT r.*, h.numero AS numero_habitacion, h.tipo AS tipo_habitacion
            FROM reservas r
            INNER JOIN habitaciones h ON r.codigo_habitacion = h.codigo
            WHERE r.codigo = ?
        `, [codigo]);

        res.json({
            success: true,
            message: 'Reserva actualizada correctamente',
            data: updated[0]
        });
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la reserva',
            error: error.message
        });
    }
});

// =============================================
// DELETE /reservations/:codigo - Eliminar reserva
// =============================================
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;

        const [existing] = await pool.query(
            'SELECT * FROM reservas WHERE codigo = ?',
            [codigo]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró la reserva con código ${codigo}`
            });
        }

        await pool.query('DELETE FROM reservas WHERE codigo = ?', [codigo]);

        res.json({
            success: true,
            message: 'Reserva eliminada correctamente',
            data: existing[0]
        });
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la reserva',
            error: error.message
        });
    }
});

module.exports = router;