require("dotenv").config();
const { createBot, createProvider, createFlow, addKeyword, addChild, EVENTS } = require('@bot-whatsapp/bot');

const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const { validationMenu } = require('./validatios/validationMenu');

const { getCliente, registerCliente } = require('./api/servicesClientes');

/**Flows
 * 
 */

const { flowReservar, flowAlojamientos, flowFechaInicioReserva, flowFechaFinalReserva } = require("./flows/flowReservar");
const flowCerrarConversacion = require("./flows/flowCerrarConversacion");
const flowPrecios = require("./flows/flowPrecios");


const flowPrincipal = addKeyword(['hola', 'buenas', 'que tal', 'oli'])
    .addAnswer(['👋 ¡Hola! soy Delta y seré tu asistente.'], null,
        async (ctx, { flowDynamic }) => {
            const nameTel = ctx.pushName;
            // console.log(ctx);
            await flowDynamic(`Cuéntame *${nameTel}*, ¿En que puedo ayudarte?, te muestro algunas opciones.`)
        })
    .addAnswer(['*1)* Reservar', '*2)* Precios', '*3)* Más información'])
    .addAnswer(['Elige una de la opciones para continuar.'],
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow, fallBack, endFlow }) => {
            const tel = ctx.from;

            try {
                const cliente = await getCliente(tel);

                if (cliente.length === 0) {
                    await registerCliente(tel);
                };

                const respuestaOpcion = ctx.body.toLowerCase();
                if (!validationMenu(respuestaOpcion)) {
                    await delay(500);
                    await fallBack();
                    return;
                };

            } catch (error) {
                await delay(500);
                await flowDynamic(error.message);
                await endFlow('Te pido disculpas, ¿Puedes intentar nuevamente? Gracias.');
                return;
            };

        }, [flowReservar]
    );

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow(
        [
            flowPrincipal,
            flowCerrarConversacion,
            flowFechaInicioReserva,
            flowFechaFinalReserva
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
