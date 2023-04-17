const { createBot, createProvider, createFlow, addKeyword, addChild } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

/**Flows
 * 
 */

// const flowPrincipal = require("./flows/flowPrincipal");
const flowReservar = require("./flows/flowReservar");
//const { flowDepartamentos, flowFechaReserva, flowNombreApellido, flowInfoReserva } = require("./flows/flowDepartamentos");

const flowPrincipal = addKeyword(['bot'])
    .addAnswer(['¡Hola soy Delta! y seré tu asistente.', 'Cuentame, ¿En que puedo ayudarte?, te muestro algunas opciones.'])
    .addAnswer(['*a)* Reservar', '*b)* Precios', '*c)* Más información'])
    .addAnswer(['Elige una de la opciones para continuar.'],
        { capture: true },
        [...addChild(flowReservar)]);

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow(
        [
            flowPrincipal,
            flowReservar,
            // flowDepartamentos,
            // flowFechaReserva,
            // flowNombreApellido,
            // flowInfoReserva
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
