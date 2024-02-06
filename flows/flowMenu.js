const { addKeyword } = require('@bot-whatsapp/bot');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Respuestas constantes
 */
const { MSJ_OPCIONES } = require('../helpers/constantsResponse');
const { MENU } = require('../helpers/constantsMenu');

/**
 * Validaciones
 */
const { validationOpciones } = require('../validatios/validationMenu');

/**Flows
 * 
 */
const { flowReservar } = require("./flowReservar");
const flowCerrarConversacion = require("./flowCerrarConversacion");
const derivarAgente = require("./agentes/derivarAgente.flow");
const { flowFechaDisponible } = require("./flowFechaDisponible");
const { flowListarAlojamientos } = require("./flowAlojamientos");

module.exports = addKeyword('###flowMenu###')
    .addAnswer('¿En que puedo ayudarte?, te muestro las principales opciones.', { delay: 1000 })
    .addAnswer([MENU['menu-principal']], { delay: 1000 })
    .addAnswer([MSJ_OPCIONES["elegir-opcion"]], { capture: true, delay: 1000 },
        async (ctx, { gotoFlow, fallBack }) => {
            const respuestaOpcion = ctx.body.toLowerCase();
            if (!validationOpciones(5, respuestaOpcion)) {
                await delay(1000);
                await fallBack();
                return;
            }

            const opciones = {
                1: flowReservar,
                2: flowFechaDisponible,
                3: flowListarAlojamientos,
                4: derivarAgente,
                5: flowCerrarConversacion,
            };

            await delay(1000);
            await gotoFlow(opciones[respuestaOpcion]);
        });
