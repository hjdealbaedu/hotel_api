-- =============================================
-- Script para crear la base de datos del Hotel
-- Ejecutar este script en MySQL antes de
-- iniciar la aplicación
-- =============================================

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- Tabla de habitaciones
CREATE TABLE IF NOT EXISTS habitaciones (
    codigo INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    codigo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_habitacion INT NOT NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    fecha_reservacion DATE NOT NULL,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    FOREIGN KEY (codigo_habitacion) REFERENCES habitaciones(codigo)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- Datos de prueba (opcional)
-- =============================================

INSERT INTO habitaciones (numero, tipo, valor) VALUES
    (101, 'Individual', 80000.00),
    (102, 'Doble', 120000.00),
    (201, 'Suite', 250000.00),
    (202, 'Individual', 85000.00),
    (301, 'Doble', 130000.00);

INSERT INTO reservas (codigo_habitacion, nombre_cliente, telefono_cliente, fecha_reservacion, fecha_entrada, fecha_salida) VALUES
    (1, 'Carlos Pérez', '3001234567', '2026-04-20', '2026-05-01', '2026-05-03'),
    (2, 'María García', '3109876543', '2026-04-22', '2026-05-10', '2026-05-15'),
    (3, 'Juan Rodríguez', '3205551234', '2026-04-25', '2026-06-01', '2026-06-05');