const Modelo = require("../modelo/Modelo");
const Modelador = require("../modelo/Modelador");
const Usuario = require("../modelo/usuario");
const Encadenador = require("../Encadenador/Encadenador");

class DAO {
    static conexion = require("../ConexionBD/ConexionBD");
    constructor(){}
    /**
     * 
     * @param {Modelo} modelo 
     */
    static agregarRes(modelo, callback=(err, result, fields)=>{}){
        let sql = "INSERT INTO " + modelo.constructor.name + " VALUES(";
        sql += modelo.getDatosSQL().toString()+")";

        DAO.conexion.ejecutarRes(sql, callback);
    }
    /**
     * 
     * @param {Modelo} modelo 
     */
    static agregar(modelo, callback=()=>{}){
        let sql = "INSERT INTO " + modelo.constructor.name + " VALUES(";
        sql += modelo.getDatosSQL().toString()+")";

        DAO.conexion.ejecutar(sql, callback);
    }
    /**
     * Realiza una consulta con los parametros especificados, instancia los resultados y los ofrece en un arreglo dentro del callback
     * @param {string} tablaNombre nombre de la tabla a consultar
     * @param {string[] | null} seleccionNombres (opcional) nombre de los campos a seleccionar
     * @param {string[] | null} filtroNombres (opcional) nombre de los campos de la condicion
     * @param {any[] | null} filtroValores (opcional) valores de los campos a checar
     * @param {Function(err, instancias)} callback funcion para para manipular el resultado
     */
    static consultar(tablaNombre, seleccionNombres=[], filtroNombres=[], filtroValores=[], callback=
        /**
         * 
         * @param {import("mysql").MysqlError} err 
         * @param {Modelo[]} instancias 
         */
        (err, instancias=[])=>{}){
        let sql = "SELECT "

        //arma el SELECT con los campos a seleccionar
        if(seleccionNombres){
            seleccionNombres.forEach(nom=>{
                sql += nom+", ";
            })
            sql = sql.slice(0, sql.length-2); //mochale la ultima coma y espacio
        }else sql += " *";
        
        sql += " FROM " + tablaNombre;

        //arma el WHERE con los nombres y valores a filtrar
        if(filtroNombres && filtroValores){
            sql += " WHERE";
            for(let i = 0; i < filtroNombres.length;i++){
                if(typeof filtroValores[i] == 'string') sql+= " "+filtroNombres[i]+"='"+filtroValores[i]+"'";
                else sql+= " "+filtroNombres[i]+"="+filtroValores[i];

                sql += " AND"
            }
            sql = sql.slice(0, sql.length-4);
        }
        
        //instanciar coincidencias y devolverlas en el callback

        this.conexion.ejecutarRes(sql, (err, result, fields)=>{
            let lista = [];
            if(err){
                callback(err, null);
                return;
            }else{
                result.forEach(objeto=>{
                    let clase = Modelador.getNombre(tablaNombre);
                    let ins = null;
                    try{
                        ins = new clase();
                    }catch(e){
                        console.error("El modelo especificado no esta registrado: ", tablaNombre, Modelador.modelos.keys());
                        return;
                    }
                    let tipos = clase.tipos();
                    let campos = Modelador.getCampos(ins);
                    let i = 0;
                    for(const fld in objeto){
                        i = campos.indexOf(fld); //actualiza el indice al del siguiente campo, puede que la consulta se brinque campos
                        let tipo = tipos[i];
                        let dato = objeto[fld];

                        if(tipo == "boolean") ins[fld] = dato == 1;
                        else ins[fld] = dato;
                        
                    }
                    
                    lista.push(ins);
                })

                callback(err, lista); //
            }
        });
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

        new Encadenador().wipe()
        .then(callback=>{
            this.conexion.ejecutar(sql, callback); //crea el usuario en mysql
        })
        .then(callback=>{
            this.agregarRes(modelo, (err, result, fields)=>{//agregalo a los usuarios de la BD pero con un procedimiento custom
                if(err){
                    //llamar cositas para mostrar en interfaz, reconocimiento de codigos de error y eso
                    console.warn("Error al agregar el administrador: ", err.errno, err.sqlMessage);
                };
                callback();
            }); 
        })
        .run()
        .then(()=>{
            callback() //termina la secuencia
        });
    }
}

module.exports = DAO;