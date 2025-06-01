import { DAO } from "../../controlador/DAO.mjs";
import { Modelador } from "../../modelo/Modelador.mjs";
import { Usuario } from "../../modelo/usuario.mjs";
import { ErrorHandler } from "./ErrorHandler.mjs";
import { Formulario } from "./Formulario.mjs";
import { Protocol } from "./protocol.mjs";
import { Selector } from "./Seleccionador.mjs";
import { Analizador } from "./Analizador.mjs";
let user = Protocol.getUserDatos();
/**
 * @type {HTMLFormElement}
 */
let formHTML = document.getElementById("formulario");
/**
 * @type {HTMLTableElement}
 */
let tabla = document.getElementById("tablaUsuarios");

document.getElementById("cNombre").addEventListener("keyup", (ev)=>{
    consultarTablaLike(Usuario.name, (lista)=>{
        Formulario.rellenarTabla(tabla, lista, "Nombre", consultarGlobal, consultarUsuarioId, eliminarUsuarioId);
    })
})
document.getElementById("cPass").addEventListener("keyup", (ev)=>{
    consultarTablaLike(Usuario.name, (lista)=>{
        Formulario.rellenarTabla(tabla, lista, "Nombre", consultarGlobal, consultarUsuarioId, eliminarUsuarioId);
    })
})
document.getElementById("cEscritura").addEventListener("mouseup", (ev)=>{
    consultarTablaLike(Usuario.name, (lista)=>{
        Formulario.rellenarTabla(tabla, lista, "Nombre", consultarGlobal, consultarUsuarioId, eliminarUsuarioId);
    })
})
document.getElementById("cLectura").addEventListener("mouseup", (ev)=>{
    consultarTablaLike(Usuario.name, (lista)=>{
        Formulario.rellenarTabla(tabla, lista, "Nombre", consultarGlobal, consultarUsuarioId, eliminarUsuarioId);
    })
})

//CONSULTA
function consultarTablaLike(tabla, f=(lista)=>{}) {
    let nombre = document.getElementById("cNombre").value;
    let password = document.getElementById("cPass").value
    let lectura = (document.getElementById("cLectura").checked ? 1 : 0);
    let escritura = (document.getElementById("cLectura").checked ? 1 : 0);

    //console.log(nombre);
    
    DAO.queryConsultarLike("panelUsuarios", tabla, null, ["Nombre", "Pass"], [nombre+"%", password+"%"], (err, lista)=>{
        switch(err){
            case Protocol.QUERY_SUCCESS:
            let o = [];
            for(const mod of lista){
                if(!mod.Es_Admin) o.push(mod);
                else console.log("filtrado ", mod);
            }
            f(o);
            break;
            case Protocol.QUERY_BLOCK:
                alert("No tiene permiso para consultar usuarios");
            default:
                console.log("Error: ", err);
                ErrorHandler.handelarError(err);
        }
    })
}

/**
 * 
 * @param {string} tabla 
 * @param {string[] | null} selecNombres 
 * @param {string[] | null} filtroNombres 
 * @param {any[] | null} filtroValores 
 * @param {(lista: Usuario[])=>{}} l 
 */
function consultarTabla(tabla, selecNombres=[], filtroNombres=[], filtroValores=[], l=(lista)=>{}){
    DAO.queryConsultar("panelUsuarios", tabla, selecNombres, filtroNombres, filtroValores, (err, lista)=>{
        switch (err) {
            case Protocol.QUERY_SUCCESS:

                console.log("CONSULTA EXITOSA")
                l(lista);
                break;

            case Protocol.QUERY_BLOCK:
                alert("No tiene permitido consultar usuarios");
                console.log("CONSULTA BLOQUEADA")
                break;

            default:
                console.log("Error de instruccion: ", err);
                ErrorHandler.handelarError(err);
        }
    })
}

function consultarGlobal(l=(lista)=>{}){
    consultarTabla(Usuario.name, null, null, null, l);
}
/**
 * 
 * @param {(lista: Usuario[])=>{}} l 
 */
function consultarNoAdmin(l=(lista)=>{}){
    consultarTabla(Usuario.name, null, null, null, (lista)=>{
        let o = [];
        for(const mod of lista){
            if(!mod.Es_Admin) o.push(mod);
        }
        l(o);
    });
 
}

