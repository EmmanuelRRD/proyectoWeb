/**
 * se utiliza tanto por el sv local como por el cliente,
 */
export class Protocol {
    static LOGIN = 0;
    static LOGOUT = 1;

    static QUERY = 2;
    
    static LOGBACK = 3;

    static INSERT = 4;
    static DELETE = 5;
    static UPDATE = 6;

    static LOGIN_SUCCESS = 0;
    static LOGIN_FAILURE = 1;

    static LOGOUT_SUCCESS = 0;
    static LOGOUT_FAILURE = 1;

    static QUERY_SUCCESS = 0;
    static QUERY_FAILURE = 1;
    static QUERY_BLOCK = 2;
    
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
    static paqueteQuery(estado, modelo, result){
        let obj = {
            data:[this.QUERY, estado, modelo, result]
        }
        return JSON.stringify(obj);
    }
    static getQueryDatos(jsonQuery){
        let d = JSON.parse(jsonQuery).data;
        return {
            header:d[0],
            status:d[1],
            modelo:d[2],
            data: d[3],
        }
    }
    static getDatos(data){
        return JSON.parse(data).data; //obtener el arreglo de datos
    }
    static getLoginEstado(datos){
        return datos[1] == this.LOGIN_SUCCESS;
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
        xhttp.open("POST", "/pages/"+destino+".html", false);
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
    static paqueteAgregar(status, modelo, datos){
        let obj = {data:[this.INSERT, status, modelo, datos]}
        return obj;
    }
    static paqueteAgregarJSON(status, modelo, datos){
        return JSON.stringify(this.paqueteAgregar(status, modelo, datos));
    }
    static getAgregar(datos){
        console.log(datos);
        return {
            status: datos[1],
            datos: datos[2]
        }
    }
}
