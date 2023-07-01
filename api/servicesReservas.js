const axios = require("axios");
const ENVIRONMENT_STRAPI = process.env.ENVIRONMENT === 'develop' ? process.env.URL_DEVELOPMENT_STRAPI : process.env.URL_PRODUCTION_STRAPI;


/**
 * STRAPI API
 */
const registrarReserva = async (fechaReserva, idAlojamiento, fechaInicio, fechaFinal, idCliente, telefono) => {

    const url = `${ENVIRONMENT_STRAPI}/reservas`;
    const data = {
        data: {
            fechaDesde: fechaInicio,
            fechaHasta: fechaFinal,
            fechaReserva: fechaReserva,
            telefono: parseInt(telefono),
            cliente: parseInt(idCliente),
            alojamiento: idAlojamiento
        }
    };

    const headers = {
        Authorization: `Bearer ${process.env.TOKEN_API_STRAPI}`
    };

    await axios.post(url, data, {
        headers: headers
    })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
        });

};

module.exports = { registrarReserva };