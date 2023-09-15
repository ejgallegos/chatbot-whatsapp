const axios = require("axios");
const ENVIRONMENT_STRAPI = process.env.ENVIRONMENT === 'develop' ? process.env.URL_DEVELOPMENT_STRAPI : process.env.URL_PRODUCTION_STRAPI;


/**
 * STRAPI API
 */
const getAlojamientos = async (capacidad) => {

    const CAPACIDAD_DEFAULT = 2;
    const capacidades = {
        1: 2,
        2: 2,
        3: 4,
        4: 4,
        5: 6,
        6: 6
    };

    const cap = capacidades[capacidad] || CAPACIDAD_DEFAULT;

    try {
        var config = {
            method: 'get',
            url: `${ENVIRONMENT_STRAPI}/alojamientos?filters[capacidad][$eq]=${cap}`,
            headers: {
                Authorization: `Bearer ${process.env.TOKEN_API_STRAPI}`,
            },
        };
        const response = await axios(config);
        // console.log(response.data.data);
        return response.data.data;
    } catch (error) {
        console.log(error);
        throw error;
    };

};

const registerAlojamiento = async (telefono, nombreApellido = '', email = 'email@email.com') => {

    const url = `${ENVIRONMENT_STRAPI}/alojamientos`;

    const data = {
        data: {
            denominacion: nombreApellido,
            email: email,
            telefono: parseInt(telefono),
        },
    };

    const headers = {
        Authorization: `Bearer ${process.env.TOKEN_API_STRAPI}`
    };


    await axios.post(url, data, { headers: headers })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
        });

};

const updateAlojamiento = async (id, telefono, nombreApellido = '', email = 'email@email.com') => {


    const url = `${ENVIRONMENT_STRAPI}/alojamientos/${id}`;

    const headers = {
        Authorization: `Bearer ${process.env.TOKEN_API_STRAPI}`,
    };

    const data = {
        data: {
            denominacion: nombreApellido,
            email: email,
            telefono: parseInt(telefono),
        },
    };

    await axios.put(url, data, { headers: headers })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
        });

};

module.exports = { getAlojamientos, registerAlojamiento, updateAlojamiento };