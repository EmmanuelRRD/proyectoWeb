/**
 * se utiliza tanto por el sv local como por el cliente,
 */
export class Protocol {
    static LOGIN = 0;
    static LOGOUT = 1;
    static LOGERR = 8;

    static QUERY = 2;
    static QUERY_STACK = 3;
    
    static LOGBACK = 4;

    static INSERT = 5;
    static DELETE = 6;
    static UPDATE = 7;

    static LOGIN_SUCCESS = 0;
    static LOGIN_FAILURE = 1;
    static LOGIN_DENIED = 2;

    static LOGOUT_SUCCESS = 0;
    static LOGOUT_FAILURE = 1;

    static QUERY_SUCCESS = 0;
    static QUERY_FAILURE = 1;
    static QUERY_BLOCK = 2;
    
    static queryStack =[];

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
    /**
     * paquete de respuesta a consultas del servidor
     * @param {number} estado 
     * @param {string} modelo 
     * @param {any} result 
     * @returns {string}
     */
    static paqueteQuery(estado, modelo, result){
        let obj = {
            data:[this.QUERY, estado, modelo, result]
        }
        return JSON.stringify(obj);
    }
    /**
     * paquete de respuesta a inserciones del servidor
     * @param {number} estado 
     * @param {string} modelo 
     * @param {any} result 
     * @returns {string}
     */
    static paqueteInsert(estado, modelo, result){
        let obj = {
            data:[this.INSERT, estado, modelo, result]
        }
        return JSON.stringify(obj);
    }
    static paqueteUpdate(estado, modelo, result){
        let obj = {
            data:[this.UPDATE, estado, modelo, result]
        }
        return JSON.stringify(obj);
    }
    static paqueteDelete(estado, modelo, result){
        let obj = {
            data:[this.DELETE, estado, modelo, result]
        }
        return JSON.stringify(obj);
    }
    /**
     * formatea respuestas a consultas SQL del servidor
     * @param {string} jsonQuery respuesta
     */
    static getQueryDatos(jsonQuery){
        let d = JSON.parse(jsonQuery).data;
        return {
            header:d[0],
            modelo:d[2],
            status:d[1],
            result: d[3],
        }
    }
    static getDatos(data){
        return JSON.parse(data).data; //obtener el arreglo de datos
    }
    static getLoginEstado(datos){
        return datos[1] == this.LOGIN_SUCCESS;
    }
    static getLoginTipo(datos){
        return datos[1];
    }
    static guardarUser(datos){
        localStorage.setItem("user", JSON.stringify(datos));
    }
    static borrarUser(){
        localStorage.setItem("user", JSON.stringify(null));
    }
    static enviar(direccion){
        window.location.href = direccion;
    }
    static enviarPagina(nombre){
        window.location.href = "/pages/"+nombre+".html";
    }
    static getUserDatos(){
        return JSON.parse(localStorage.getItem("user"));
    }
    static userAdmin(datos){
        console.log(datos);
        return datos[6];
    }
    static getUserNombre(datos){
        return datos[2];
    }

    ///METODOS DE COMUNICACION CON EL SERVER
    static enviarRequestJSON(datos, destino, respuesta=(res)=>{}){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = (ev)=>{
            if(xhttp.readyState == 4){
                if(xhttp.status == 200){
                    respuesta(xhttp.response);
                }
            }
        };
        let str = JSON.stringify(datos);
        xhttp.open("POST", "/pages/"+destino+".html", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(str);
    }
    static logout(){
        return {data:[this.LOGOUT]};
    }
    static consulta(tablaNombre, seleccionNombres, filtroNombres, filtroValores){
        let obj = {
            data:[this.QUERY],
            tablaNombre:tablaNombre,
            seleccionNombres: seleccionNombres,
            filtroNombres: filtroNombres,
            filtroValores: filtroValores
        }
        return obj;
    }
    static logCheck(hd){
        if(hd == this.LOGBACK){
            this.borrarUser();
            this.enviarPagina("index");
        }
        return hd == this.LOGBACK
    }
    static handleConsulta(jsonLista, exito=(modelo, res)=>{}, error=(codigo, modelo)=>{}){
        let d = this.getQueryDatos(jsonLista);
        if(this.logCheck(d.header)) return;
        switch(d.status){
            case 0:
                //instanciar los resultados
                exito(d.modelo, d.data); break;
            default: error(d.status, d.modelo); break;
        }
    }
    static sendQuery(sql, objeto, pagina, resp=(res)=>{}){
        this.enviarRequestJSON({data:[this.QUERY, objeto, sql]}, pagina, resp);
    }
    static sendInsert(sql, objeto, pagina, resp=(res)=>{}){
        this.enviarRequestJSON({data:[this.INSERT, objeto, sql]}, pagina, resp);
    }
    static sendUpdate(sql, objeto, pagina, resp=(res)={}){
        this.enviarRequestJSON({data:[this.UPDATE, objeto, sql]}, pagina, resp);
    }
    static sendDelete(sql, objeto, pagina, resp=(res)={}){
        this.enviarRequestJSON({data:[this.DELETE, objeto, sql]}, pagina, resp);
    }
    static pushQuery(sql, objeto){
        this.queryStack.push({data:[this.QUERY, objeto, sql]});
        return this;
    }
    static sendStack(pagina, resp=(res)=>{}){
        
        this.enviarRequestJSON({data:[this.QUERY_STACK, "multi", this.queryStack]}, pagina, resp);
        this.queryStack = [];
    }
    static parse(packet){//sirve tanto para procesar paquetes de consultas solas como para stacks
        let p = packet.data;
        return {
            header:p[0],
            object:p[1],
            data:p[2]
        }
    }
    static paqueteSQL(err, result, fields){
        let obj = {
            err:err,
            result:result,
            fields:fields,
        }
        return JSON.stringify(obj);
    }
    static getPaqueteSQL(datos){
        return JSON.parse(datos);
    }
}
