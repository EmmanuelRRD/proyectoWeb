const Usuario = require("../modelo/usuario");

class Protocol {
    static LOGIN = 0;
    static LOGOUT = 1;

    static LOGIN_SUCCESS = 0;
    static LOGIN_FAILURE = 1;

    static LOGOUT_SUCCESS = 0;
    static LOGOUT_FAILURE = 1;

    static QUERY = 2;
    static QUERY_SUCCESS = 0;
    static QUERY_FAILURE = 1;
    static QUERY_BLOCK = 2;

    static LOGBACK = 3;
    /**
     * 
     * @param {Usuario} modelo 
     * @param {number} estado 
     * @returns {string};
     */
    static paqueteLogin(modelo, estado){
        let d = [null, null, false, false, false];
        if(modelo != null){
            d = modelo.getDatos();
        }
        return JSON.stringify({ data:[this.LOGIN, estado, ...d] });
    }
    static paqueteLogout(estado){
        return JSON.stringify({data:[estado]});
    }
    static paqueteLogback(){
        return JSON.stringify({data:[this.LOGBACK]});
    }
    static paqueteQuery(estado, result){
        let obj = {
            data:[this.QUERY, estado, result]
        }
        return JSON.stringify(obj);
    }
    static handleConsulta(){}
}

module.exports = Protocol;