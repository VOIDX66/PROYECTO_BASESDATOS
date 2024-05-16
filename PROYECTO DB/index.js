//Importar libreria::::::::::::::::::::::::::::::::::::::::::::
const express = require('express');
const mysql = require('mysql2');
const ejs = require('ejs');
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

//RUTAS::::::::::::::::::::::::::::::::::::::::::::::::::::::::
app.get("/",function(req,res){
    res.render("index");
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
                res.redirect('/');
            } else {
                res.render('login', { error: 'Credenciales incorrectas. Por favor, intenta de nuevo.' });
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
