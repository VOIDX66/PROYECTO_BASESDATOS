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
    comentarios VARCHAR(2000),
    promedio_estrellas INT DEFAULT 0, 
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

CREATE TABLE PRODUCTO_CARRITO (
    id_producto_carrito INT AUTO_INCREMENT,
    id_carrito INT NOT NULL,
    id_producto INT,
    cantidad_producto_c INT,
    PRIMARY KEY (id_producto_carrito),
	FOREIGN KEY (id_producto)
		REFERENCES PRODUCTO (id_producto),
	FOREIGN KEY (id_carrito)
		REFERENCES CARRITO (id_carrito)
);

CREATE TABLE COMPRA (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_carrito INT,
    metodo_pago VARCHAR(50) NOT NULL,
    fecha_pedido DATE NOT NULL,
    direccion_entrega VARCHAR(100) NOT NULL,
    n_contacto VARCHAR(10),
    precio_total INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT "ENPROCESO",
    FOREIGN KEY (id_usuario)
        REFERENCES USUARIO (id_usuario),
    FOREIGN KEY (id_carrito)
        REFERENCES CARRITO (id_carrito)
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
CREATE TRIGGER CALCULAR_PRECIO_TOTAL
BEFORE INSERT ON COMPRA
FOR EACH ROW
BEGIN
    DECLARE total INT;
    
    -- Calcular el precio total sumando los precios de todos los productos en el carrito
    SELECT SUM(producto.precio_unidad * producto_carrito.cantidad_producto_c)
    INTO total
    FROM PRODUCTO producto
    JOIN PRODUCTO_CARRITO producto_carrito ON producto.id_producto = producto_carrito.id_producto
    WHERE producto_carrito.id_carrito = NEW.id_carrito;
    
    -- Asignar el precio total calculado a la columna precio_total de la fila que se está insertando
    SET NEW.precio_total = total;
END;
// DELIMITER ;

-- Trigger para reducir la cantidad disponible al crear una compra
DELIMITER //
CREATE TRIGGER REDUCIR_CANTIDAD_DISPONIBLE
AFTER INSERT ON COMPRA
FOR EACH ROW
BEGIN
    -- Actualizar la cantidad disponible restando la cantidad comprada
    UPDATE PRODUCTO
    SET cantidad_disp = cantidad_disp - (
        SELECT cantidad_producto_c
        FROM PRODUCTO_CARRITO
        WHERE id_producto_carrito = NEW.id_carrito
    )
    WHERE id_producto IN (
        SELECT id_producto
        FROM PRODUCTO_CARRITO
        WHERE id_producto_carrito = NEW.id_carrito
    );
END;
// DELIMITER ;

-- Trigger para restablecer la cantidad disponible al cancelar una compra
DELIMITER //
CREATE TRIGGER RESTABLECER_CANTIDAD_DISPONIBLE
AFTER UPDATE ON COMPRA
FOR EACH ROW
BEGIN
    -- Verificar si el estado de la compra cambió a "CANCELADA"
    IF OLD.estado <> NEW.estado AND NEW.estado = 'CANCELADA' THEN
        -- Restablecer la cantidad disponible sumando la cantidad cancelada
        UPDATE PRODUCTO
        SET cantidad_disp = cantidad_disp + (
            SELECT cantidad_producto_c
            FROM PRODUCTO_CARRITO
            WHERE id_producto_carrito = OLD.id_carrito
        )
        WHERE id_producto IN (
            SELECT id_producto
            FROM PRODUCTO_CARRITO
            WHERE id_producto_carrito = OLD.id_carrito
        );
    END IF;
END;
// DELIMITER ;

-- Trigger para vaciar la tabla PRODUCTO_CARRITO cuando una compra se completa
DELIMITER //
CREATE TRIGGER VACIAR_PRODUCTO_CARRITO
AFTER UPDATE ON COMPRA
FOR EACH ROW
BEGIN
    -- Verificar si el estado de la compra cambió a "COMPLETADA"
    IF OLD.estado <> NEW.estado AND NEW.estado = 'COMPLETADA' THEN
        -- Eliminar todas las filas de la tabla PRODUCTO_CARRITO asociadas a la compra completada
        DELETE FROM PRODUCTO_CARRITO WHERE id_producto_carrito = NEW.id_carrito;
    END IF;
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
