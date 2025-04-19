class Protocol {
    static LOGIN = 0;
    static LOGIN_SUCCESS = 0;
    static LOGIN_FAILURE = 1;

    static getLoginDatos(data){
        return JSON.parse(data).data; //obtener el arreglo de datos
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
}