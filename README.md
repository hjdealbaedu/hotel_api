# Sistema de Gestion de Reservas de Hotel - API REST

## Descripcion

Aplicacion web del lado del servidor que implementa un sistema de gestion de reservas de habitaciones para un hotel. Permite administrar el inventario de habitaciones y las reservas de los clientes a traves de una API REST.

El proyecto fue desarrollado como parte de la asignatura de desarrollo web, aplicando conceptos de arquitectura cliente-servidor, bases de datos relacionales y servicios RESTful.

## Proposito

Proveer una API que permita a los usuarios:

- Registrar y administrar las habitaciones del hotel (numero, tipo, valor).
- Crear, consultar, modificar y eliminar reservas asociadas a dichas habitaciones.
- Validar la integridad de los datos (habitaciones existentes, fechas coherentes, campos requeridos).
- Manejar errores de conexion y operaciones sobre la base de datos.

## Tecnologias utilizadas

- **Node.js** - Entorno de ejecucion de JavaScript del lado del servidor.
- **Express** - Framework para la construccion del servidor HTTP y definicion de rutas.
- **MySQL** - Sistema gestor de base de datos relacional.
- **mysql2** - Modulo de Node.js para la conexion y consultas a MySQL (con soporte de promesas).
- **dotenv** - Manejo de variables de entorno.
- **cors** - Middleware para habilitar peticiones desde otros origenes.
- **Railway** - Plataforma de despliegue en la nube.

## Estructura de la base de datos

La base de datos esta compuesta por dos tablas:

**Tabla `habitaciones`**

| Campo  | Tipo          | Descripcion                  |
|--------|---------------|------------------------------|
| codigo | INT (PK, AI)  | Identificador unico          |
| numero | INT (UNIQUE)  | Numero de la habitacion      |
| tipo   | VARCHAR(50)   | Tipo (Individual, Doble, Suite) |
| valor  | DECIMAL(10,2) | Precio por noche             |

**Tabla `reservas`**

| Campo              | Tipo          | Descripcion                          |
|--------------------|---------------|--------------------------------------|
| codigo             | INT (PK, AI)  | Identificador unico                  |
| codigo_habitacion  | INT (FK)      | Referencia a habitaciones.codigo     |
| nombre_cliente     | VARCHAR(100)  | Nombre del cliente                   |
| telefono_cliente   | VARCHAR(20)   | Telefono del cliente                 |
| fecha_reservacion  | DATE          | Fecha en que se realizo la reserva   |
| fecha_entrada      | DATE          | Fecha de check-in                    |
| fecha_salida       | DATE          | Fecha de check-out                   |

La tabla `reservas` tiene una llave foranea hacia `habitaciones` con `ON DELETE CASCADE` y `ON UPDATE CASCADE`.

## Endpoints de la API

### URL base

```
https://hotelapi-production-5e43.up.railway.app/
```

### Habitaciones

**GET /rooms**
Consulta todas las habitaciones.

```
GET /rooms
```

Respuesta:
```json
{
  "success": true,
  "message": "Habitaciones obtenidas correctamente",
  "data": [
    {
      "codigo": 1,
      "numero": 101,
      "tipo": "Individual",
      "valor": "80000.00"
    }
  ]
}
```

---

**GET /rooms/:codigo**
Consulta una habitacion por su codigo.

```
GET /rooms/1
```

---

**POST /rooms**
Crea una nueva habitacion.

```
POST /rooms
Content-Type: application/json

{
  "numero": 401,
  "tipo": "Suite",
  "valor": 300000.00
}
```

---

**PATCH /rooms/:codigo**
Actualiza parcialmente una habitacion. Solo se envian los campos que se quieren modificar.

```
PATCH /rooms/1
Content-Type: application/json

{
  "valor": 95000.00
}
```

---

**DELETE /rooms/:codigo**
Elimina una habitacion por su codigo.

```
DELETE /rooms/1
```

### Reservas

**GET /reservations**
Consulta todas las reservas (incluye datos de la habitacion asociada).

```
GET /reservations
```

---

**GET /reservations/:codigo**
Consulta una reserva por su codigo.

```
GET /reservations/1
```

---

**POST /reservations**
Crea una nueva reserva.

```
POST /reservations
Content-Type: application/json

{
  "codigo_habitacion": 1,
  "nombre_cliente": "Carlos Perez",
  "telefono_cliente": "3001234567",
  "fecha_reservacion": "2026-04-20",
  "fecha_entrada": "2026-05-01",
  "fecha_salida": "2026-05-03"
}
```

---

**PATCH /reservations/:codigo**
Actualiza parcialmente una reserva.

```
PATCH /reservations/1
Content-Type: application/json

{
  "fecha_salida": "2026-05-05"
}
```

---

**DELETE /reservations/:codigo**
Elimina una reserva por su codigo.

```
DELETE /reservations/1
```

## Codigos de respuesta

| Codigo | Significado                                    |
|--------|------------------------------------------------|
| 200    | Operacion exitosa                              |
| 201    | Recurso creado exitosamente                    |
| 400    | Faltan campos requeridos o datos invalidos      |
| 404    | Recurso no encontrado                          |
| 409    | Conflicto (habitacion con numero duplicado)    |
| 500    | Error interno del servidor o de base de datos  |

## Como probar la API con Bruno

Se recomienda usar **Bruno** (usebruno.com) como cliente HTTP para probar los endpoints. Bruno es gratuito, open source y no requiere cuenta.

### Pasos

1. Descarga Bruno desde https://www.usebruno.com y abrelo.
2. Crea una nueva coleccion llamada "Hotel API".
3. Dentro de la coleccion, crea un nuevo request para cada endpoint.

### Ejemplo: consultar todas las habitaciones

- Metodo: `GET`
- URL: `https://TU-URL.up.railway.app/rooms`
- Clic en Send.

### Ejemplo: crear una habitacion

- Metodo: `POST`
- URL: `https://TU-URL.up.railway.app/rooms`
- Ve a la pestana Body → selecciona JSON.
- Escribe:
```json
{
  "numero": 501,
  "tipo": "Doble",
  "valor": 150000.00
}
```
- Clic en Send.

### Ejemplo: actualizar una habitacion

- Metodo: `PATCH`
- URL: `https://TU-URL.up.railway.app/rooms/1`
- Body JSON:
```json
{
  "valor": 95000.00
}
```

### Ejemplo: eliminar una habitacion

- Metodo: `DELETE`
- URL: `https://TU-URL.up.railway.app/rooms/1`

El mismo flujo aplica para los endpoints de `/reservations`.

## Instalacion local

```bash
git clone https://github.com/TU_USUARIO/hotel-api.git
cd hotel-api
npm install
```

Crear la base de datos ejecutando en MySQL:
```bash
mysql -u root -p < database/init.sql
```

Configurar el archivo `.env`:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=hotel_db
DB_PORT=3306
```

Iniciar el servidor:
```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`.

## Estructura del proyecto

```
hotel-api/
├── database/
│   └── init.sql
├── src/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── rooms.js
│   │   └── reservations.js
│   └── index.js
├── .env
├── .gitignore
└── package.json
```

## Autor

Henry De Alba - Universidad de la Costa - CUC
