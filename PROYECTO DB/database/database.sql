CREATE TABLE `proyecto_db`.`usuario` (
    id_usuario INT AUTO_INCREMENT NOT NULL UNIQUE,
    nombre_usuario VARCHAR(50) NOT NULL,
    email_usario VARCHAR(50) UNIQUE,
    PRIMARY KEY(id_usuario)
);

CREATE TABLE `proyecto_db`.`carrito` (
    id_carrito INT AUTO_INCREMENT,
    id_producto INT,
    id_usuario INT,
    precio_total_temp INT,
    PRIMARY KEY (id_carrito),
    FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
);

CREATE TABLE `proyecto_db`.`producto` (
    id_producto INT AUTO_INCREMENT UNIQUE,
    descripcion VARCHAR(200),
    precio_unidad INT NOT NULL,
    PRIMARY KEY (id_producto)
);