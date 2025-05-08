import { Modelador } from "./Modelador.mjs";
import { Modelo } from "./Modelo.mjs";

export class Articulo_Inventario extends Modelo {
    constructor(codigo, nombre, existencias){
        super();
        this.Id = codigo;   
        this.Nombre = nombre;
        this.Existencias = existencias;
    }
    static tipos(){
        return ["string", "string", "number"];
    }
    static tiposSQL(){
        return["VARCHAR", "VARCHAR", "INT"];
    }
    static longitudes(){
        return [10, 20, -1];
    }
    static noNulos(){
        return[true, true, true];
    }
    static primarias(){
        return[0];
    }
    static foraneas(){
        return[];
    }
    static labels(){
        return ["Código", "Nombre", "Existencias"];
    }
    static componentes(){
        return ["text", "text", "text"];
    }
    static exps(){
        return[];
    }
    static especiales(){
        return[
            [""], [""], [""]
        ]
    }

}
Modelador.registrarModelo(Articulo_Inventario); 