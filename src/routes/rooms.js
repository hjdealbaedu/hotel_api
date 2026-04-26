const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// =============================================
// GET /rooms - Consultar todas las habitaciones
// =============================================
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM habitaciones');
        res.json({
            success: true,
            message: 'Habitaciones obtenidas correctamente',
            data: rows
        });
    } catch (error) {
        console.error('Error al consultar habitaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al consultar las habitaciones',
            error: error.message
        });
    }
});

// =============================================
// GET /rooms/:codigo - Consultar habitación por código
// =============================================
router.get('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM habitaciones WHERE codigo = ?',
            [codigo]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró la habitación con código ${codigo}`
            });
        }

        res.json({
            success: true,
            message: 'Habitación encontrada',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al consultar habitación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al consultar la habitación',
            error: error.message
        });
    }
});

// =============================================
// POST /rooms - Crear una nueva habitación
// =============================================
router.post('/', async (req, res) => {
    try {
        const { numero, tipo, valor } = req.body;

        // Validar que vengan todos los campos
        if (!numero || !tipo || !valor) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: numero, tipo, valor'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO habitaciones (numero, tipo, valor) VALUES (?, ?, ?)',
            [numero, tipo, valor]
        );

        res.status(201).json({
            success: true,
            message: 'Habitación creada exitosamente',
            data: {
                codigo: result.insertId,
                numero,
                tipo,
                valor
            }
        });
    } catch (error) {
        console.error('Error al crear habitación:', error);

        // Manejar error de duplicado (numero único)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una habitación con ese número'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear la habitación',
            error: error.message
        });
    }
});

// =============================================
// PATCH /rooms/:codigo - Actualizar habitación
// =============================================
router.patch('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { numero, tipo, valor } = req.body;

        // Verificar que la habitación existe
        const [existing] = await pool.query(
            'SELECT * FROM habitaciones WHERE codigo = ?',
            [codigo]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró la habitación con código ${codigo}`
            });
        }

        // Construir query dinámico (solo actualizar campos enviados)
        const fields = [];
        const values = [];

        if (numero !== undefined) {
            fields.push('numero = ?');
            values.push(numero);
        }
        if (tipo !== undefined) {
            fields.push('tipo = ?');
            values.push(tipo);
        }
        if (valor !== undefined) {
            fields.push('valor = ?');
            values.push(valor);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe enviar al menos un campo para actualizar'
            });
        }

        values.push(codigo);
        const query = `UPDATE habitaciones SET ${fields.join(', ')} WHERE codigo = ?`;

        await pool.query(query, values);

        // Obtener la habitación actualizada
        const [updated] = await pool.query(
            'SELECT * FROM habitaciones WHERE codigo = ?',
            [codigo]
        );

        res.json({
            success: true,
            message: 'Habitación actualizada correctamente',
            data: updated[0]
        });
    } catch (error) {
        console.error('Error al actualizar habitación:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una habitación con ese número'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar la habitación',
            error: error.message
        });
    }
});

// =============================================
// DELETE /rooms/:codigo - Eliminar habitación
// =============================================
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;

        // Verificar que la habitación existe
        const [existing] = await pool.query(
            'SELECT * FROM habitaciones WHERE codigo = ?',
            [codigo]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró la habitación con código ${codigo}`
            });
        }

        await pool.query('DELETE FROM habitaciones WHERE codigo = ?', [codigo]);

        res.json({
            success: true,
            message: 'Habitación eliminada correctamente',
            data: existing[0]
        });
    } catch (error) {
        console.error('Error al eliminar habitación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la habitación',
            error: error.message
        });
    }
});

module.exports = router;