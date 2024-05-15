//Importar libreria
const express = require('express');

const app = express();

/*//ruta inicial
app.get('/',function(req,res){
    res.send("En mantenimiento");
});
*/
//ruta de archivos estaticos
app.use(express.static("public"));

//80000,5000 si no da
app.listen(3000,function() {
    console.log("El servidor es http://localhost:3000");
});
