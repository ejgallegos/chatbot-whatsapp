const axios = require("axios");
const { handleHttpError } = require("../validatios/handleHttpError");
const ENVIRONMENT_STRAPI = process.env.ENVIRONMENT === 'develop' ? process.env.URL_DEVELOPMENT_STRAPI : process.env.URL_PRODUCTION_STRAPI;


/**
 * STRAPI API
 */
const getListClientes = async () => {
    try {
        var config = {
            method: 'get',
            url: `${ENVIRONMENT_STRAPI}/clientes`,
            headers: {
                Authorization: `Bearer ${process.env.TOKEN_API_STRAPI}`,
            },
        };
        const response = await axios(config);
        return response.data.data;
    } catch (error) {
        handleHttpError(error);
    }

};

const getCliente = async (telefono) => {
    try {
        var config = {
            method: 'get',
            url: `${ENVIRONMENT_STRAPI}/clientes?filters[telefono][$eq]=${parseInt(telefono)}`,
            headers: {
                Authorization: `Bearer ${process.env.TOKEN_API_STRAPI}`,
            },
        };
        const response = await axios(config);
        return response.data.data;
    } catch (error) {
        handleHttpError(error);
    }

};

const registerCliente = async (telefono, nombreApellido = '', email = 'email@email.com') => {

    const url = `${ENVIRONMENT_STRAPI}/clientes`;

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
            handleHttpError(error);
        });

};

const updateCliente = async (id, telefono, nombreApellido = '', email = 'email@email.com') => {


    const url = `${ENVIRONMENT_STRAPI}/clientes/${id}`;

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
            handleHttpError(error);
        });

};

module.exports = { getListClientes, getCliente, registerCliente, updateCliente };