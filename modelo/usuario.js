const Modelo = require('../modelo/Modelo');

class Usuario extends Modelo{
    constructor(nombre, contrasenia){
        super();
        this.Nombre = nombre;
        this.Pass = contrasenia;
        this.Lectura = false;
        this.Escritura = false;
        this.Es_Admin = false;
    }
    static tiposSQL(){
        return ["VARCHAR", "VARCHAR", "BOOLEAN", "BOOLEAN", "BOOLEAN"];
    }
    static tipos(){
        return ["string", "string", "boolean", "boolean", "boolean"];
    }
    static longitudes(){
        return ["32", "32", "-1", "-1", "-1"];
    }
    static noNulos(){
        return [true, true, true, true, true];
    }
    static primarias(){
        return [true, false, false, false, false]
    };
    static foraneas(){
        return [null, null, null, null, null];
    }
}
module.exports = Usuario;