//Importar libreria::::::::::::::::::::::::::::::::::::::::::::
const express = require('express'); 
const mysql = require('mysql2');
const session = require('express-session'); //middleware
const multer = require('multer');
const path = require('path');
const { render } = require('ejs');
const fs = require('fs');


//Objetos :::::::::::::::::::::::::::::::::::::::::::::::::::::
const app = express();
const connection = mysql.createConnection({
    host: "localhost",
    database: "proyecto_db",
    user: "root",
    password: "1234"
});

const uploadDir = 'public/assets/images/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage : storage});
//aplicaciones:::::::::::::::::::::::::::::::::::::::::::::::::
app.set("view engine", "ejs");
app.use(express.static("public"));//RUTA
//Siempre cuando usemos datos que vengan de paginas
app.use(express.json());
app.use(express.urlencoded({extended:true}))
//Almacenamiento de sesiones de usuarios

app.use(session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Asegúrate de configurar esto en 'true' en producción con HTTPS
}));


//RUTAS::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//Ruta principal
app.get("/", function(req, res) {
    connection.query("SELECT * FROM PRODUCTO", (error, productos) => {
        if (error) {
            throw error;
        }
        const user = req.session.user;
        if (typeof user === 'undefined' || user.length === 0) {
            res.render("index", { productos, user });
        } else {
            if (user.tipo_usuario == "administrador") {
                res.render("administracion", { productos, user });
            } else {
                res.render("index", { productos, user });
            }
        }

    });
});

//Renderizado de la vista del formulario de registro
app.get("/register",function(req,res){
    res.render("register");
});

//Validacion de datos para crear usuario
app.post("/validar_registro",function(req,res){
    const data = req.body;
    let username = data.username;
    let email = data.email;
    let pass = data.pass_user;
    let register = `INSERT INTO usuario (nombre_usuario, email_usuario, contrase_usuario, tipo_usuario) VALUES ('${username}','${email}','${pass}','cliente')`;
    connection.query(register,function(err,result){
        if(err){
            throw err;
        }else{
            console.log("Data saved successfully");
            let get_id = `SELECT * FROM usuario WHERE nombre_usuario = '${username}' AND contrase_usuario = '${pass}'`;
            connection.query(get_id,function(err,usuario){
                req.session.user = {
                    id: usuario[0].id_usuario,
                    username: usuario[0].nombre_usuario,
                    tipo_usuario: usuario[0].tipo_usuario
                };
                //console.log(usuario[0]);
                //La redireccion debe de estar dentro de la consulta para que esta funcione
                res.redirect("/");
            });
        }
    }); 
});

//Renderizado de la vista del formulario de inicio de sesion
app.get("/login",function(req,res){
    res.render("login");
});


// Validacion de los datos de inicio de sesion
app.post('/validar_login', (req, res) => {
    const data = req.body;
    let username = data.username;
    let password = data.pass_user;
    const login = `SELECT * FROM USUARIO WHERE nombre_usuario = "${username}" AND contrase_usuario = "${password}"`;
    connection.query(login,(err, results) => {
        if (err) {
            console.error('Error al verificar las credenciales:', err);
        } else {
            if (results.length > 0) {
                req.session.user = {
                    id: results[0].id_usuario,
                    username: results[0].nombre_usuario,
                    tipo_usuario: results[0].tipo_usuario
                };
                const user = req.session.user;
                let ruta = "/";
                if (user.tipo_usuario == "administrador") {
                    ruta = "/administracion";
                }
                res.redirect(ruta);
            } else {
                res.render('login', { error: 'Credenciales incorrectas. Por favor, intenta de nuevo.' });
            }
        }
    });
});


// Cierre de la sesion destruyendo la sesion
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Nombre de la cookie por defecto usada por express-session
        //res.redirect('/login');
        res.redirect('/');
    });
});

// Busqueda de los productos
app.get('/busqueda', (req, res) => {
    const producto_buscado = req.query.searchInput;
    const categoria = req.query.categoria;
    let busqueda;
    if (categoria != ""){
        busqueda = `SELECT * FROM PRODUCTO P JOIN CATEGORIA C ` +
                    `ON P.id_categoria = C.id_categoria `+
                    `WHERE P.nombre_producto LIKE "%${producto_buscado}%" AND C.nombre_categoria = "${categoria}"`;
    }else{
        busqueda = `SELECT * FROM PRODUCTO WHERE nombre_producto LIKE "%${producto_buscado}%"`;
    }
    const user = req.session.user;
    connection.query(busqueda,(err, productos) => {
        if (err) {
            throw err;
        } else{
            if (typeof user === 'undefined' || user.length === 0) {
                if (productos.length > 0) {
                    res.render("index", { productos, user });
                }else{
                    res.render("index", { user });
                } 
            }else{
                let ruta = "index";
                if (user.tipo_usuario == "administrador"){
                    ruta = "administracion";
                }
                if (productos.length > 0) {
                    res.render(ruta, { productos, user });
                }else{
                    res.render(ruta, { user });
                }    
            }
        }
    });
});

