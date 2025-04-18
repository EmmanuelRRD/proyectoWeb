const Modelo = require("../modelo/Modelo");
const Modelador = require("../modelo/Modelador");
const Usuario = require("../modelo/usuario");

class DAO {
    static conexion = require("../ConexionBD/ConexionBD");
    constructor(){}
    /**
     * 
     * @param {Modelo} modelo 
     */
    static agregar(modelo){
        let sql = "INSERT INTO " + modelo.constructor.name + " VALUES(";
        sql += modelo.getDatosSQL().toString()+")";

        DAO.conexion.ejecutar(sql);
    }
    /**
     * 
     * @param {Usuario} modelo 
     */
    static agregarUsuario(modelo, callback=()=>{}){
        let sql = `CREATE USER IF NOT EXISTS '${modelo.Nombre}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${modelo.Pass}'`;
        if(modelo.Lectura) sql += `; GRANT SELECT ON PhotoCalendar.* TO '${modelo.Nombre}'@'localhost'`;
        if(modelo.Escritura) sql+= `; GRANT INSERT, UPDATE, DELETE ON PhotoCalendar.* TO '${modelo.Nombre}'@'localhost'`;
        if(modelo.Es_Admin) sql += `; GRANT ALL PRIVILEGES ON PhotoCalendar.* TO '${modelo.Nombre}'@'localhost' WITH GRANT OPTION`;
        sql += "; FLUSH PRIVILEGES";
        DAO.conexion.ejecutar(sql, callback);
    }
}

module.exports = DAO;