const { addKeyword, addChild } = require('@bot-whatsapp/bot');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const { MENU } = require('./../helpers/constantsMenu');
const { MSJ_OPCIONES } = require('./../helpers/constantsResponse');

const { flowReservar } = require('./flowReservar');
const { flowListarAlojamientos } = require('./flowFechaDisponible');
const { flowCerrarConversacion } = require('./flowCerrarConversacion');


const flowMenuPrincipal = addKeyword(['flowMenuPrincipal'])
    .addAnswer('¿En que puedo ayudarte?, te muestro algunas opciones.')
    .addAnswer([MENU['menu-principal']])
    .addAnswer([MSJ_OPCIONES["elegir-opcion"]],
        async (ctx, { flowDynamic, gotoFlow, fallBack, endFlow }) => {
            const respuestaOpcion = ctx.body.toLowerCase();
            if (!validationOpciones(4, respuestaOpcion)) {
                await delay(500);
                await fallBack();
                return;
            };

            const opciones = {
                1: flowReservar,
                2: flowListarAlojamientos,
                3: '',
                4: flowCerrarConversacion,
            };

            await delay(500);
            await gotoFlow(opciones[respuestaOpcion]);
        });

module.exports = { flowMenuPrincipal };