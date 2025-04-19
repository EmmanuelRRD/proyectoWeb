const Usuario = require("../modelo/usuario");

class Protocol {
    static LOGIN = 0;
    static LOGIN_SUCCESS = 0;
    static LOGIN_FAILURE = 1;

    /**
     * 
     * @param {Usuario} modelo 
     * @param {number} estado 
     * @returns {string};
     */
    static paqueteLogin(modelo, estado){
        return JSON.stringify({ data:[this.LOGIN, estado, ...modelo?.getDatos()] });
    }

    ///METODOS DE COMUNICACION CON EL SERVER
}

module.exports = Protocol;