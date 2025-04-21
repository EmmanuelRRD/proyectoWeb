/**
 * Clase para revisar el formato de datos de formularios y obtener su respectivo valor
 */
export class Analizador {
    static INCORRECT_FORMAT = -1;
    
    static esBool(exp){
        return (exp == "true" || exp == "false");
    }
    static revisarBool(exp){
        if(this.esBool(exp)){
            return exp == "true";
        }else throw new Error("Formato incorrecto", {code:this.INCORRECT_FORMAT});
    }
}