const handleHttpError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        console.log(`HTTP Error ${status}:`, data);
        // Aquí puedes realizar acciones específicas según el código de estado HTTP
        if (status === 404) {
            console.log('Recurso no encontrado.');
            // Puedes lanzar una excepción o devolver un mensaje de error personalizado
            throw new Error('Recurso no encontrado.');
        } else if (status === 500) {
            console.log('Error interno del servidor.');
            throw new Error('Error interno del servidor.');
        } else {
            console.log('Error de solicitud.');
            throw new Error('Error de solicitud.');
        }
    } else if (error.request) {
        console.log(error.request);
        console.log('No se recibió respuesta del servidor.');
        throw new Error('No se recibió respuesta del servidor.');
    } else {
        console.log('Ocurrió un error al realizar la solicitud.');
        throw new Error('Ocurrió un error al realizar la solicitud.');
    }
};

module.exports = { handleHttpError };