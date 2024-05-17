//Importar libreria::::::::::::::::::::::::::::::::::::::::::::
const express = require('express'); 
const mysql = require('mysql2');
const session = require('express-session'); //middleware

//Objetos :::::::::::::::::::::::::::::::::::::::::::::::::::::
const app = express();
const connection = mysql.createConnection({
    host: "localhost",
    database: "proyecto_db",
    user: "root",
    password: "1234"
});
//aplicaciones:::::::::::::::::::::::::::::::::::::::::::::::::
app.set("view engine", "ejs");
app.use(express.static("public"));//RUTA
//Siempre cuando usemos datos que vengan de paginas
app.use(express.json());
app.use(express.urlencoded({extended:false}))
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
        //console.log(user);
        res.render("index", { productos, user });
        //console.log(productos)
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
                    ruta = "/gestion";
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
                //
            }else{
                let ruta = "index";
                if (user.tipo_usuario == "administrador"){
                    ruta = "gestion_productos";
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

app.get("/gestion",function(req,res){
    connection.query("SELECT * FROM PRODUCTO", (error, productos) => {
        if (error) {
            throw error;
        }
        const user = req.session.user;
        //console.log(user);
        res.render("gestion_productos", { productos, user });
        //console.log(productos)
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
