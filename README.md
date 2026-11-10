# TP3 – Gestión de vehículos, conductores y viajes

Trabajo Práctico N.º 3 de Programación IV – Tecnicatura Universitaria en Programación, UTN Facultad Regional La Rioja.

Alumna: Maturano, María

Aplicación web para registrar los vehículos de una empresa de transporte, sus conductores y los viajes realizados, con consulta del historial por vehículo o por conductor y cálculo del total de kilómetros recorridos.

## Tecnologías

- **Frontend:** Vite + React (JavaScript), React Router, CSS puro.
- **Backend:** Express.js, MySQL (mysql2), express-validator.
- **Autenticación y seguridad:** JWT (expira a las 4 horas) verificado con Passport, contraseñas encriptadas con bcrypt.

## Requisitos

- Node.js 20.6 o superior
- MySQL 8 o superior

## Puesta en marcha

### 1. Base de datos

Ejecutar el script `backend/tablas.sql` en MySQL. Crea la base `transporte` y sus tablas (`usuarios`, `vehiculos`, `conductores` y `viajes`).

### 2. Backend

```bash
cd backend
npm install
```

Copiar `.env.example` como `.env` y completar los valores (`DB_PASS` y `JWT_SECRET`):

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### 4. Primer uso

Desde la pantalla de ingreso, usar **Registrate** para crear una cuenta, e iniciar sesión con ella.

## API

Todas las rutas, excepto `/auth/registro` y `/auth/login`, requieren el header `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro` | Registro de usuarios |
| POST | `/auth/login` | Inicio de sesión (devuelve el token) |
| GET, POST | `/vehiculos` | Listado y alta de vehículos |
| GET, PUT, DELETE | `/vehiculos/:id` | Detalle, modificación y baja |
| GET, POST | `/conductores` | Listado y alta de conductores |
| GET, PUT, DELETE | `/conductores/:id` | Detalle, modificación y baja |
| GET, POST | `/viajes` | Historial y registro de viajes. Filtros: `?vehiculoId=` o `?conductorId=` |
| GET | `/viajes/kilometros` | Total de kilómetros (y cantidad de viajes) de un vehículo o conductor: `?vehiculoId=` o `?conductorId=` |
| GET, PUT, DELETE | `/viajes/:id` | Detalle, modificación y baja |

En la carpeta `backend` hay un archivo `.http` por recurso para probar la API (se ejecutan con la extensión REST Client de VS Code).

### Manejo de errores

- **400:** datos inválidos, duplicados (patente, documento, licencia, email) o baja de un vehículo o conductor que tiene viajes.
- **401:** token ausente, inválido o vencido, o credenciales incorrectas.
- **403:** el conductor no tenía la licencia vigente en la fecha de salida del viaje.
- **404:** recurso inexistente.
- **500:** error interno del servidor.

## Estructura

```
├── backend/     API (Express): rutas por recurso, db.js, validaciones.js, tablas.sql y archivos .http
└── frontend/    Aplicación React (Vite): páginas y componentes en src/
```