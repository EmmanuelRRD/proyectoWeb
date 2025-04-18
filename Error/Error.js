class Error {
    static NO_USER = 1;
    static BAD_PASSWORD = 2;
    static fromSQL(errno){
        switch(errno){
            case 1045: return "Acceso denegado, verifique usuario y contraseña";
        }
    }
}
module.exports.getError = function(){return Error};