/**
 * Clase para definir respuestas automatizadas a codigos de error
 */
export class ErrorHandler {
    /**
     * @type {Map<number, Function>}
     */
    static handlerMap = new Map();

    static WRONG_VALUE = 1292;
    static DUPLICATE_ENTRY = 1062;
    /**
     * Si existe, ejecuta la funcion de respuesta al codigo de error dado
     * @param {number} errno 
     */
    static handelarError(errno, ...args){
        if(!this.handlerMap.has(errno)) return null;
        return (this.handlerMap.get(errno))(args);
    }
    /**
     * asocia una funcion de respuesta al codigo de error dado
     * @param {number} err 
     * @param {Function(any)} res 
     */
    static registrarError(err, res=(...args)=>{}){
        this.handlerMap.set(err, res);
    }
}