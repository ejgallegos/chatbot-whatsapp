const { addKeyword } = require('@bot-whatsapp/bot');
const { derivarClienteAgente  } = require('../../api/servicesClientes');
const  flowMenu = require('../../flows/flowMenu');

module.exports = addKeyword(['onBot', 'on', 'onbot', 'boton', 'botOn', 'ONBOT'])
    .addAction(async (ctx, { state, gotoFlow }) => {
        
        await state.update({ agente: 'Off' });
        const idCliente = state.get('id');
        await derivarClienteAgente(idCliente, false);
        console.log('Cliente derivado al Bot');
        await gotoFlow(flowMenu);

     
    });