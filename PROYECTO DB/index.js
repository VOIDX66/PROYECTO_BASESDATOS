//Importar libreria::::::::::::::::::::::::::::::::::::::::::::
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');

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
app.use(session({
    secret: 'mi-secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Asegúrate de configurar esto en 'true' en producción con HTTPS
}));


//RUTAS::::::::::::::::::::::::::::::::::::::::::::::::::::::::

app.get("/", function(req, res) {
    connection.query("SELECT * FROM PRODUCTO", (error, productos) => {
        if (error) {
            throw error;
        }
        const user = req.session.user;
        console.log(user);
        res.render("index", { productos, user });
        //console.log(productos)
    });
});

app.get("/register",function(req,res){
    res.render("register");
});

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
            res.redirect("/");
        }
    }); 
});

app.get("/login",function(req,res){
    res.render("login");
});

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
                    username: results[0].nombre_usuario
                };
                res.redirect('/');
            } else {
                res.render('login', { error: 'Credenciales incorrectas. Por favor, intenta de nuevo.' });
            }
        }
    });
});

app.get('/busqueda', (req, res) => {
    const producto_buscado = req.query.searchInput;
    const busqueda = `SELECT * FROM PRODUCTO WHERE nombre_producto LIKE "%${producto_buscado}%"`;
    connection.query(busqueda,(err, productos ) => {
        if (err) {
            throw err;
        } else{
            if (productos.length > 0) {
                res.render("index", { productos });
                console.log(productos);
            }
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