app.get("/administracion",function(req,res){
    const user = req.session.user;
    if (typeof user === 'undefined' || user.length === 0) {
        res.redirect("/")
    } else {
        if(user.tipo_usuario == "administrador") {
            res.render("administracion", { user });
        }
        else{
            res.redirect("/")
        }
    }
});

app.get("/ver_producto",function(req,res){

    const producto_seleccionado = req.query.id_producto;
    //console.log(`id_producto: ${producto_seleccionado}`);
    connection.query(`SELECT * FROM PRODUCTO WHERE id_producto = "${producto_seleccionado}"`, (error, producto) => {
        if (error) {
            throw error;
        }else{
            const user = req.session.user;
            let producto_encontrado = producto[0];
            const comentarios = `SELECT C.contenido, U.nombre_usuario FROM COMENTARIO C JOIN USUARIO U ON C.id_usuario = U.id_usuario `+
                                `WHERE id_producto = "${producto_encontrado.id_producto}"`;
            connection.query(comentarios, (err, comentarios) => {
                if (err){
                    throw err;
                }else{
                    if (typeof user === 'undefined' || user.length === 0) {
                        res.render("ver_producto", {producto_encontrado, comentarios});
                    }else{
                        res.render("ver_producto", {producto_encontrado, user, comentarios });    
                    }
                }
            });   
        }
    });
});

app.post("/comentar",function(req,res){
    const comentario = req.body;
    //console.log(comentario);
    const user = req.session.user;
    if (typeof user === 'undefined' || user.length === 0) {
    }else{
        insert_coment = `INSERT INTO COMENTARIO (id_producto, id_usuario, contenido) `+
                        `VALUES (${comentario.id_producto},${user.id},"${comentario.contenido}")`;
        connection.query(insert_coment, (err, rest)=>{
            if(err){
                throw err;
            }else{
                res.redirect(`/ver_producto?id_producto=${comentario.id_producto}`);
            }
         });
    }
});

app.post("/nuevo_producto", upload.single('imagen'), (req, res) => {
    try{
        const producto = req.body;
        const imageBuffer = fs.readFileSync(req.file.path);
        const consulta =`INSERT INTO PRODUCTO (id_categoria, nombre_producto, descripcion, precio_unidad, cantidad_disp, imagen) `+
                        `VALUES(?,?,?,?,?,?)`;
        
        connection.query(consulta,[producto.categoria,producto.nombre_producto,producto.descripcion,producto.precio_unidad,producto.cantidad_disp,imageBuffer], function(err, result) {
            if (err) {
                throw err;
            }else{
                res.render("administracion")
            }
        });
    }catch(err){
        console.log(err);
    }
});


app.post("/add_producto",function(req,res){
    res.render("add_producto");
});



app.post("/edit_producto",function(req,res){
    connection.query("SELECT * FROM PRODUCTO", (error, productos) => {
        if (error) {
            throw error;
        }
        res.render("edit_producto", { productos });
    });
});

app.post("/editar_producto",function(req,res){
    const producto_seleccionado = req.body.id_producto;
    connection.query(`SELECT * FROM PRODUCTO WHERE id_producto = "${producto_seleccionado}"`, (error, producto) => {
        if (error) {
            throw error;
        }else{
            let producto_encontrado = producto[0];
            //console.log(producto);
            res.render('editar_producto', {producto_encontrado});
        }
    });
});

app.post("/aplicar_edicion_producto", upload.single('imagen'), (req, res) => {
    try{
        const producto = req.body;
        let consulta;
        try{
            const imageBuffer = fs.readFileSync(req.file.path);
            consulta =`UPDATE PRODUCTO SET nombre_producto = "${producto.nombre_producto}", descripcion = "${producto.descripcion}", precio_unidad = ${producto.precio_unidad},`+
                      `cantidad_disp = ${producto.cantidad_disp}, imagen = ? `+
                      `WHERE id_producto = ${producto.id_producto}`;

            connection.query(consulta, [imageBuffer], function (err, result) {
            if (err) {
                throw err;
            }else{
                res.render('administracion');
            }
            });
            
        }catch{
            //console.log(producto);
            consulta =`UPDATE PRODUCTO SET nombre_producto = "${producto.nombre_producto}", descripcion = "${producto.descripcion}", precio_unidad = ${producto.precio_unidad},`+
                      `cantidad_disp = ${producto.cantidad_disp} `+
                      `WHERE id_producto = ${producto.id_producto}`;

            connection.query(consulta, function (err, result) {
            if (err) {
                throw err;
            }else{
                res.render('administracion');
            }
            });
        }
    }catch(err){
        console.log(err);
    }
});

app.post("/delete_producto",function(req,res){
    connection.query("SELECT * FROM PRODUCTO", (error, productos) => {
        if (error) {
            throw error;
        }
        res.render("delete_producto", { productos });
    });
});

