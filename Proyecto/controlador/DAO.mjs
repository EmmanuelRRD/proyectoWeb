import { Modelo } from "../modelo/Modelo.mjs";
import { Modelador } from "../modelo/Modelador.mjs";
import { Usuario } from "../modelo/usuario.mjs";
import { Protocol } from "../Assets/js/protocol.mjs";
import { Analizador } from "../Assets/js/Analizador.mjs";

export class DAO {
    constructor(){}
    
    /**
     * 
     * @param {Modelo} modelo 
     */
    static queryAgregar(modelo, pagina, callback=(res)=>{}){
        let sql = "INSERT INTO " + modelo.constructor.name + " VALUES(";
        sql += modelo.getDatosSQL().toString()+")";

        Protocol.sendInsert(sql, modelo.constructor.name, pagina, (res)=>{
            let datos = Protocol.getQueryDatos(res);
            if(Protocol.logCheck(datos.header)) return;
            callback(datos);
        } );
    }
    /**
     * 
     * @param {Modelo} modelo 
     */
    static sqlAgregar(modelo){
        let sql = "INSERT INTO " + modelo.constructor.name + " VALUES(";
        sql += modelo.getDatosSQL().toString()+")";
        return sql;
    }
    /**
     * Realiza una consulta con los parametros especificados, instancia los resultados y los ofrece en un arreglo dentro del callback
     * @param {string} pagina de que pagina se origina el request
     * @param {string} tablaNombre nombre de la tabla a consultar
     * @param {string[] | null} seleccionNombres (opcional) nombre de los campos a seleccionar
     * @param {string[] | null} filtroNombres (opcional) nombre de los campos de la condicion
     * @param {any[] | null} filtroValores (opcional) valores de los campos a checar
     * @param {Function(err, instancias)} callback funcion para para manipular el resultado
     */
    static queryConsultar(pagina, tablaNombre, seleccionNombres=[], filtroNombres=[], filtroValores=[], callback=
        /**
         * 
         * @param {number} err 
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
        
        //query y procesar la respuesta
        Protocol.sendQuery(sql, tablaNombre, pagina, (res)=>{
            let datos = Protocol.getQueryDatos(res);
            if(Protocol.logCheck(datos.header)) return;
            
            let lista = [];
            if(datos.status == Protocol.QUERY_SUCCESS){
                datos.result.forEach(objeto=>{
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
                        else if(tipo == "date"){
                            ins[fld] = Analizador.formatearDate(new Date(dato));
                            //console.log("date: ", ins[fld], dato);
                            
                        }
                        else ins[fld] = dato;
                    }
                    
                    lista.push(ins);
                })
            }
            callback(datos.status, lista);
        })
    }
    static queryConsultarLike(pagina, tablaNombre, seleccionNombres=[], filtroNombres=[], filtroValores=[], callback=
        /**
         * 
         * @param {number} err 
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
                if(typeof filtroValores[i] == 'string') sql+= " "+filtroNombres[i]+" LIKE '"+filtroValores[i]+"'";
                else sql+= " "+filtroNombres[i]+" LIKE "+filtroValores[i];

                sql += " AND"
            }
            sql = sql.slice(0, sql.length-4);
        }
        
        //query y procesar la respuesta
        Protocol.sendQuery(sql, tablaNombre, pagina, (res)=>{
            let datos = Protocol.getQueryDatos(res);
            if(Protocol.logCheck(datos.header)) return;
            
            let lista = [];
            if(datos.status == Protocol.QUERY_SUCCESS){
                datos.result.forEach(objeto=>{
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
                        else if(tipo == "date"){
                            ins[fld] = Analizador.formatearDate(new Date(dato));
                            //console.log("date: ", ins[fld], dato);
                            
                        }
                        else ins[fld] = dato;
                    }
                    
                    lista.push(ins);
                })
            }
            callback(datos.status, lista);
        })
    }
    static queryCambiar(pagina, tablaNombre, setNombres=[], setValores=[], filtroNombres=[], filtroValores=[], callback=(datos)=>{return}){
        let sql = "UPDATE " + tablaNombre;
        let set = " SET ";
        let where = " WHERE ";
        let i = 0;
        
        setNombres.forEach(nom=>{//formatear parte del SET
            let dato = setValores[i].toString();
            if(typeof setValores[i] == 'string') dato= "'"+setValores[i]+"'";
            set+= nom + "=" + dato+", ";

            i++;
        })
        
        set = set.substring(0, set.length-2);
        i = 0;
        
        filtroNombres.forEach(nombre=>{
            let dato = filtroValores[i].toString();
            if(typeof filtroValores[i] == 'string') dato= "'"+filtroValores[i]+"'";
            where += nombre +"="+dato+" AND ";
            i++;
        })
        where = where.substring(0, where.length-5);
        let final = sql;
        final += set;
        final += where;
        
        Protocol.sendUpdate(final, tablaNombre, pagina, (res)=>{
            let datos = Protocol.getQueryDatos(res);
            if(Protocol.logCheck(datos.header)) return;
            callback(datos);
        })
    }
    /**
     * 
     * @param {string} pagina 
     * @param {Modelo} modelo 
     */
    static queryCambiarModelo(pagina, modelo, primariasValores=[], call=(res)=>{}){
        let idxs = Modelador.getPrimariasDe(modelo.constructor.name);
        let noms = Modelador.getCamposNombre(modelo.constructor.name);
        let primariasNombres = [];
        idxs.forEach(idx=>{
            primariasNombres.push(noms[idx]);
        })
        
        
        this.queryCambiar(pagina, modelo.constructor.name, noms, modelo.getDatos(), primariasNombres, primariasValores, call)
    }
    static queryEliminarPrimaria(pagina, tabla, primaria, call=(res)=>{}){
        let sql = "DELETE FROM " + tabla;
        let where = " WHERE "
        let idx = Modelador.getPrimariasDe(tabla)[0];
        let noms = Modelador.getCamposNombre(tabla)[idx];
        console.log(idx, noms);
        
        let dato = primaria;
        if(typeof primaria == "string") dato = "'"+primaria+"'";
        where += noms+"="+primaria;

        let final = sql+where
        Protocol.sendDelete(final, tabla, pagina, (res)=>{
            let datos = Protocol.getQueryDatos(res);
            if(Protocol.logCheck(datos.header)) return;
            call(datos);
        })
    }
    /**
     * 
     * @param {Usuario} modelo 
     */
    static agregarUsuario(modelo, pagina, callback=(res)=>{}){
        let sql = `CREATE USER IF NOT EXISTS '${modelo.Nombre}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${modelo.Pass}'`;
        if(modelo.Lectura) sql += `; GRANT SELECT ON PhotoCalendar.* TO '${modelo.Nombre}'@'localhost'`;
        if(modelo.Escritura) sql+= `; GRANT INSERT, UPDATE, DELETE ON PhotoCalendar.* TO '${modelo.Nombre}'@'localhost'`;
        if(modelo.Es_Admin) sql += `; GRANT ALL PRIVILEGES ON PhotoCalendar.* TO '${modelo.Nombre}'@'localhost' WITH GRANT OPTION`;
        sql += "; FLUSH PRIVILEGES";
        sql += ";" + DAO.sqlAgregar(modelo);
        //Protocol.pushQuery(sql, Usuario.name).pushQuery(DAO.sqlAgregar(modelo), Usuario.name);
        Protocol.sendInsert(sql, Usuario.name, pagina, (res)=>{
            let datos = Protocol.getQueryDatos(res)
            callback(datos);
        })
    }
    /**
     * 
     * @param {Usuario} modelo 
     * @param {Usuario} original 
     * @param {string} pagina 
     * @param {(res)=>{}} callback 
     */
    static actualizarUsuario(modelo, original, pagina, callback=(res)=>{return}){
        let setNoms = Modelador.getCamposNombre("Usuario");
        let vals = modelo.getDatos();
        this.queryCambiar(pagina, "mysql.user", setNoms, vals, ["Nombre"], [original.Nombre], (datos)=>{
            let usr = `'${modelo.Nombre}'@'localhost'`;
            let resetea = `REVOKE SELECT, DELETE, UPDATE, INSERT ON PhotoCalendar.* FROM ${usr}`;
            let privs = "GRANT "
            let privList = [];
            if(modelo.Es_Admin){
                privs = `GRANT ALL PRIVILEGES ON PhotoCalendar.* TO ${usr} WITH GRANT OPTION`;
            }else{
                
                if(modelo.Escritura) privList.push("UPDATE", "DELETE", "INSERT");
                if(modelo.Lectura) privList.push("SELECT");
                privs += privList.join(", ") + ` ON PhotoCalendar.* TO  ${usr}`;
            }

            let final = resetea;
            if(privs != "GRANT ") final+=";"+privs;
            final+=";"+ "FLUSH PRIVILEGES";

            Protocol.sendUpdate(final, "Usuario", pagina, callback);
        })
    }
    /**
     * 
     * @param {Usuario} modelo 
     * @param {string} pagina 
     * @param {(res)=>{}} callback 
     */
    static eliminarUsuario(modelo, pagina, callback=(res)=>{return}){
        let usr = `'${modelo.Nombre}'@'localhost'`;
        let sql = "DROP USER "+ usr;
        this.queryEliminarPrimaria(pagina, "Usuario", modelo.Nombre, (res)=>{
            Protocol.sendQuery(sql, "Usuario", "calendar", callback);
        })
    }
}
