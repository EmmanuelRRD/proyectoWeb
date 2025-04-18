const async = require("async");
/**
 * Clase para forzar la ejecucion en secuencia de funciones que no son sincronas, instanciar
 */
class Encadenador {
    lista = [];
    /**
     * limpia la lista de ejecucion
     * @returns {Encadenador}
     */
    wipe(){
        this.lista = [];
        return this
    };
    /**
     * Agrega una funcion a la lista de ejecucion, otorga un callback para disparar la siguiente ejecucion
     * @param {import("async").AsyncFunction<any, Error[]>} fn 
     * @returns {Encadenador}
     */
    then(fn=(callback=()=>{})=>{callback()}){
        this.lista.push(fn);
        return this;
    };
    /**
     * Ejecuta la lista de funciones, devuelve la promesa de cuando termine la ejecucion
     * @returns {Promise<any[]>}
     */
    run(){
        return async.series(this.lista);
    }
}
module.exports = Encadenador;