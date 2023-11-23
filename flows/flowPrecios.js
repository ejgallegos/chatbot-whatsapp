const { addKeyword } = require('@bot-whatsapp/bot');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const flowPrecios = addKeyword(['2'])
    .addAnswer(['Flujo de Precios a desarrollar.'])
    .addAction(
        async (ctx, { endFlow }) => {
            //const respuestaOpcion = ctx.body.toLowerCase();
            await delay(500);
            await endFlow();
            return;
        }
    );

module.exports = flowPrecios;