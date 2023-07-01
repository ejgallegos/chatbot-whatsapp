const moment = require("moment");
moment.locale('es');

let fechaActual = moment();

const validationFechaReserva = (fecha) => {
    const regexFecha = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$/;
    return regexFecha.test(fecha);
};

const validationCantidadDias = (cant) => {
    const regexCantidad = /^[1-9]$/;
    return regexCantidad.test(cant);
};

const validationFechaInvalida = (fecha) => {
    const regexFecha = /Fecha inválida/;
    return regexFecha.test(fecha);
};

const validationFechaMenor = (fecha) => {
    const esFechaValida = moment(fechaActual).isSameOrAfter(fecha, 'day');
    return esFechaValida;
};

module.exports = { validationFechaReserva, validationCantidadDias, validationFechaInvalida, validationFechaMenor };