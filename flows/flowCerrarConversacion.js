const { addKeyword, addChild } = require('@bot-whatsapp/bot');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const flowCerrarConversacion = addKeyword([['chau', 'cierrechat']])
    .addAnswer(['¡Gracias por la comunicación, estoy atento para una nueva conversación!'])
    .addAction(
        async (ctx, { endFlow }) => {
            const respuestaOpcion = ctx.body.toLowerCase();
            await delay(500);
            await endFlow();
            return;
        }
    );

module.exports = { flowCerrarConversacion };