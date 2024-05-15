CREATE TABLE `proyecto_db`.`usuario` (
    id_usuario INT AUTO_INCREMENT NOT NULL UNIQUE,
    nombre_usuario VARCHAR(50) NOT NULL,
    email_usario VARCHAR(50) UNIQUE,
    contrase_usuario VARCHAR(20) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_usuario)
);

CREATE TABLE `proyecto_db`.`producto` (
    id_producto INT AUTO_INCREMENT UNIQUE,
    descripcion VARCHAR(200),
    precio_unidad INT NOT NULL,
    cantidad_disp INT NOT NULL,
    imagen BLOB,
    PRIMARY KEY (id_producto)
);

CREATE TABLE `proyecto_db`.`carrito` (
    id_carrito INT AUTO_INCREMENT,
    id_producto INT UNIQUE,
    id_usuario INT,
    cantidad_producto INT NOT NULL,
    PRIMARY KEY (id_carrito),
    FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto),
    FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
);

CREATE TABLE `proyecto_db`.`compra` (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_carrito INT,
    id_producto INT,
    cantidad_producto INT,
    metodo_pago VARCHAR(50) NOT NULL,
    tipo_compra VARCHAR(50) NOT NULL,
    fecha_compra DATE NOT NULL,
    direccion_entrega VARCHAR(100) NOT NULL,
    precio_total INT NOT NULL,
    FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario),
    FOREIGN KEY (id_carrito)
        REFERENCES carrito (id_carrito),
	FOREIGN KEY (id_producto)
        REFERENCES carrito (id_producto)
);

