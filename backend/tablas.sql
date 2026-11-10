CREATE DATABASE IF NOT EXISTS transporte
  CHARACTER SET utf8mb4;

USE transporte;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL
);

CREATE TABLE vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  patente VARCHAR(10) NOT NULL UNIQUE,
  anio SMALLINT NOT NULL,
  capacidad_carga DECIMAL(10,2) NOT NULL,
  CHECK (capacidad_carga > 0)
);

CREATE TABLE conductores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  numero_documento VARCHAR(15) NOT NULL UNIQUE,
  numero_licencia VARCHAR(20) NOT NULL UNIQUE,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL,
  CHECK (fecha_vencimiento_licencia > fecha_alta_licencia)
);

CREATE TABLE viajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT NOT NULL,
  conductor_id INT NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  kilometros DECIMAL(10,2) NOT NULL,
  observaciones TEXT NULL,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
  FOREIGN KEY (conductor_id) REFERENCES conductores(id),
  CHECK (fecha_llegada >= fecha_salida),
  CHECK (kilometros >= 0)
);