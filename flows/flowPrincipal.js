const { addKeyword } = require('@bot-whatsapp/bot');

const flowPrincipal = addKeyword('bot')
    .addAnswer(['¡Hola soy Delta! y seré tu asistente.', 'Cuentame, ¿En que puedo ayudarte?, te muestro algunas opciones.'],
        {
            buttons:
                [
                    { body: 'Reservar' },
                    { body: 'Precios' },
                    { body: 'Más Información' }
                ]
        }
    );
// const flowPrincipal = addKeyword(['bot'])
//     .addAnswer(['¡Hola soy Delta! y seré tu asistente.', 'Cuentame, ¿En que puedo ayudarte?, te muestro algunas opciones.'])
//     .addAnswer(['*a)* Reservar', '*b)* Precios', '*c)* Más información'])
//     .addAnswer(['Elige una de la opciones para continuar.']);


module.exports = flowPrincipal;