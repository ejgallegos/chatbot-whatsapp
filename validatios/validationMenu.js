const validationMenu = (opcion) => {
    const menuOpciones = ['1', '2', '3'];
    if (opcion.length > 1) {
        console.log('opcion.length ' + opcion.length);
        return false;
    };
    if (!menuOpciones.includes(opcion.toLowerCase())) {
        console.log('opcion ' + opcion);
        return false;
    };
    return true;
};

const validationCapacidad = (cant) => {
    const regexCantidad = /^[1-6]$/;
    return regexCantidad.test(cant);
};

const validationOpciones = (cantidad, opcion) => {
    const cantOp = parseInt(cantidad);
    const regex = new RegExp(`^[1-${cantOp}]$`);
    console.log(regex);
    console.log(regex.test(opcion));
    return regex.test(opcion);
};

module.exports = { validationMenu, validationCapacidad, validationOpciones };