const Modelo = require('../modelo/Modelo');
const Usuario = require("../modelo/usuario");
/**
 * Clase para manejo de modelos
 */
class Modelador {
    /**
     * @type {Map<string, Modelo>}
     */
    static modelos = new Map()
    .set(Usuario.name, Usuario);
    /**
     * 
     * @param {typeof Modelo} modelo 
     */
    static getCreateOf(modelo){
        let tipos = modelo.tiposSQL();
        let longitudes = modelo.longitudes();
        let noNulos = modelo.noNulos();
        let primarias = modelo.primarias();
        let foraneas = modelo.foraneas();

        let unicaPrimaria = primarias.length == 1;

        let i = 0;
        const sql = `CREATE TABLE IF NOT EXISTS ${modelo.name} {`;
        for(const fld of Object.getOwnPropertyNames(new Modelo)){
            
            //abreviaciones
            let long = `(${longitudes[i]})`;
            let prim = unicaPrimaria && primarias[i];
            
            //formato para crear cada columna del modelo
            let column = `${fld} (
                            ${tipos[i] + (longitudes[i] > -1 ? long : "")} ${noNulos[i] ? "NOT NULL" : ""} ${prim ? "PRIMARY KEY" : ""}
                            )
                            ${i < tipos.length-1 ? ", " : "}"}`;
            sql += column;

            i++;
        }

        //multiples primarias
        if(primarias > 1){
            const prims = "PRIMARY KEY("
            let i = 0;
            for(; i < primarias.length-1; i++){
                prims += `${primarias[i]}, `;
            }
            prims += `${primarias[i]})`;

            sql += prims;
        }
    }
    /**
     * 
     * @param {Modelo} modelo 
     * @returns {typeof Modelo}
     */
    static getClase(modelo){
        return this.modelos.get(modelo.constructor.name);
    }
    /**
     * 
     * @param {string} nombre 
     * @returns {typeof Modelo}
     */
    static getNombre(nombre){
        return this.modelos.get(nombre);
    }
}

module.exports = Modelador;