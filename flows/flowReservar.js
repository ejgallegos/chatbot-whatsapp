const { addKeyword } = require('@bot-whatsapp/bot');

const flowReservar = addKeyword(['Reservar'])
    .addAnswer('¡Perfecto! Voy a gestionar tu reserva. Cuentame, ¿Para cuantas personas necesitas?',
        {
            buttons: [{ body: 'Una' }, { body: 'Dos' }, { body: 'Tres' }, { body: 'Cuatro' }, { body: 'Más' }],
        },
    );


module.exports = flowReservar;