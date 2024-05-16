CREATE TABLE USUARIO (
    id_usuario INT AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    email_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrase_usuario VARCHAR(20) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_usuario)
);

CREATE TABLE CATEGORIA (
	id_categoria INT AUTO_INCREMENT,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY(id_categoria)
);

CREATE TABLE PRODUCTO (
    id_producto INT AUTO_INCREMENT,
    id_categoria INT NOT NULL,
    nombre_producto VARCHAR(50),
    descripcion VARCHAR(200),
    precio_unidad INT NOT NULL,
    cantidad_disp INT NOT NULL,
    imagen BLOB,
    PRIMARY KEY (id_producto),
    FOREIGN KEY (id_categoria)
        REFERENCES CATEGORIA (id_categoria)
);

CREATE TABLE CARRITO (
    id_carrito INT AUTO_INCREMENT,
    id_usuario INT,
    PRIMARY KEY (id_carrito),
    FOREIGN KEY (id_usuario)
        REFERENCES USUARIO (id_usuario)
);

CREATE TABLE CONTENIDO_CARRITO (
    reg_insert INT AUTO_INCREMENT,
    id_carrito INT,
    id_producto INT,
    cantidad_producto_c INT,
    PRIMARY KEY (reg_insert),
	FOREIGN KEY (id_producto)
		REFERENCES PRODUCTO (id_producto)
);

CREATE TABLE COMPRA (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_carrito INT,
    id_producto INT,
    estado_compra VARCHAR(50) DEFAULT "ENPROCESO",
    cantidad_producto INT,
    metodo_pago VARCHAR(50) NOT NULL,
    tipo_compra VARCHAR(50) NOT NULL,
    fecha_compra DATE NOT NULL,
    direccion_entrega VARCHAR(100) NOT NULL,
    precio_total INT DEFAULT 0,
    FOREIGN KEY (id_usuario)
        REFERENCES USUARIO (id_usuario),
    FOREIGN KEY (id_carrito)
        REFERENCES CARRITO (id_carrito),
	FOREIGN KEY (id_producto)
        REFERENCES PRODUCTO (id_producto)
);

-- Creaccion de triggers::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
DELIMITER //
CREATE TRIGGER CREAR_CARRITO_USUARIO
AFTER INSERT ON USUARIO
FOR EACH ROW
BEGIN
    INSERT INTO CARRITO (id_usuario) VALUES (NEW.id_usuario);
END;
//DELIMITER ;
DELIMITER //
CREATE TRIGGER CALCULAR_PRECIO_TOTAL_COMPRA
BEFORE INSERT ON COMPRA
FOR EACH ROW
BEGIN
    DECLARE precio_total_calculado INT;
    
    IF NEW.tipo_compra = 'INDIVIDUAL' THEN
        -- Calcular precio_total para compra de producto individual
        SET precio_total_calculado = (SELECT precio_unidad * NEW.cantidad_producto
                                      FROM PRODUCTO
                                      WHERE id_producto = NEW.id_producto);
    ELSE
        -- Calcular precio_total para compra de carrito completo
        SET precio_total_calculado = (SELECT SUM(precio_unidad * cantidad_producto_c)
                                      FROM CONTENIDO_CARRITO
                                      JOIN PRODUCTO ON CONTENIDO_CARRITO.id_producto = PRODUCTO.id_producto
                                      WHERE id_carrito = NEW.id_carrito);
    END IF;

    -- Asignar el precio_total calculado a NEW.precio_total
    SET NEW.precio_total = precio_total_calculado;
END;
// DELIMITER ;
-- :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

INSERT INTO USUARIO (nombre_usuario, email_usuario, contrase_usuario, tipo_usuario)
VALUES ('ADMIN', 'example@ex2ample.com', '321', 'administrador');
INSERT INTO USUARIO (nombre_usuario, email_usuario, contrase_usuario, tipo_usuario)
VALUES ('Jose', 'user@e2ample.com', '123', 'cliente');

INSERT INTO CATEGORIA (nombre_categoria) VALUES ("Deportes");
INSERT INTO CATEGORIA (nombre_categoria) VALUES ("Tecnologia");
INSERT INTO CATEGORIA (nombre_categoria) VALUES ("Herramientas");
INSERT INTO CATEGORIA (nombre_categoria) VALUES ("Moda");

INSERT INTO COMPRA
(id_usuario, id_carrito, id_producto, cantidad_producto, metodo_pago, tipo_compra, fecha_compra, direccion_entrega)
VALUES (2,2,NULL,NULL,"Tarjeta","CARRITO","2024-05-20","Calle 26 #17-02")
