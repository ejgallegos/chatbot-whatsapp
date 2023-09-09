const axios = require("axios");
const { handleHttpError } = require("../validatios/handleHttpError");
const ENVIRONMENT_STRAPI = process.env.ENVIRONMENT === 'develop' ? process.env.URL_DEVELOPMENT_STRAPI : process.env.URL_PRODUCTION_STRAPI;


/**
 * STRAPI API
 */
const verificaFechasDisponibles = async (mes, idAlojamiento) => {
    console.log({ mes, idAlojamiento })
    try {
        var config = {
            method: 'get',
            url: `${ENVIRONMENT_STRAPI}/reservas?filters[alojamiento][id][$eq]=${idAlojamiento}&populate=*`,
            headers: {
                Authorization: `Bearer ${process.env.TOKEN_API_STRAPI}`,
            },
        };
        const response = await axios(config);
        const data = response.data;
        console.log({ data });
        const mesFechasDisponibles = obtenerDiasOcupadosPorMes(data, mes, idAlojamiento);
        console.log({ mesFechasDisponibles });
        return mesFechasDisponibles;
    } catch (error) {
        handleHttpError(error);
    };

};

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
/**
 * STRAPI API
 */

const obtenerDiasOcupadosPorMes = (datos, mes, idAlojamiento) => {
    const reserva = datos.data.find(item => item.attributes.alojamiento.data.id === idAlojamiento);

    if (!reserva) {
        console.log('Alojamiento no encontrado');
        return [];
    }

    const fechaDesde = new Date(reserva.attributes.fechaDesde);
    const fechaHasta = new Date(reserva.attributes.fechaHasta);

    const año = fechaDesde.getFullYear();

    const primerDiaDelMes = new Date(año, mes - 1, 1);
    const ultimoDiaDelMes = new Date(año, mes, 0);

    const diasDelMes = [];
    const diasSemana = [' Do ', 'Lu ', 'Ma ', 'Mi ', 'Ju ', 'Vi ', 'Sa ', '\n'];

    // Agregar iniciales de los días de la semana
    diasSemana.forEach(dia => diasDelMes.push(dia));

    // Llenar los primeros espacios vacíos si el primer día no es un lunes
    for (let i = 0; i < primerDiaDelMes.getDay(); i++) {
        diasDelMes.push(' --- ');
    }

    for (let día = 1; día <= ultimoDiaDelMes.getDate(); día++) {
        const fechaActual = new Date(año, mes - 1, día);
        const fechaActualComparable = new Date(año, mes - 1, día);

        let ocupado = false;

        // Verificar si la fecha actual está en alguna reserva aprobada
        datos.data.forEach(item => {

            const fechaReservaDesde = new Date(item.attributes.fechaDesde);
            const fechaReservaHasta = new Date(item.attributes.fechaHasta);
            fechaReservaHasta.setDate(fechaReservaHasta.getDate() + 1); // Agregar un día a la fechaHasta de la reserva
            const fechaReservaDesdeComparable = new Date(fechaReservaDesde.getFullYear(), fechaReservaDesde.getMonth(), fechaReservaDesde.getDate());
            const fechaReservaHastaComparable = new Date(fechaReservaHasta.getFullYear(), fechaReservaHasta.getMonth(), fechaReservaHasta.getDate());

            if (fechaActualComparable > fechaReservaDesdeComparable && fechaActualComparable < fechaReservaHastaComparable) {
                ocupado = true;
            }

        });

        if (ocupado) {
            diasDelMes.push(' [X]');
        } else {
            diasDelMes.push(día < 10 ? ` 0${día}` : ` ${día}`);
        }

        if (fechaActual.getDay() === 6 || día === ultimoDiaDelMes.getDate()) {
            diasDelMes.push('\n');
        }
    }

    const nombreMes = obtenerNombreMesEnEspañol(mes);

    return { nombreMes: nombreMes, diasDelMes: diasDelMes.join('') };
};

const obtenerNombreMesEnEspañol = (mes) => {
    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return nombresMeses[mes - 1];
};

module.exports = { verificaFechaReserva, registrarReserva, verificaFechasDisponibles };