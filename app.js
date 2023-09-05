require("dotenv").config();
const { createBot, createProvider, createFlow, addKeyword, addChild, EVENTS } = require('@bot-whatsapp/bot');

const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Respuestas constantes
 */
const { MSJ_OPCIONES } = require('./helpers/constantsResponse');

/**
 * Validaciones
 */
const { validationMenu, validationOpciones } = require('./validatios/validationMenu');

/**
 * Api Strapi
 */
const { getListClientes, getCliente, registerCliente } = require('./api/servicesClientes');

/**Flows
 * 
 */
const { flowReservar,
    flowAlojamientos,
    flowFechaInicioReserva,
    flowFechaFinalReserva,
    flowFechaNoDisponible,
    flowMesFechasDisponibles } = require("./flows/flowReservar");
const { flowCerrarConversacion } = require("./flows/flowCerrarConversacion");
const flowPrecios = require("./flows/flowPrecios");


const flowPrincipal = addKeyword(['hola', 'buenas', 'que tal', 'oli'])
    .addAnswer(['👋 ¡Hola! soy Delta y seré tu asistente.'], null,
        async (ctx, { flowDynamic }) => {
            const nameTel = ctx.pushName;
            // console.log(ctx);
            await flowDynamic(`Cuentame *${nameTel}*, ¿En que puedo ayudarte?, te muestro algunas opciones.`)
        })
    .addAnswer(['*1)* Reservar', '*2)* Buscar disponibilidad', '*3)* Más información', '*4)* Salir'])
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
                    2: flowMesFechasDisponibles,
                    3: flowReservar,
                    4: flowCerrarConversacion,
                };

                await delay(500);
                await gotoFlow(opciones[respuestaOpcion]);

            } catch (error) {
                await delay(500);
                await flowDynamic(error.message);
                await endFlow('Te pido disculpas, ¿Puedes intentar nuevamente? Gracias.');
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
            flowCerrarConversacion,
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
