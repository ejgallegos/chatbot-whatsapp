const { addKeyword } = require('@bot-whatsapp/bot');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = addKeyword(['chau', 'cierrechat'])
    .addAnswer('¡Gracias por la comunicación, estoy atento para una nueva conversación!', { delay: 1000 },
        async (ctx, { flowDynamic, endFlow }) => {
            await delay(1000);
            await flowDynamic('👋 ¡Hasta luego!');
            return endFlow();
        }
    );