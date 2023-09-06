const { addKeyword } = require('@bot-whatsapp/bot');

/**
 * Servicios API Strapi
*/
const { getAlojamientos } = require('../api/servicesAlojamientos');

/**
 * Respuestas constantes
 */
const { MSJ_OPCIONES } = require('./../helpers/constantsResponse');

/**
 * Otros Flujos
 */
const { flowMenuPrincipal } = require("./flowMenu");

/**
 * Validaciones
 */
const { validationCapacidad, validationOpciones } = require('../validatios/validationMenu');

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
const flowVolverMenuPrincipal_3 = addKeyword(['flowVolverMenuPrincipal_3'])
    .addAnswer(['¿Puedo ayudarte en algo más?'])
    .addAnswer(['*1)* Seleccionar otro alojamiento', '*2)* Volver al menú principal'])
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            const opcionIngresada = parseInt(ctx.body);

            if (!validationOpciones(2, opcionIngresada)) {
                await delay(500);
                await fallBack(MSJ_OPCIONES['opcion-invalida']);
                return;
            };

            const opciones = {
                1: flowListarAlojamientos_3,
                2: flowMenuPrincipal
            };

            await delay(500);
            await gotoFlow(opciones[opcionIngresada]);
        });

const flowAlojamientos = addKeyword([regexCantPersonas], { regex: true })
    .addAnswer('¡Perfecto! Para esa cantidad de personas, tenemos disponibles los siguientes alojamientos.')
    .addAction(async (ctx, { flowDynamic }) => {

        for (let dataAlojamientos of arrayAlojamientos) {
            await flowDynamic({ body: `*${contAlojamientos + 1})* ${dataAlojamientos.attributes.denominacion}`, media: `${dataAlojamientos.attributes.imagen}` });
            await flowDynamic({ body: `${dataAlojamientos.attributes.descripcion}` });
            contAlojamientos += 1;
        };
    })
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
        await delay(500);
        await flowDynamic('Puedes encontrar más información ingresando al *link* que aparece en la descripción de cada alojamiento.');
        await gotoFlow(flowVolverMenuPrincipal_3);
    });

const flowListarAlojamientos_3 = addKeyword('flowListarAlojamientos_3')
    .addAnswer('¡Perfecto! Primero veamos el alojamiento que deseas. Decime, ¿Para cuantas personas necesitas?')
    .addAnswer(['*1)* Una', '*2)* Dos', '*3)* Tres', '*4)* Cuatro', '*5)* Cinco', '*6)* Seis'])
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true },
        async (ctx, { fallBack }) => {
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

            } catch (error) {
                await delay(500);
                await fallBack();
                return;
            }

        }, [flowAlojamientos]);


module.exports = { flowListarAlojamientos_3, flowVolverMenuPrincipal_3 };