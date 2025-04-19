import { Modelador } from "./Modelador.mjs";
import { Modelo } from "./Modelo.mjs";

export class Evento extends Modelo {
    constructor(id, fecha_inicio, empleado, nombre_cliente, apellido_cliente, nombre_modelo, paquete_fotografico, tipo_evento, fecha_fin){
        super();
        this.Id = id;
        this.Fecha_Inicio = fecha_inicio;
        this.Nombre_Empleado = empleado;
        this.Nombre_Cliente = nombre_cliente;
        this.Apellido_Cliente = apellido_cliente;
        this.Nombre_Modelo = nombre_modelo;
        this.Paquete_Fotografico = paquete_fotografico;
        this.Tipo_Evento = tipo_evento;
        this.Fecha_Fin = fecha_fin;
    }
    static tiposSQL(){
        return ["INT", "DATE", "VARCHAR", "VARCHAR", "VARCHAR", "SMALLINT", "SMALLINT", "SMALLINT", "DATE"];
    }
    static tipos(){
        return ["number", "string", "string", "string", "string", "number", "number", "number", "string"];
    }
    static longitudes(){
        return [-1, -1, 32, 32, 32, -1, -1, -1, -1];
    }
    static noNulos(){
        return [true, true, true, true, true, true, true, true, true];
    }
    static primarias(){
        return [true, false, false, false, false, false, false, false, false];
    }
    static foraneas(){
        return [true, false, true, false, false, false, false, false, false];
    }
}
Modelador.registrarModelo(Evento);