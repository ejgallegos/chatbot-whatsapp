const axios = require("axios");
const { handleHttpError } = require("../validatios/handleHttpError");
const ENVIRONMENT_STRAPI = process.env.ENVIRONMENT === 'develop' ? process.env.URL_DEVELOPMENT_STRAPI : process.env.URL_PRODUCTION_STRAPI;


/**
 * STRAPI API
 */
const verificaFechaReserva = async (fechaDesde, fechaFinal, idAlojamiento) => {
    console.log({ fechaDesde, fechaFinal, idAlojamiento })
    try {
        var config = {
            method: 'get',
            url: `${ENVIRONMENT_STRAPI}/reservas?filters[$and][0][fechaDesde][$lte]=${fechaFinal}&filters[$and][1][fechaHasta][$gte]=${fechaDesde}&filters[alojamiento][id][$eq]=${idAlojamiento}`,
            headers: {
                Authorization: `Bearer ${process.env.TOKEN_API_STRAPI}`,
            },
        };
        const response = await axios(config);
        console.log(response.data.data);
        return response.data.data;
    } catch (error) {
        handleHttpError(error);
    };

};
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

module.exports = { verificaFechaReserva, registrarReserva };