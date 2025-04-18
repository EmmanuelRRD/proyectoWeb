CREATE DATABASE IF NOT EXISTS PhotoCalendar;
USE PhotoCalendar;
CREATE TABLE IF NOT EXISTS Usuario(
    Nombre VARCHAR(32) NOT NULL PRIMARY KEY,
    Pass VARCHAR(32) NOT NULL,
    Lectura BOOLEAN,
    Escritura BOOLEAN,
    Es_Admin BOOLEAN
);

CREATE TABLE IF NOT EXISTS Evento(
    Id INT NOT NULL PRIMARY KEY,
    Fecha_Inicio DATE NOT NULL,
    Nombre_Empleado VARCHAR(32) NOT NULL,
    Nombre_Cliente VARCHAR(32) NOT NULL,
    Apellido_Cliente VARCHAR(32) NOT NULL,
    Nombre_Modelo SMALLINT NOT NULL,
    Paquete_Fotografico SMALLINT NOT NULL,
    Tipo_Evento SMALLINT NOT NULL,
    Fecha_Fin DATE NOT NULL,

    FOREIGN KEY(Nombre_Empleado) REFERENCES Usuario(Nombre)
);

CREATE TABLE IF NOT EXISTS Evento_Eliminado(
    Id INT NOT NULL PRIMARY KEY,
    Fecha_Inicio DATE NOT NULL,
    Nombre_Empleado VARCHAR(32) NOT NULL,
    Nombre_Cliente VARCHAR(32) NOT NULL,
    Apellido_Cliente VARCHAR(32) NOT NULL,
    Nombre_Modelo SMALLINT NOT NULL,
    Paquete_Fotografico SMALLINT NOT NULL,
    Tipo_Evento SMALLINT NOT NULL,
    Fecha_Fin DATE NOT NULL,

    Empleado_Eliminacion VARCHAR(32) NOT NULL,
    Fecha_Eliminacion DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Articulo_Equipo(
    Id INT NOT NULL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Existencias INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Articulo_Equipo_Eliminado(
    Id INT NOT NULL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Existencias INT NOT NULL,

    Empleado_Eliminacion VARCHAR(32) NOT NULL,
    Fecha_Eliminacion DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Equipo_Empleado_Evento(
    Id_Equipo INT NOT NULL,
    Nombre_Empleado VARCHAR(32) NOT NULL,
    Id_Evento INT NOT NULL,
    Fecha_Inicio DATE NOT NULL,
    Fecha_Fin DATE,

    PRIMARY KEY(Id_Equipo, Nombre_Empleado, Id_Evento),

    FOREIGN KEY(Id_Equipo) REFERENCES Articulo_Equipo(Id),
    FOREIGN KEY(Nombre_Empleado) REFERENCES Usuario(Nombre),
    FOREIGN KEY(Id_Evento) REFERENCES Evento(Id)
);

CREATE TABLE IF NOT EXISTS Equipo_Empleado_Evento_Eliminado(
    Id_Equipo INT NOT NULL,
    Nombre_Empleado VARCHAR(32) NOT NULL,
    Id_Evento INT NOT NULL,
    Fecha_Inicio DATE NOT NULL,
    Fecha_Fin DATE,
    
    Empleado_Eliminacion VARCHAR(32) NOT NULL,
    Fecha_Eliminacion DATE NOT NULL,

    PRIMARY KEY(Id_Equipo, Nombre_Empleado, Id_Evento)
);

CREATE TABLE IF NOT EXISTS Articulo_Inventario(
    Id INT NOT NULL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Existencias INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Articulo_Inventario_Eliminado(
    Id INT NOT NULL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Existencias INT NOT NULL,

    Empleado_Eliminacion VARCHAR(32) NOT NULL,
    Fecha_Eliminacion DATE NOT NULL
);
