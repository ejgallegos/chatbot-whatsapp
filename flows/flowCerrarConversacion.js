const { addKeyword, addChild } = require('@bot-whatsapp/bot');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const flowCerrarConversacion = addKeyword([['chau', 'cierrechat']])
    .addAnswer(['¡Gracias por la comunicación, estoy atento para una nueva conversación!'], { delay: 1000 },
        async (ctx, { endFlow }) => {
            await delay(1000);
            await endFlow({ body: '👋 ¡Hasta luego!' });
            return;
        }
    );

module.exports = { flowCerrarConversacion };