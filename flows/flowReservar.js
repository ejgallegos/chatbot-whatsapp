const { addKeyword, addChild } = require('@bot-whatsapp/bot');

const moment = require("moment");
moment.locale('es');

/**
 * Servicios API Strapi
*/
const { verificaFechaReserva, registrarReserva, verificaFechasDisponibles } = require('../api/servicesReservas');
const { getCliente, registerCliente, updateCliente } = require('../api/servicesClientes');
const { getAlojamientos } = require('../api/servicesAlojamientos');

/**
 * Respuestas constantes
 */
const { MSJ_OPCIONES, MSJ_FECHAS, MSJ_CONFIRMACION, MSJ_CIERRE_FLUJO, MSJ_ERROR } = require('./../helpers/constantsResponse');
const { MENU } = require('./../helpers/constantsMenu');

/**
 * Validaciones
 */
const { validationCapacidad, validationOpciones } = require('../validatios/validationMenu');
const { validationFechaReserva, validationCantidadDias, validationFechaInvalida, validationFechaMenor } = require('../validatios/validationFecha');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * REGEX
*/
const regexFecha = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$/;
const regexCantNoches = /^[1-9]$/;
const regexCantPersonas = /^[1-6]$/;

/**
 * FECHAS
*/
const anioActual = moment().format('YYYY');
let fechaReserva = moment().format('YYYY-MM-DD');

/**
 * Variables
 */
let idCliente;
let idAlojamiento;
let denominacionAlojamiento;
let cantPersonas;
let fechaInicio;
let fechaFinal;
let nombreApellido;
let arrayAlojamientos;
let contAlojamientos = 0;

/**
 * FLUJOS
 */
const flowInfoReserva = addKeyword('')
    .addAnswer(['¡Perfecto! Por último, te muestro la información completa de la previa reserva.'], { delay: 1000 },
        async (ctx, { flowDynamic }) => {

            await delay(1000);
            return flowDynamic(`🗓 *RESERVA* \n\n🏨 ${denominacionAlojamiento} \n👤 ${nombreApellido} \n📌 *Check-in:* ${fechaInicio} \n📌 *Check-out:* ${fechaFinal}`)

        })
    .addAnswer(['*1)* Sí', '*2)* No'], { delay: 1000 })
    .addAnswer(['¿Desea confirmar la reserva?'], { capture: true, delay: 1000 },
        async (ctx, { endFlow, flowDynamic, fallBack }) => {
            const telefono = ctx.from;
            const opcionIngresada = ctx.body.toLowerCase();
            if (!validationOpciones(2, opcionIngresada)) {
                await delay(1000);
                await fallBack(MSJ_OPCIONES['opcion-invalida']);
                return;
            };

            try {

                if (opcionIngresada === '1') {
                    registrarReserva(fechaReserva, idAlojamiento, fechaInicio, fechaFinal, idCliente, telefono);
                    await delay(1000);
                    await flowDynamic(MSJ_CONFIRMACION['confirmacion-previa']);
                    await delay(1000);
                    await endFlow(MSJ_CONFIRMACION['confirmacion-ok'])
                    return;
                };
                await endFlow(MSJ_CIERRE_FLUJO['cierre-despedida']);
                return;

            } catch (error) {
                await delay(1000);
                await flowDynamic(error.message);
                await fallBack(`${MSJ_ERROR['error-servicio']} Decime ¿Deseas confirmar la reserva?`);
                return;
            }
        });

const flowNombreApellido = addKeyword([regexCantNoches], { regex: true })
    .addAnswer(['¡Perfecto! Ahora, decime tu Nombre y Apellido.'],
        { capture: true, delay: 1000 },
        async (ctx, { flowDynamic, fallBack }) => {
            const tel = ctx.from;
            const nomApe = ctx.body.toUpperCase();

            try {

                const cliente = await getCliente(tel);
                idCliente = cliente[0]?.id;
                console.log({ cliente });

                if (cliente.length === 0) {
                    await registerCliente(tel);
                };

                if (cliente.length > 0) {
                    await updateCliente(idCliente, tel, nomApe)
                };


                nombreApellido = nomApe;
                console.log({ nombreApellido });
                //return gotoFlow(flowInfoReserva);

            } catch (error) {
                await delay(1000);
                await flowDynamic(error.message);
                await fallBack(`${MSJ_ERROR['error-servicio']} Decime nuevamente tu Nombre y Apellido.`);
                return;
            }

        }, [flowInfoReserva]);

