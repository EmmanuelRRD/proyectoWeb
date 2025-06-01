import { Modelador } from "./Modelador.mjs";

export class Modelo {
    static tiposSQL(){};
    static tipos(){};
    static longitudes(){};
    static noNulos(){};
    static primarias(){};
    static foraneas(){};
    static labels(){};
    static componentes(){};
    static exps(){};
    static longitudes(){};
    static especiales(){};

    getDatos(){
        let o = [];
        for(const fld in this){
            o.push(this[fld]);
        }
        return o;
    };
    getDatosSQL(){
        let o = [];
        let t =  Modelador.getNombre(this.constructor.name).tipos();
        let i = 0;
        for(const fld in this){
            let p = this[fld];
            if(p == null) o.push("NULL");
            else if(t[i] == "string" || t[i] == "date") o.push("'"+p+"'");
            else o.push(p);
            
            
            i++;
        }
        return o;
    };
}