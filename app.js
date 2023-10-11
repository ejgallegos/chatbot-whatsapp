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
} = require("./flows/flowFechaDisponible");
const {
    flowListarAlojamientos,
    flowVolverMenuPrincipal,
    flowFiltroAlojamientos
} = require("./flows/flowAlojamientos");

const flowMenuPrincipal = addKeyword(['MENU', 'menu', 'MENÚ', 'menú', 'Menú', 'Menu'])
    .addAnswer('¿En que puedo ayudarte?, te muestro las principales opciones.', { delay: 1000 })
    .addAnswer([MENU['menu-principal']], { delay: 1000 })
    .addAnswer([MSJ_OPCIONES["elegir-opcion"]], { capture: true, delay: 1000 },
        async (ctx, { gotoFlow, fallBack }) => {
            const respuestaOpcion = ctx.body.toLowerCase();
            if (!validationOpciones(4, respuestaOpcion)) {
                await delay(1000);
                await fallBack();
                return;
            };

            const opciones = {
                1: flowReservar,
                2: flowFechaDisponible,
                3: flowListarAlojamientos,
                4: flowCerrarConversacion,
            };

            await delay(1000);
            await gotoFlow(opciones[respuestaOpcion]);
        });


const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAnswer(['👋 ¡Hola! soy 🤖 Delta y seré tu asistente.'], { dalay: 1000 },
        async (ctx, { flowDynamic }) => {
            const nameTel = ctx.pushName;
            await delay(1000);
            await flowDynamic(`Cuentame *${nameTel}*, ¿En que puedo ayudarte?, te muestro algunas opciones.`)
        })
    .addAnswer([MENU["menu-principal"]], { dalay: 1000 })
    .addAnswer([MSJ_OPCIONES["elegir-opcion"]],
        { capture: true, delay: 1000 },
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
                    await delay(1000);
                    await fallBack(MSJ_OPCIONES['opcion-invalida']);
                    return;
                };

                const opciones = {
                    1: flowReservar,
                    2: flowFechaDisponible,
                    3: flowListarAlojamientos,
                    4: flowCerrarConversacion,
                };

                await delay(1000);
                await gotoFlow(opciones[respuestaOpcion]);

            } catch (error) {
                await delay(1000);
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
            flowMenuPrincipal,
            flowReservar,
            flowFechaInicioReserva,
            flowFechaFinalReserva,
            flowFechaNoDisponible,
            flowMesFechasDisponibles,
            flowFechaDisponible,
            flowVerFechaDisponible,
            flowVerFechaNoDisponible,
            flowCerrarConversacion,
            flowListarAlojamientos,
            flowVolverMenuPrincipal,
            flowFiltroAlojamientos,
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