const flowMesFechasDisponibles = addKeyword(['flowMesFechasDisponibles'])
    .addAnswer(['Bien, ahora ingresá el número del mes que quieres saber la disponibilidad; ejemplo *08*'], { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            const mesIngresado = ctx.body;
            let fechasMesDisponibles = '';
            fechasMesDisponibles = await verificaFechasDisponibles(mesIngresado, idAlojamiento);
            const { nombreMes, diasDelMes } = fechasMesDisponibles;
            await delay(1000);
            await flowDynamic(`${nombreMes}`);
            await delay(1000);
            await flowDynamic(`${diasDelMes}`);
            await delay(1000);
            await gotoFlow(flowFechaNoDisponible);
        });

const flowFechaNoDisponible = addKeyword(['flowFechaNoDisponible'])
    .addAnswer(['*1)* Ingresar nueva fecha', '*2)* Seleccionar otro alojamiento', '*3)* Ver fecha disponible'], { delay: 1000 })
    .addAnswer([MSJ_OPCIONES['elegir-opcion']], { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            const opcionIngresada = parseInt(ctx.body);

            if (!validationOpciones(3, opcionIngresada)) {
                await delay(1000);
                await fallBack(MSJ_OPCIONES['opcion-invalida']);
                return;
            };

            const opciones = {
                1: flowFechaInicioReserva,
                2: flowReservar,
                3: flowMesFechasDisponibles,
            };

            await delay(1000);
            await gotoFlow(opciones[opcionIngresada]);
        });

const flowFechaFinalReserva = addKeyword(['flowFechaFinalReserva'])
    .addAnswer(['¡Bien! Ahora, ingresá la *cantidad de noche/s* que te alojarás.', 'La cantidad debe ser representada por un *número*; ejemplo *3*.'], { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            const cantDias = parseInt(ctx.body);
            console.log({ cantDias });

            if (!validationCantidadDias(cantDias)) {
                await delay(1000);
                await fallBack(MSJ_OPCIONES['opcion-cantidad-noches']);
                return;
            };

            fechaFinal = moment(fechaInicio).add(cantDias, 'days').format('YYYY-MM-DD');

            const fechaDisponible = await verificaFechaReserva(fechaInicio, fechaFinal, idAlojamiento);
            console.log(fechaDisponible.length);

            if (!fechaDisponible.length == 0) {
                console.log({ fechaFinal }, { fechaDisponible });
                await delay(1000);
                await flowDynamic(MSJ_FECHAS['fecha-no-disponible']);
                await delay(1000);
                await gotoFlow(flowFechaNoDisponible);
            };

        }, [flowNombreApellido]);

const flowFechaInicioReserva = addKeyword(['flowFechaInicioReserva'])
    .addAnswer(['¡Perfecto! Continuemos, decime la fecha de *ingreso*.'], { delay: 1000 })
    .addAnswer(['Sólo necesito el día y el mes *DD-MM*.', 'Por favor hazlo con éste formato; ejemplo *31-12*'], { capture: true, delay: 1000 },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            const fInicio = ctx.body;
            const dia = fInicio.substring(0, 2);
            const mes = fInicio.substring(3, 5);
            fechaInicio = moment(`${anioActual}-${mes}-${dia}`).format('YYYY-MM-DD');

            if (validationFechaInvalida(fechaInicio)) {
                await delay(1000);
                await fallBack(MSJ_FECHAS['fecha-incorrecta']);
                return;
            };

            if (validationFechaMenor(fechaInicio)) {
                await delay(1000);
                await fallBack(MSJ_FECHAS['fecha-posterior']);
                return;
            };

            if (!validationFechaReserva(fInicio)) {
                await delay(1000);
                await fallBack(MSJ_FECHAS['fecha-formato-incorrecto']);
                return;
            };

            await delay(1000);
            gotoFlow(flowFechaFinalReserva);
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
            const optionAlojamiento = ctx.body;

            if (!validationOpciones(contAlojamientos, optionAlojamiento)) {
                await delay(1000);
                return fallBack();
            };

            idAlojamiento = parseInt(arrayAlojamientos[parseInt(optionAlojamiento) - 1].id);
            denominacionAlojamiento = arrayAlojamientos[parseInt(optionAlojamiento) - 1].attributes.denominacion;
            contAlojamientos = 0;
            console.log({ idAlojamiento });
            await delay(1000);
            gotoFlow(flowFechaInicioReserva);
        });

const flowReservar = addKeyword(['flowReservar'])
    .addAnswer('¡Perfecto! Voy a gestionar tu reserva. Decime, ¿Para cuantas personas necesitas?', { delay: 1000 })
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


module.exports = { flowReservar, flowAlojamientos, flowFechaInicioReserva, flowFechaFinalReserva, flowFechaNoDisponible, flowMesFechasDisponibles };