function consultarId(tabla, idNombre, id, l=(lista)=>{}){
    consultarTabla(tabla, null, [idNombre], [id], l);
}
function consultarUsuarioId(id, l=(lista)=>{}){
    consultarTabla(Usuario.name, null, ["Nombre"], [id], l);
}
//FUNCION DE AGREGAR
function agregarTabla(tipoAlert, modelo, l=(datos)=>{}){
    DAO.queryAgregar(modelo, "panelusuarios", (datos) => {
        switch (datos.status) {
            case Protocol.QUERY_SUCCESS:

                console.log("INSERCION EXITOSA")
                l(datos);
                break;

            case Protocol.QUERY_BLOCK:
                alert("No tiene permitido insertar " + tipoAlert);
                console.log("INSERCION BLOQUEADA")
                break;

            default:
                console.log("Error de instruccion: ", datos.status);
                ErrorHandler.handelarError(datos.status);
        }
    })
}
///FUNCIONES DE ELIMINACION 
function eliminarTablaId(alertTipo, tabla, id, l=(datos)=>{}){
    DAO.queryEliminarPrimaria("panelUsuarios", tabla, id, (datos)=>{
        switch(datos.status){
            case Protocol.QUERY_SUCCESS:

                console.log("eliminaicon exitosa");
                l(datos);
                break;
            case Protocol.QUERY_BLOCK:

                alert("No tiene permiso para eliminar " + alertTipo);
                break;
            default:

                console.log("Error de eliminacion: ", datos);
                ErrorHandler.handelarError(datos.status);
        }
    })
}

function eliminarUsuarioId(id, l=(datos)=>{}){
    consultarUsuarioId(id, (list)=>{
        if(list.length == 0) return;

        let mod = list[0];
        DAO.eliminarUsuario(mod, "panelUsuarios", l)
    })
    //eliminarTablaId("usuarios", Usuario.name, id, l);
}

///FUNCIONES DE CAMBIO
function modificarTablaId(tabla, alertTipo, modelo, id, call=(datos)=>{}){

    consultarId(tabla, "Id", id, (lista)=>{
        if(lista.length == 0) return;
        DAO.queryCambiarModelo("panelUsuario", modelo, [id], (res)=>{

            
            switch (res.status) {
                case Protocol.QUERY_SUCCESS:
    
                    console.log("CAMBIO EXITOSO")
                    call(lista);
                    break;
    
                case Protocol.QUERY_BLOCK:
                    alert("No tiene permitido modificar " + alertTipo);
                    console.log("CAMBIO BLOQUEADO")
                    break;
    
                default:
                    console.log("Error de instruccion: ", res.status);
                    ErrorHandler.handelarError(res.status);
                    break;
            }
        })
    })
}

///LOGICA
let admin = Protocol.userAdmin(user);
if(!admin){
    eliminarUsuarioId = ()=>{return};
}
Formulario.refrescarTabla(tabla, "Nombre", consultarNoAdmin, consultarUsuarioId, eliminarUsuarioId);

formHTML.addEventListener("submit", (ev)=>{
    
    let admin = Protocol.userAdmin(user);
    if(!admin){
        alert("No tiene permitido modificar inventario");
        return;
    }

    console.log(ev.target);
    
    ev.preventDefault();
    let nombre = ev.target.nombre.value;
    let pass = ev.target.password.value;
    let lectura = ev.target.lectura.checked;
    let escritura = ev.target.escritura.checked;

    let form = Formulario.crearDeModelo(Usuario);
    form.generar();
    form.getInput("Nombre").value=nombre;
    form.getInput("Pass").value=pass;
    form.getInput("Lectura").checked=lectura;
    form.getInput("Escritura").checked=escritura;
    form.getInput("Es_Admin").checked=false;
    
    let cods = Formulario.validar(form);
    let allBad = [];
    cods.forEach((codigo, nombre)=>{
        if (codigo != 0) {
            let label = form.labels.get(nombre);
            let tipoDato = form.tipoDatos.get(nombre);
            let longitud = form.longitudes.get(nombre);
            let especiales = form.especiales.get(nombre);
            
            allBad.push(Analizador.getMensajeError(codigo, label, tipoDato, longitud, especiales));
        }
    })
    if(allBad.length > 0){

        alert(allBad.join("\n")); return;

    }else{
        console.log("si");
        
        let data = Formulario.extraer(form);
        
        let modelo = Modelador.instanciar(Usuario.name, data);
        modelo["Es_Admin"] = false;
        console.log(data);

        if(Selector.codigo == null){
            
            DAO.agregarUsuario(modelo, "panelUsuarios", (res)=>{
                alert("Registro agregado")
                Formulario.refrescarTabla(tabla, "Nombre", consultarNoAdmin, consultarUsuarioId, eliminarUsuarioId);
            })
        }else{
            consultarUsuarioId(Selector.codigo, (lista)=>{
                if(lista.length < 1) return;
                let og = lista[0];

                
                DAO.actualizarUsuario(modelo, og, "panelUsuarios", (res)=>{
                      alert("Registro modificado");      
                      Formulario.refrescarTabla(tabla, "Nombre", consultarNoAdmin, consultarUsuarioId, eliminarUsuarioId);
                })
            })
        }
        
    }
})