app.post('/eliminar_producto', (req, res) => {
    const producto = req.body.id_producto;

    connection.query(`DELETE FROM COMENTARIO WHERE id_producto = ${producto}`, (err, ress) => {
        if(err){
            throw err;
        }else{
            connection.query(`DELETE FROM CONTENIDO_COMPRA WHERE id_producto = ${producto}`, (erc, resc) => {
                if (erc){
                    throw erc;
                }else{
                    connection.query(`DELETE FROM PRODUCTO WHERE id_producto = ${producto}`, (error, respuesta) => {
                        if (error) {
                            throw error;
                        }
                        else{
                            res.render("administracion");
                        }
                    });
                }
            });
        }
    }); 
});

app.get("/carrito", function(req, res) {
    const user = req.session.user;
        if (typeof user === 'undefined' || user.length === 0) {
            res.redirect("/")
        }else{
            connection.query(`SELECT * FROM USUARIO U `+
                            `JOIN CARRITO C ON U.id_usuario = C.id_usuario JOIN PRODUCTO_CARRITO PC `+
                            `ON PC.id_carrito = C.id_carrito JOIN PRODUCTO P `+
                            `ON P.id_producto = PC.id_producto WHERE U.id_usuario = ${user.id}`, (error, productos) => {
                if (error) {
                    throw error;
                }else{
                    res.render("carrito",{productos});
                }
            });
        } 
});

app.post("/quitar_producto", function (req, res) {
    const producto = req.body.id_producto;
    const carrito = req.body.id_carrito;
    connection.query(`DELETE FROM producto_carrito WHERE id_carrito = ${carrito} AND id_producto = ${producto}`, function (error, respuesta){
        if (error) {
            throw error;
        }else{
            res.redirect("/carrito");
        }           
    });
});

app.post("/comprar", function (req, res) {
    const producto = req.body.id_producto;
    const usuario = req.body.id_usuario;
    const cantidad = req.body.numero;
    connection.query(`SELECT * FROM CARRITO WHERE id_usuario = ${usuario}`, function (error, carrito){
        if (error) {
            throw error;
        }else{
            const id_carrito = carrito[0].id_carrito;
            connection.query(`INSERT INTO PRODUCTO_CARRITO (id_carrito, id_producto, cantidad_producto_c) VALUES (${id_carrito},${producto},${cantidad})`, function(err, resultado){
                if(err){
                    throw err;
                }else{
                    res.redirect("/carrito")
                }
            });    
        }
    });
});

app.post("/datos_comprar", function(req, res){
    const id_carrito = req.body.id_carrito;
    res.render("comprar",{id_carrito});
});

app.post("/nueva_compra", function (req, res) {
    const pago = req.body.metodo_pago;
    const direccion = req.body.direccion;
    const numero = req.body.numero;
    const user = req.session.user;
    const carrito = req.body.id_carrito;
    if (typeof user === 'undefined' || user.length === 0) {

    }else{  
        connection.query(`INSERT INTO COMPRA (id_usuario,id_carrito,metodo_pago,fecha_pedido,direccion_entrega,n_contacto) `+
                            `VALUES (${user.id},${carrito},"${pago}",CURRENT_DATE,"${direccion}",${numero})`,function (error,resultado){
            if (error){
                throw error;
            }else{
                connection.query(`SELECT * FROM COMPRA WHERE id_carrito = ${carrito} AND estado = "ENPROCESO" ORDER BY id_compra DESC`, function(err,compra){
                    if (err){
                        throw err;
                    }else{
                        let total = compra[0].precio_total;
                        res.render("confirmar_cancelar", {carrito,total});
                    }
                    
                });
                
            }
        });
    }
});

app.post('/completar_compra', function(req,res) {
    carrito = req.body.id_carrito;
    connection.query(`SELECT id_compra FROM COMPRA WHERE id_carrito = ${carrito} AND estado = "ENPROCESO" ORDER BY id_compra DESC`, function(err,compra){
        if(err){
            throw err;
        }else{
            const id_compra = compra[0].id_compra;
            connection.query(`UPDATE COMPRA SET estado = "COMPLETADA" WHERE id_compra = ${id_compra}`, function(error, resultado){
                if(error){
                    throw error;
                }else{
                    res.redirect('/carrito');
                }
            });
        }
    });
});

app.post('/cancelar_compra', function(req,res) {
    carrito = req.body.id_carrito;
    connection.query(`SELECT id_compra FROM COMPRA WHERE id_carrito = ${carrito} AND estado = "ENPROCESO" ORDER BY id_compra DESC`, function(err,compra){
        if(err){
            throw err;
        }else{
            const id_compra = compra[0].id_compra;
            connection.query(`UPDATE COMPRA SET estado = "CANCELADA" WHERE id_compra = ${id_compra}`, function(error, resultado){
                if(error){
                    throw error;
                }else{
                    res.redirect('/carrito');
                }
            });
        }
    });
});
//VALIDACION DE CONEXION CON LA BASE DE DATOS
connection.connect(function(err){
    if(err){
        throw err;
    }else{
        console.log('connection_succefully established')
    }
});
//PUERTO USADO::::::::::::::::::::::::::::::::::::::::::::::::::
app.listen(3000,function() {
    console.log("El servidor es http://localhost:3000");
});