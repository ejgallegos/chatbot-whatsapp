const { addKeyword } = require('@bot-whatsapp/bot');

/**
 * Servicios API Strapi
*/
const { getAlojamientos } = require('../api/servicesAlojamientos');

/**
 * Respuestas constantes
 */
const { MSJ_OPCIONES } = require('./../helpers/constantsResponse');
const { MENU } = require('./../helpers/constantsMenu');

/**
 * Validaciones
*/
const { validationCapacidad, validationOpciones } = require('../validatios/validationMenu');

/**
 * Otros Flujos
 */

const { flowReservar } = require("./flowReservar");
// const { flowFechaDisponible } = require("./flowFechaDisponible");
const { flowCerrarConversacion } = require("./flowCerrarConversacion");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * REGEX
*/
const regexCantPersonas = /^[1-6]$/;


/**
 * Variables
 */
let idAlojamiento;
let cantPersonas;
let arrayAlojamientos;
let contAlojamientos = 0;


/**
 * FLUJOS
 */
const flowListarAlojamientos = addKeyword(['flowListarAlojamientos'])
    .addAnswer('¡Perfecto! Primero veamos el alojamiento que deseas. Decime, ¿Para cuantas personas necesitas?')
    .addAnswer([MENU['menu-cant-personas']])
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            const cantidadPersonas = ctx.body.toLowerCase();

            if (!validationCapacidad(cantidadPersonas)) {
                await delay(500);
                await fallBack();
                return;
            };

            try {

                arrayAlojamientos = await getAlojamientos(cantidadPersonas);
                //console.log(JSON.stringify(arrayAlojamientos));

                cantPersonas = cantidadPersonas;
                console.log({ cantPersonas });
                await gotoFlow(flowFiltroAlojamientos);

            } catch (error) {
                await delay(500);
                await fallBack();
                return;
            }

        });

const flowFiltroAlojamientos = addKeyword(['flowFiltroAlojamientos'])
    .addAnswer('¡Perfecto! Para esa cantidad de personas, tenemos disponibles los siguientes alojamientos.')
    .addAction(async (ctx, { flowDynamic }) => {
        for (let dataAlojamientos of arrayAlojamientos) {
            await flowDynamic({ body: `*${contAlojamientos + 1})* ${dataAlojamientos.attributes.denominacion}`, media: `${dataAlojamientos.attributes.imagen}` });
            await flowDynamic({ body: `${dataAlojamientos.attributes.descripcion}` });
            contAlojamientos += 1;
        };
    })
    .addAnswer('Puedes encontrar más información ingresando al *link* que aparece en la descripción de cada alojamiento.', null,
        async (ctx, { flowDynamic, gotoFlow }) => {
            contAlojamientos = 0;
            await delay(500);
            await gotoFlow(flowVolverMenuPrincipal);
        });

const flowVolverMenuPrincipal = addKeyword(['flowVolverMenuPrincipal'])
    .addAnswer(['¿Puedo ayudarte en algo más?'])
    .addAnswer(['*1)* Ver otros alojamientos'])
    .addAnswer(['💡 Escribí *MENU* para volver al menú principal'])
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {

            const menuArray = ['MENU', 'menu', 'MENÚ', 'menú', 'Menú', 'Menu'];
            const opcionIngresada = !menuArray.includes(ctx.body) ? parseInt(ctx.body) : ctx.body.toLowerCase();
            console.log(opcionIngresada);

            if (typeof opcionIngresada === 'number') {

                if (!validationOpciones(1, opcionIngresada)) {
                    await delay(500);
                    await fallBack(MSJ_OPCIONES['opcion-invalida']);
                    return;
                };

                const opciones = {
                    1: flowListarAlojamientos,
                };

                await delay(500);
                await gotoFlow(opciones[opcionIngresada]);

            };

        });

module.exports = { flowListarAlojamientos, flowVolverMenuPrincipal, flowFiltroAlojamientos };