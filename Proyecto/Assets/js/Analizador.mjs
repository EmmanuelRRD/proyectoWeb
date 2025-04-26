/**
 * Clase para revisar el formato de datos de formularios y obtener su respectivo valor o construir mensajes de error
 */
export class Analizador {
    
    static INCORRECT_FORMAT = -1; //formatos incorrectos
    static NOT_INT = 1;
    static NOT_FLOAT = 2;
    static NOT_DATE = 3;

    static VALUE_OUT_OF_RANGE = 4; //el valor se sale de rango
    static NULL_VALUE = 5; //el valor es nulo
    static DATE_INVALID = 6; //la fecha no es valida
    static ILLEGAL_NUMBER = 7 //el campo no admite numeros
    static ILLEGAL_CHARACTER = 8 //el campo no admite caracteres especiales ingresados
    static VALUE_ILLEGAL_LENGTH = 9 //el campo no tiene exactamente con la longitud requerida

    //lista de limites para datos numericos
    static numberLimits = new Map()
    .set("TINYINT", 127)
    .set("SMALLINT", 32767)
    .set("MEDIUMINT", 8388607)
    .set("INT", 2147483647);

    //checa si un string es bool
    static esBool(exp){
        return (exp == "true" || exp == "false");
    }
    //intenta revisar si un string es un bool valido y si es verdadero
    static revisarBool(exp){
        if(this.esBool(exp)){
            return exp == "true";
        }else throw new Error("Formato incorrecto", {code:this.INCORRECT_FORMAT});
    }
    /**
     * Revisa un string en base al tipo de dato que debe ser, longitud maxima, no nulo, etc
     * @param {string} valor valor a validar
     * @param {string} tipoDato tipo de dato SQL del valor
     * @param {RegExp | null} exp expresion regular a probar
     * @param {number} longitud longitud maxima del valor
     * @param {boolean} nonulo si el valor puede o no ser nulo
     * @param {string[][]} especiales lista de caracteres especiales permitidos en cada campo
     */
    static revisarDato(valor, tipoDato, exp, longitud, nonulo, especiales){
        if((valor.length == 0 || valor.toLowerCase() == "null") && nonulo) return this.NULL_VALUE;
        //else if(valor.length > longitud) return this.VALUE_OUT_OF_RANGE;
        switch(tipoDato){
            case "SMALLINT":
                if(isNaN(parseInt(valor))) return this.NOT_INT;
                else if (!this.probarRango(parseInt(valor), 32767, -32768)) return this.VALUE_OUT_OF_RANGE; 
                break;
            case "INT":
                if(isNaN(parseInt(valor))) return this.NOT_INT;
                break;
            case "FLOAT":
                if(isNaN(parseFloat(valor))) return this.NOT_FLOAT;
                break;
            case "DATE":
                try{ Date.parse(valor); }
                catch(e) { this.NOT_DATE; }
                break;
            case "VARCHAR":
                if(valor.length > longitud) return this.VALUE_OUT_OF_RANGE;
                break;
            case "CHAR":
                if(valor.length != longitud) return this.VALUE_ILLEGAL_LENGTH;
                break;
        }
        return 0;
    }
    /**
     * analiza el codigo de error recibido y devuelve una cadena que lo explica
     * @param {number} codigo codigo de error
     * @param {string} label etiqueta del campo para indicar en que campo ocurrio el error
     * @param {string} tipoDato tipo de dato del campo para indicar las restricciones en texto
     * @param {number} longitud longitud maxima del campo
     * @param {string[]} especiales caracteres especiales permitidos en el campo
     * @returns {string} el mensaje de error adecuado al campo
     */
    static getMensajeError(codigo, label, tipoDato, longitud, especiales){
        
        let generic = "el campo '"+label+"' ";
        switch(codigo){
            case this.NULL_VALUE:
                return generic + " no puede ser nulo";
            case this.NOT_INT:
                return generic + " debe ser numérico sin decimal";
            case this.NOT_FLOAT:
                return generic + " debe ser numérico";
            case this.NOT_DATE:
                return generic + " debe ser una fecha";
            case this.VALUE_OUT_OF_RANGE:
                if(this.numberLimits.has(tipoDato)){
                    return "el valor del campo '"+label+"' no debe ser mayor a " + this.numberLimits.get(tipoDato);
                }else{
                    return "el valor del campo '"+label+"' no debe exceder " + longitud + " caracteres";
                }
            case this.DATE_INVALID:
                return generic + " debe tener una fecha válida";
            case this.ILLEGAL_NUMBER:
                return generic + " no debe contener numeros";
            case this.ILLEGAL_CHARACTER:
                return generic + " sólo admite los siguientes caracteres especiales: \n" + this.formatearEspeciales(especiales);
            case this.VALUE_ILLEGAL_LENGTH:
                return generic + " debe contener exactamente " + longitud + " caracteres";
        }
    }
    /**
     * Procesa un string al tipo de dato especificado
     * @param {string} dato string a procesar
     * @param {string} tipoDato tipo de dato para convertirlo
     * @returns {any} el dato procesado
     */
    static procesar(dato, tipoDato){
        switch(tipoDato){
            case "TINYINT":
            case "SMALLINT":
            case "MEDIUMINT":
            case "INT":
                if(dato == null) return "NULL";
                return parseInt(dato);
            case "FLOAT":
            case "DOUBLE":
                if(dato == null) return "NULL";
                return parseFloat(dato);
            case "VARCHAR":
            case "CHAR":
            case "DATE":
                if(dato == null) return "NULL";
                return dato;
            default: return dato;
        }
    }
    /**
     * Para utilizar en mensajes de error, convierte un arreglo de caracteres especiales a un formato textual
     * ejemplo: convierte ["@", "!", "}"]
     * al texto: "@, !, o }"
     * @param {string[]} esp 
     */
    static formatearEspeciales(esp){
        let str = esp.join(", ");

        if(str.length <= 1) return str;

        //ponle una o al ultimo elemento si es mas de 1
        str = str.slice(0, str.length-3);
        str += " ó " + esp[esp.length-1]
        return str;
    }
    /**
     * indica si un numero se encuentra en el rango dado
     * @param {number} valor 
     * @param {number} max 
     * @param {number} min 
     * @returns {boolean}
     */
    static probarRango(valor, max, min){
        
        return valor >= min && valor <= max;
    }
}