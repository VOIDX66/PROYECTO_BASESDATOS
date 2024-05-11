//Funcion para filtrar los caracteres especiales
function filtrarCaracteresEspeciales() {
    const regex_user = /^[a-zA-Z0-9_]+$/;
    const inputUserElement = document.getElementById('username');
    const valor = inputUserElement.value;

    if (!regex_user.test(valor)) {
        inputUserElement.value = valor.replace(/[^a-zA-Z0-9_]/g, '');
        alert('No se permiten caracteres especiales');
    }
   
    const regex_email = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9.]+$/;
    const inputEmailElement = document.getElementById('email');
    const valorEmail = inputEmailElement.value;

    if (!regex_email.test(valorEmail)) {
        inputEmailElement.value = ''; // Vaciar el campo si el correo no es válido
        alert('Por favor, introduzca una dirección de correo electrónico válida');
    }

    const regex_password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{4,}$/;
    const inputPasswordElement = document.getElementById('passw');
    const valorPassword = inputPasswordElement.value;

    if (!regex_password.test(valorPassword)){
        inputPasswordElement.value = ''; // Vaciar el campo si la contraseña no es válida
        alert("La contraseña no debe contener caracteres especiales, esta debe tener minimo 4 digitos y contener"
              +"al menos una mayuscula y minuscula");
    }    
}