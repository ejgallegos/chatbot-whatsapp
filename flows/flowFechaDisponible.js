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
const flowMenuFechaDisponible = addKeyword(['flowMenuFechaDisponible'])
    .addAnswer('¿En que puedo ayudarte?, te muestro algunas opciones.')
    .addAnswer([MENU['menu-principal']])
    .addAnswer([MSJ_OPCIONES["elegir-opcion"]], { capture: true },
        async (ctx, { gotoFlow, fallBack }) => {

            const respuestaOpcion = parseInt(ctx.body);
            if (!validationOpciones(4, respuestaOpcion)) {
                await delay(500);
                await fallBack();
                return;
            };

            const opciones = {
                1: flowReservar,
                2: flowFechaDisponible,
                3: flowListarAlojamientos,
                4: flowCerrarConversacion,
            };

            await delay(500);
            await gotoFlow(opciones[respuestaOpcion]);
        });

const flowVerFechaDisponible = addKeyword(['flowVerFechaDisponible'])
    .addAnswer(['Bien, ahora ingresá el número del mes que quieres saber la disponibilidad; ejemplo *08*'], { capture: true },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            const mesIngresado = ctx.body;
            let fechasMesDisponibles = '';
            fechasMesDisponibles = await verificaFechasDisponibles(mesIngresado, idAlojamiento);
            const { nombreMes, diasDelMes } = fechasMesDisponibles;
            await delay(500);
            await flowDynamic(`${nombreMes}`);
            await delay(500);
            await flowDynamic(`${diasDelMes}`);
            await gotoFlow(flowVerFechaNoDisponible);
        });

const flowVerFechaNoDisponible = addKeyword(['flowVerFechaNoDiponible'])
    .addAnswer(['*1)* Seleccionar otro alojamiento', '*2)* Ver fecha disponible', '*3)* Volver al menú principal'])
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            const opcionIngresada = parseInt(ctx.body);

            if (!validationOpciones(3, opcionIngresada)) {
                await delay(500);
                await fallBack(MSJ_OPCIONES['opcion-invalida']);
                return;
            };

            const opciones = {
                1: flowFechaDisponible,
                2: flowVerFechaDisponible,
                3: flowMenuFechaDisponible
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
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            const optionAlojamiento = ctx.body;

            if (!validationOpciones(contAlojamientos, optionAlojamiento)) {
                await delay(500);
                return fallBack();
            };

            idAlojamiento = parseInt(arrayAlojamientos[parseInt(optionAlojamiento) - 1].id);
            denominacionAlojamiento = arrayAlojamientos[parseInt(optionAlojamiento) - 1].attributes.denominacion;
            contAlojamientos = 0;
            console.log({ idAlojamiento });
            gotoFlow(flowVerFechaDisponible);
        });

const flowFechaDisponible = addKeyword(['flowFechaDisponible'])
    .addAnswer('¡Perfecto! Primero veamos el alojamiento que deseas. Decime, ¿Para cuantas personas necesitas?')
    .addAnswer([MENU['menu-cant-personas']])
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


module.exports = { flowFechaDisponible, flowVerFechaNoDisponible, flowVerFechaDisponible, flowMenuFechaDisponible };