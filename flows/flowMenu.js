const { addKeyword } = require('@bot-whatsapp/bot');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

console.log('menu');

//const { MENU } = require('./../helpers/constantsMenu');
//const { MSJ_OPCIONES } = require('./../helpers/constantsResponse');

// const { flowReservar } = require('./flowReservar');
// const { flowFechaDisponible } = require('./flowFechaDisponible');
// const { flowListarAlojamientos } = require('./flowAlojamientos');
// const { flowCerrarConversacion } = require('./flowCerrarConversacion');

/**
 * Validaciones
 */
const { validationOpciones } = require('../validatios/validationMenu');


const flowMenu = addKeyword('flowMenu')
    .addAnswer('¿En que puedo ayudarte?, te muestro algunas opciones.',
        { capture: true },
        async (ctx, { gotoFlow, fallBack }) => {
            const respuestaOpcion = ctx.body.toLowerCase();
            if (!validationOpciones(4, respuestaOpcion)) {
                await delay(500);
                await fallBack();
                return;
            }

            //const flowReservar = require('./flowReservar')

            const opciones = {
                1: 'flowReservar',
                // 2: flowFechaDisponible,
                // 3: flowListarAlojamientos,
                // 4: flowCerrarConversacion,
            };

            await delay(500);
            console.log(opciones[respuestaOpcion]);
            await gotoFlow(opciones[respuestaOpcion]);
        });

module.exports = { flowMenu };