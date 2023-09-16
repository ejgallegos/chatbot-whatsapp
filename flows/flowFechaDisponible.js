const { addKeyword, addChild } = require('@bot-whatsapp/bot');

const moment = require("moment");
moment.locale('es');

/**
 * Servicios API Strapi
*/
const { verificaFechasDisponibles } = require('../api/servicesReservas');
const { getAlojamientos } = require('../api/servicesAlojamientos');

/**
 * Respuestas constantes
 */
const { MSJ_OPCIONES } = require('./../helpers/constantsResponse');
const { MENU } = require('./../helpers/constantsMenu');

/**
 * Otros Flujos
 */
const { flowReservar } = require("./flowReservar");
const { flowListarAlojamientos } = require("./flowAlojamientos");
const { flowCerrarConversacion } = require("./flowCerrarConversacion");

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

const flowVerFechaDisponible = addKeyword(['flowVerFechaDisponible'])
    .addAnswer(['Bien, ahora ingresá el número del mes que quieres saber la disponibilidad; ejemplo *08*'], { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            const mesIngresado = ctx.body;
            let fechasMesDisponibles = '';
            fechasMesDisponibles = await verificaFechasDisponibles(mesIngresado, idAlojamiento);
            const { nombreMes, diasDelMes } = fechasMesDisponibles;

            if (nombreMes !== undefined && diasDelMes !== undefined) {

                await delay(1000);
                await flowDynamic(`${nombreMes}`);
                await delay(1000);
                await flowDynamic(`${diasDelMes}`);
                await delay(1000);
                await flowDynamic('📆 Los días reservados están marcados con una *[X]*');

            } else {

                await delay(1000);
                await flowDynamic('✅ El alojamiento que seleccionaste no registra reservas, por lo que tiene disponibilidad.');

            };

            await delay(1000);
            await gotoFlow(flowVerFechaNoDisponible);
        });

const flowVerFechaNoDisponible = addKeyword(['flowVerFechaNoDiponible'])
    .addAnswer(['¿Puedo ayudarte en algo más?'], { delay: 1000 })
    .addAnswer(['*1)* Seleccionar otro alojamiento', '*2)* Ver otras fechas disponibles'], { delay: 1000 })
    .addAnswer(['💡 Escribí *MENU* para volver al menú principal'], { delay: 1000 })
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {

            const menuArray = ['MENU', 'menu', 'MENÚ', 'menú', 'Menú', 'Menu'];
            const opcionIngresada = !menuArray.includes(ctx.body) ? parseInt(ctx.body) : ctx.body.toLowerCase();
            console.log(opcionIngresada);

            if (typeof opcionIngresada === 'number') {

                if (!validationOpciones(2, opcionIngresada)) {
                    await delay(1000);
                    await fallBack(MSJ_OPCIONES['opcion-invalida']);
                    return;
                };

                const opciones = {
                    1: flowFechaDisponible,
                    2: flowVerFechaDisponible,
                };

                await delay(1000);
                await gotoFlow(opciones[opcionIngresada]);
            };


        });

const flowAlojamientos = addKeyword([regexCantPersonas], { regex: true })
    .addAnswer('¡Perfecto! Para esa cantidad de personas, tenemos disponibles los siguientes alojamientos.', { delay: 1000 })
    .addAction(async (ctx, { flowDynamic }) => {

        for (let dataAlojamientos of arrayAlojamientos) {
            await flowDynamic({ body: `*${contAlojamientos + 1})* ${dataAlojamientos.attributes.denominacion}`, media: `${dataAlojamientos.attributes.imagen}` });
            await flowDynamic({ body: `${dataAlojamientos.attributes.descripcion}` });
            contAlojamientos += 1;
        };
    })
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow }) => {
            const optionAlojamiento = parseInt(ctx.body);

            if (!validationOpciones(contAlojamientos, optionAlojamiento)) {
                await delay(1000);
                return fallBack([MSJ_OPCIONES['opcion-invalida']]);
            };

            idAlojamiento = parseInt(arrayAlojamientos[parseInt(optionAlojamiento) - 1].id);
            denominacionAlojamiento = arrayAlojamientos[parseInt(optionAlojamiento) - 1].attributes.denominacion;
            contAlojamientos = 0;
            console.log({ idAlojamiento });
            await delay(1000);
            await gotoFlow(flowVerFechaDisponible);
        });

const flowFechaDisponible = addKeyword(['flowFechaDisponible'])
    .addAnswer('¡Perfecto! Primero veamos el alojamiento que deseas. Decime, ¿Para cuantas personas necesitas?', { delay: 1000 })
    .addAnswer([MENU['menu-cant-personas']], { delay: 1000 })
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true, delay: 1000 },
        async (ctx, { fallBack }) => {
            const cantidadPersonas = ctx.body.toLowerCase();

            if (!validationCapacidad(cantidadPersonas)) {
                await delay(1000);
                await fallBack();
                return;
            };

            try {

                arrayAlojamientos = await getAlojamientos(cantidadPersonas);
                //console.log(JSON.stringify(arrayAlojamientos));

                cantPersonas = cantidadPersonas;
                console.log({ cantPersonas });

            } catch (error) {
                await delay(1000);
                await fallBack();
                return;
            }

        }, [flowAlojamientos]);


module.exports = { flowFechaDisponible, flowVerFechaNoDisponible, flowVerFechaDisponible };