require("dotenv").config();
const { createBot, createProvider, createFlow, addKeyword, addChild, EVENTS } = require('@bot-whatsapp/bot');

const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Respuestas constantes
 */
const { MSJ_OPCIONES, MSJ_ERROR } = require('./helpers/constantsResponse');
const { MENU } = require('./helpers/constantsMenu');

/**
 * Validaciones
 */
const { validationOpciones } = require('./validatios/validationMenu');

/**
 * Api Strapi
 */
const { getListClientes, getCliente, registerCliente } = require('./api/servicesClientes');

/**Flows
 * 
 */
const {
    flowReservar,
    flowFechaInicioReserva,
    flowFechaFinalReserva,
    flowFechaNoDisponible,
    flowMesFechasDisponibles
} = require("./flows/flowReservar");
const {
    flowCerrarConversacion
} = require("./flows/flowCerrarConversacion");
const {
    flowFechaDisponible,
    flowVerFechaDisponible,
    flowVerFechaNoDisponible,
    flowMenuFechaDisponible
} = require("./flows/flowFechaDisponible");
const {
    flowListarAlojamientos,
    flowVolverMenuPrincipal,
    flowFiltroAlojamientos,
    flowMenuAlojamientos
} = require("./flows/flowAlojamientos");


const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAnswer(['👋 ¡Hola! soy 🤖 Delta y seré tu asistente.'], null,
        async (ctx, { flowDynamic }) => {
            const nameTel = ctx.pushName;
            await flowDynamic(`Cuentame *${nameTel}*, ¿En que puedo ayudarte?, te muestro algunas opciones.`)
        })
    .addAnswer([MENU["menu-principal"]])
    .addAnswer([MSJ_OPCIONES["elegir-opcion"]],
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow, fallBack, endFlow }) => {
            const tel = ctx.from;

            try {
                const listClientes = await getListClientes();

                if (listClientes.length > 0) {
                    const cliente = await getCliente(tel);

                    if (cliente.length === 0) {
                        await registerCliente(tel);
                    };
                };

                if (listClientes.length === 0) {
                    await registerCliente(tel);
                };


                const respuestaOpcion = ctx.body.toLowerCase();
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

            } catch (error) {
                await delay(500);
                await flowDynamic(error.message);
                await endFlow(MSJ_ERROR["error-intenta-nuevamente"]);
                return;
            };

        }
    );

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow(
        [
            flowPrincipal,
            flowReservar,
            flowFechaInicioReserva,
            flowFechaFinalReserva,
            flowFechaNoDisponible,
            flowMesFechasDisponibles,
            flowFechaDisponible,
            flowVerFechaDisponible,
            flowVerFechaNoDisponible,
            flowMenuFechaDisponible,
            flowCerrarConversacion,
            flowListarAlojamientos,
            flowVolverMenuPrincipal,
            flowFiltroAlojamientos,
            flowMenuAlojamientos
        ])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
