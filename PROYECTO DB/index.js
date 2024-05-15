//Importar libreria::::::::::::::::::::::::::::::::::::::::::::
const express = require('express');
const ejs = require('ejs');
//Objetos :::::::::::::::::::::::::::::::::::::::::::::::::::::
const app = express();

//app.set('views',"./public/views")
app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/",function(req,res){
    res.render("index");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.listen(3000,function() {
    console.log("El servidor es http://localhost:3000");
});
