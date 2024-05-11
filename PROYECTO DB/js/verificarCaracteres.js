function filtrarCaracteresEspeciales(input) {
    // Expresión regular para permitir solo letras, números y espacios
    const regex = /^[a-zA-Z0-9_]+$/;
    const valor = input.value;

    if (!regex.test(valor)) {
        input.value = valor.replace(/[^a-zA-Z0-9\s]/g, '');
        alert('No se permiten caracteres especiales');
    }
}