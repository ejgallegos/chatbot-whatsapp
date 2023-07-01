const { addKeyword, addChild } = require('@bot-whatsapp/bot');
const { registrarReserva } = require('../api/servicesReservas');

/**
 * Servicios API Strapi
 */
const { getCliente, registerCliente, updateCliente } = require('../api/servicesClientes');
const { getAlojamientos } = require('../api/servicesAlojamientos');


const moment = require("moment");
moment.locale('es');

const { validationMenu, validationCapacidad, validationOpciones } = require('../validatios/validationMenu');
const { validationFechaReserva, validationCantidadDias, validationFechaInvalida } = require('../validatios/validationFecha');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
 * REGEX
 */
let regexOpciones;

const regexFecha = "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$";
const regexCantNoches = "^[1-9]$";
const regexCantPersonas = "^[1-6]$";

/**
 * FECHAS
 */
const anioActual = moment().format('YYYY');
let fechaReserva = moment().format('YYYY-MM-DD');

const flowInfoReserva = addKeyword('')
    .addAnswer(['¡Perfecto! Por último, te muestro la información completa de la previa reserva.'], null, (ctx, { flowDynamic }) => {

        return flowDynamic(`🗓 *RESERVA* \n\n🏨 ${denominacionAlojamiento} \n👤 ${nombreApellido} \n📌 *Check-in:* ${fechaInicio} \n📌 *Check-out:* ${fechaFinal}`)

    })
    .addAnswer(['*1)* Sí', '*2)* No'])
    .addAnswer(['¿Desea confirmar la reserva?'], { capture: true },
        async (ctx, { endFlow, flowDynamic, fallBack }) => {
            const telefono = ctx.from;
            const opcionIngresada = ctx.body.toLowerCase();
            if (!validationOpciones(2, opcionIngresada)) {
                await delay(500);
                await fallBack('Ingresá una opción válida.');
                return;
            };

            try {

                registrarReserva(fechaReserva, idAlojamiento, fechaInicio, fechaFinal, idCliente, telefono);
                if (opcionIngresada === '1') {
                    await flowDynamic('En pocos minutos se contactará un Agente para confirmar tu Reserva.');
                    await endFlow('¡Gracias por la confirmación!')
                    return;
                };
                await endFlow('¡Gracias por la comunicación, estoy atento para una nueva conversación!');
                return;

            } catch (error) {
                await delay(500);
                await flowDynamic(error.message);
                await fallBack('Disculpa por el inconveniente, dime ¿Desea confirmar la reserva?');
                return;
            }
        });

const flowNombreApellido = addKeyword([regexCantNoches], { regex: true })
    .addAnswer(['¡Perfecto! Ahora, dime tu Nombre y Apellido.'],
        { capture: true },
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
                await delay(500);
                await flowDynamic(error.message);
                await fallBack('Disculpa por el inconveniente, dime nuevamente tu Nombre y Apellido.');
                return;
            }

        }, [flowInfoReserva]);

const flowFechaFinalReserva = addKeyword(['flowFechaFinalReserva'])
    .addAnswer(['¡Bien! Ahora, ingresá la *cantidad de noche/s* que te alojarás.', 'Ingresá la cantidad representada en un *número*; ej. 3'], { capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            const cantDias = parseInt(ctx.body);
            console.log({ cantDias });
            if (!validationCantidadDias(cantDias)) {
                await delay(500);
                await fallBack('Ingresá la cantidad de noches.');
                return;
            };
            fechaFinal = moment(fechaInicio).add(cantDias, 'days').format('YYYY-MM-DD');
            console.log({ fechaFinal });
        }, [flowNombreApellido]);

const flowFechaInicioReserva = addKeyword(['flowFechaInicioReserva'])
    .addAnswer(['¡Perfecto! Continuemos, decime la fecha de *ingreso*.'])
    .addAnswer(['Sólo necesito el día y el mes DD-MM.', 'Por favor hazlo con éste formato. Ej. 31-12'], { capture: true },
        async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
            const fInicio = ctx.body;
            const dia = fInicio.substring(0, 2);
            const mes = fInicio.substring(3, 5);
            fechaInicio = moment(`${anioActual}-${mes}-${dia}`).format('YYYY-MM-DD');

            if (validationFechaInvalida(fechaInicio)) {
                await delay(500);
                await fallBack('Ingresá una fecha correcta.');
                return;
            };

            if (!validationFechaReserva(fInicio)) {
                await delay(500);
                await fallBack('Ingresá una fecha con el formato correcto.');
                return;
            };

            gotoFlow(flowFechaFinalReserva);
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
    .addAnswer(['Elige alguna de las opciones que te mostré.'], { capture: true },
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
            gotoFlow(flowFechaInicioReserva);
        });

const flowReservar = addKeyword('1')
    .addAnswer('¡Perfecto! Voy a gestionar tu reserva. Cuentame, ¿Para cuantas personas necesitas?')
    .addAnswer(['*1)* Una', '*2)* Dos', '*3)* Tres', '*4)* Cuatro', '*5)* Cinco', '*6)* Seis'])
    .addAnswer(['Elige una de la opciones para continuar.'], { capture: true },
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


module.exports = { flowReservar, flowAlojamientos, flowFechaInicioReserva, flowFechaFinalReserva };