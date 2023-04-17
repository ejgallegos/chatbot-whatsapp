const { addKeyword, addChild } = require('@bot-whatsapp/bot');

let bodyRegistroReserva = {
    cantPersonas: '',
    departamento: '',
    fechaInicio: '',
    fechaFinal: '',
    nombreApellido: '',
};
let arrayBodyRegistroReserva = [];

const flowInfoReserva = addKeyword('')
    .addAnswer(['¡Perfecto! Por último, te muestro la información completa de la previa reserva.'], null,
        (ctx) => {
            const nombreApellido = ctx.body;
            //arrayBodyRegistroReserva.push(bodyRegistroReserva);

            for (let i = 0; i < arrayBodyRegistroReserva.length; i++) {
                arrayBodyRegistroReserva[i].nombreApellido = nombreApellido;
            };
            bodyRegistroReserva = arrayBodyRegistroReserva;
            console.log(bodyRegistroReserva);
        })
    .addAnswer(['Previa Reserva para el Dpto. Del Talampaya a nombre de Eric Gallegos, día 31-01-2023 hasta el día 07-02-2023.', '¿Desea confirmar la reserva?'], {
        buttons: [{ body: 'Sí' }, { body: 'No' }]
    });

const flowNombreApellido = addKeyword('')
    .addAnswer(['¡Perfecto! Ahora, dime tu nombre y apelldio.'],
        null,
        (ctx) => {
            const fechaInicio = ctx.body;
            //arrayBodyRegistroReserva.push(bodyRegistroReserva);

            for (let i = 0; i < arrayBodyRegistroReserva.length; i++) {
                arrayBodyRegistroReserva[i].fechaInicio = fechaInicio;
            };
            bodyRegistroReserva = arrayBodyRegistroReserva;
            console.log(bodyRegistroReserva);
        }, [flowInfoReserva]);


const flowFechaReserva = addKeyword(['a', 'b'])
    .addAnswer(['¡Perfecto! Continuemos, indicame la fecha de la reserva. Por favor hazlo con éste formato. Ej. 31-01-2023'],
        { capture: true },
        (ctx) => {
            const departamento = ctx.body;
            //arrayBodyRegistroReserva.push(bodyRegistroReserva);

            for (let i = 0; i < arrayBodyRegistroReserva.length; i++) {
                arrayBodyRegistroReserva[i].departamento = departamento;
            };
            bodyRegistroReserva = arrayBodyRegistroReserva;
            console.log(bodyRegistroReserva);
        }, [flowNombreApellido]);

const flowDepartamentos = addKeyword(['a', 'b'])
    .addAnswer('¡Perfecto! Para esa cantidad de personas, tenemos disponibles las siguientes opciones.')
    .addAnswer(['*Ver más* https://deltalampaya.com/portfolio/loft-centro/', '\n*a)* Loft Centro'], { media: 'https://deltalampaya.com/wp-content/uploads/2021/12/IMG_9279-507x507.jpeg' })
    .addAnswer(['*Ver más* https://deltalampaya.com/portfolio/del-talampaya-dpto/', '\n*b)* Dpto. del Talampaya'], { media: 'https://deltalampaya.com/wp-content/uploads/2022/01/photo1641937795-7-507x507.jpeg' })
    .addAnswer(['Elige alguna de las opciones que te mostré.'], { capture: true },
        (ctx) => {
            const cantPersonas = ctx.body;
            arrayBodyRegistroReserva.push(bodyRegistroReserva);

            for (let i = 0; i < arrayBodyRegistroReserva.length; i++) {
                arrayBodyRegistroReserva[i].cantPersonas = cantPersonas;
            };
            bodyRegistroReserva = arrayBodyRegistroReserva;
            console.log(bodyRegistroReserva);
        }, [flowFechaReserva]);
// .addAction((ctx) => {
//     const cantPersonas = ctx.body;
//     arrayBodyRegistroReserva.push(bodyRegistroReserva);

//     for (let i = 0; i < arrayBodyRegistroReserva.length; i++) {
//         arrayBodyRegistroReserva[i].cantPersonas = cantPersonas;
//     };
//     bodyRegistroReserva = arrayBodyRegistroReserva;
//     console.log(bodyRegistroReserva);
// }, [flowFechaReserva]);

const flowReservar = addKeyword(['a'])
    .addAnswer('¡Perfecto! Voy a gestionar tu reserva. Cuentame, ¿Para cuantas personas necesitas?')
    .addAnswer(['*a)* Una', '*b)* Dos', '*c)* Más'])
    .addAnswer(['Elige una de la opciones para continuar.'], { capture: true }, null, [flowDepartamentos]);


module.exports = flowReservar;