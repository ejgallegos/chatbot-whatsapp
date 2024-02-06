const { addKeyword } = require('@bot-whatsapp/bot');
const { derivarClienteAgente  } = require('../../api/servicesClientes');

//const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = addKeyword('Contactar Agente')
    .addAnswer('Gracias por su comunicación, le informo que se generó el trámite de derivación a un Agente.',{ delay: 1000 })
    .addAnswer('En el transcurso del día se estará comunicando.',{ delay: 1000 })
    .addAnswer('Si desea volver al Bot, escriba 👉 *ONBOT*',{ delay: 1000 })
    .addAction(async (ctx, { state }) => {
        
        await state.update({ agente: 'On' });
        const idCliente = state.get('id');
        await derivarClienteAgente(idCliente, true)
        console.log('Cliente derivado a Agente');
     
    });