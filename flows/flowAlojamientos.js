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


const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * REGEX
*/
//const regexCantPersonas = /^[1-6]$/;

/**
 * Variables
 */
//let idAlojamiento;
let cantPersonas;
let arrayAlojamientos;
let contAlojamientos = 0;


/**
 * FLUJOS
 */
const flowListarAlojamientos = addKeyword(['flowListarAlojamientos'])
    .addAnswer('¡Perfecto! Primero veamos el alojamiento que deseas. Decime, ¿Para cuantas personas necesitas?', { delay: 1000 })
    .addAnswer([MENU['menu-cant-personas']], { delay: 1000 })
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow }) => {
            const cantidadPersonas = ctx.body.toLowerCase();

            if (!validationCapacidad(cantidadPersonas)) {
                await delay(1000);
                await fallBack();
                return;
            }

            try {

                arrayAlojamientos = await getAlojamientos(cantidadPersonas);
                //console.log(JSON.stringify(arrayAlojamientos));

                cantPersonas = cantidadPersonas;
                console.log({ cantPersonas });
                await delay(1000);
                return gotoFlow(flowFiltroAlojamientos);

            } catch (error) {
                await delay(1000);
                await fallBack();
                return;
            }

        });

const flowFiltroAlojamientos = addKeyword(['flowFiltroAlojamientos'])
    .addAnswer('¡Perfecto! Para esa cantidad de personas, tenemos disponibles los siguientes alojamientos.', { delay: 1000 },
        async (_, { flowDynamic, gotoFlow, fallBack }) => {
            try {

                for (let dataAlojamientos of arrayAlojamientos) {
                    await flowDynamic([{ body: `*${contAlojamientos + 1})* ${dataAlojamientos.attributes.denominacion}`, media: `${dataAlojamientos.attributes.imagen}` }]);
                    await flowDynamic([{ body: `${dataAlojamientos.attributes.descripcion}` }]);
                    contAlojamientos += 1;
                }

                await flowDynamic('Puedes encontrar más información ingresando al *link* que aparece en la descripción de cada alojamiento.');
                contAlojamientos = 0;
                await delay(1000);
                return gotoFlow(flowVolverMenuPrincipal);

            } catch (error) {
                await delay(1000);
                await fallBack();
                return;
            }

        });

const flowVolverMenuPrincipal = addKeyword(['flowVolverMenuPrincipal'])
    .addAnswer('¿Puedo ayudarte en algo más?')
    .addAnswer('*1)* Ver otros alojamientos')
    .addAnswer('💡 Escribí *MENU* para volver al menú principal', { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow }) => {

            const menuArray = ['MENU', 'menu', 'MENÚ', 'menú', 'Menú', 'Menu'];
            const opcionIngresada = !menuArray.includes(ctx.body) ? parseInt(ctx.body) : ctx.body.toLowerCase();
            console.log(opcionIngresada);

            if (typeof opcionIngresada === 'number') {

                if (!validationOpciones(1, opcionIngresada)) {
                    await delay(1000);
                    await fallBack(MSJ_OPCIONES['opcion-invalida']);
                    return;
                }

                const opciones = {
                    1: flowListarAlojamientos,
                };

                await delay(1000);
                await gotoFlow(opciones[opcionIngresada]);

            }

        });

module.exports = { flowListarAlojamientos, flowFiltroAlojamientos, flowVolverMenuPrincipal };