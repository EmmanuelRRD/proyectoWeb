import { Modelo } from './Modelo.mjs';
import { Modelador } from './Modelador.mjs';

export class Usuario extends Modelo{
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
    getDatos(){
        return[this.Nombre, "pass", this.Lectura, this.Escritura, this.Es_Admin]
    }
}
//registrar el modelo en el manejador de modelos
Modelador.registrarModelo(Usuario);