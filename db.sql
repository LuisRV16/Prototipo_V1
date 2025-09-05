create database prueba;

use prueba;

create table postulante (
	id int auto_increment primary key, 
    nombre varchar(100), 
    edad int,
    descripcion varchar(400)
);

INSERT INTO postulante (nombre, edad, descripcion) VALUES 
('Peter Parker', 21, 'Ingeniero en Sistemas Computacionales con habilidades para análisis de datos y big data'),
('Mary Jane', 21, 'Ingeniera Civil con experiencia en diseño estructural y gestión de proyectos de construcción'),
('Veronica', 30, 'Ingeniera Industrial especializada en optimización de procesos y gestión de calidad');


select * from postulante;


