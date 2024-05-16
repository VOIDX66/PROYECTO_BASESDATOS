app.post('/validar_login', (req, res) => {
    const data = req.body;
    let username = data.username;
    let password = data.pass_user;
    console.log(data);
    
    const login = `SELECT * FROM USUARIO WHERE nombre_usuario = "${username}" AND contrase_usuario = "${password}"`;
    connection.query(login,(err, results) => {
        if (err) {
            console.error('Error al verificar las credenciales:', err);
        } else {
            if (results.length > 0) {
                console.log("Se logro");
                res.redirect('index');
            } else {
                res.render('login', { err: 'Credenciales incorrectas. Por favor, intenta de nuevo.' });
                
            }
        }
    });
});