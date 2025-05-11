import { DAO } from "../../controlador/DAO.mjs";
import { Articulo_Equipo } from "../../modelo/Articulo_Equipo.mjs";
import { Articulo_Inventario } from "../../modelo/Articulo_Inventario.mjs";
import { Modelador } from "../../modelo/Modelador.mjs";
import { Analizador } from "./Analizador.mjs";
import { ErrorHandler } from "./ErrorHandler.mjs";
import { Formulario } from "./Formulario.mjs";
import { Protocol } from "./protocol.mjs";
import { Selector } from "./Seleccionador.mjs";

let CODIGO_SELECCION = null;
/**
 * @type {HTMLTableRowElement}
 */
let ROW_SELECCION = null;

let TIPO_INVENTARIO = "material";

/**
 * 
 * @param {string} codigo 
 * @param {HTMLTableRowElement} row 
 */
function cambiarSeleccion(codigo, row){
    CODIGO_SELECCION = codigo;
    if(ROW_SELECCION != null){
        //colorsito de seleccion quitado
        ROW_SELECCION.style.backgroundColor = "transparent"
        ROW_SELECCION.onclick = (ev)=>{
            cambiarSeleccion(null, null);
        }
        
    }
    if(row != null){
        //colorsito de seleccion ponido
        row.onclick = (ev)=>{
            console.log(ev.target);
            if([...row.children].indexOf(ev.target) == -1){
                return;
            }
            cambiarSeleccion(null, null);
        }
        row.style.backgroundColor = "rgb(100,200,255)"
    }
    ROW_SELECCION = row;
    //
    
}
document.getElementById("btnMaterial").addEventListener("click", (ev)=>{
    TIPO_INVENTARIO = "material";
    Selector.cambiarSeleccion(null, null);
    document.getElementById("btnMaterial").style.backgroundColor = "cyan";
    document.getElementById("btnEquipo").style.backgroundColor = "rgb(23, 180, 80)";
    
    configurarActualizarTabla();
})

document.getElementById("btnEquipo").addEventListener("click", (ev)=>{
    TIPO_INVENTARIO = "equipo";
    Selector.cambiarSeleccion(null, null);
    document.getElementById("btnEquipo").style.backgroundColor = "cyan";
    document.getElementById("btnMaterial").style.backgroundColor = "rgb(23, 180, 80)";

    configurarActualizarTabla();
})



/**
 * @type {HTMLFormElement}
 */
let formHTML = document.getElementById("formulario");
/**
 * @type {HTMLTableElement}
 */
let tabla = document.getElementsByClassName("tablaInventarios")[0];
function consultarTablaLike(tabla, f=(lista)=>{}){
    let id = document.getElementById("cId").value;
    let nombre = document.getElementById("cNombre").value;
    let existencias = document.getElementById("cExistencias").value

    DAO.queryConsultarLike("inventario", tabla, null, ["Id","Nombre", "Existencias"], [id+"%", nombre+"%", existencias+"%"], (err, lista)=>{
        switch(err){
            case Protocol.QUERY_SUCCESS:
            f(lista);
            break;
            case Protocol.QUERY_BLOCK:
                alert("No tiene permiso para consultar inventario");
            default:
                console.log("Error: ", err);
                ErrorHandler.handelarError(err);
                
        }
    })
}
function consultarArticulosLike(f=(lista)=>{}){
    consultarTablaLike(Articulo_Inventario.name, f);
}
function consultarEquiposLike(f=(lista)=>{}){
    consultarTablaLike(Articulo_Equipo.name, f);
}

///auto busqueda por tecleo

document.getElementById("cId").addEventListener("keyup", (ev)=>{
    let cons = consultarArticulosLike;

    if(TIPO_INVENTARIO == "equipo") cons = consultarEquiposLike;
    cons((lista)=>{
        configurarActualizarTablaEspecifico(lista);
    })
});
document.getElementById("cNombre").addEventListener("keyup", (ev)=>{
    let cons = consultarArticulosLike;

    if(TIPO_INVENTARIO == "equipo") cons = consultarEquiposLike;
    cons((lista)=>{
        configurarActualizarTablaEspecifico(lista);
    })
});
document.getElementById("cExistencias").addEventListener("keyup", (ev)=>{
    let cons = consultarArticulosLike;

    if(TIPO_INVENTARIO == "equipo") cons = consultarEquiposLike;
    cons((lista)=>{
        configurarActualizarTablaEspecifico(lista);
    })
});

function rellenarTabla(tabla, lista, consulta=(id, call=(lista)=>{})=>{}, eliminacion=(id, call=(datos)=>{})=>{}){
    Formulario.actualizarTablaCalls(tabla, lista, "Id",
        /**
         * 
         * @param {MouseEvent} ev 
         * @param {HTMLTableRowElement} row 
         */
        (ev, row)=>{
            Selector.cambiarSeleccion(row.getAttribute("id"), row);
            //poner los campos en el formulario
            
            consulta(Selector.codigo, (lista)=>{
                if(lista.length ==0) return;

                /**
                 * @type {Articulo_Inventario | Articulo_Equipo}
                 */
                let mod = lista[0];
                console.log("Modelo obtenido: ", mod);
                
                document.getElementById("cId").setAttribute("value", ""+mod.Id);
                document.getElementById("cNombre").setAttribute("value", ""+mod.Nombre);
                document.getElementById("cExistencias").setAttribute("value", ""+mod.Existencias);
                
            })
        }, 
        /**
         * 
         * @param {MouseEvent} ev 
         * @param {HTMLTableRowElement} row 
         */
        (ev, row)=>{
            Selector.cambiarSeleccion(null, null);
            eliminacion(""+row.getAttribute("id"), (res)=>{
                alert("Registro eliminado")
                configurarActualizarTabla();
            });
            
    });
}

function configurarActualizarTabla(){

    ///haz que cambie las consultas segun el tipode inventario
    let consulta = consultarArticulos;
    let consultaId = consultarArticuloId;
    let eliminar = eliminarArticuloId;

    if(TIPO_INVENTARIO == "equipo"){
        consulta = consultarEquipos;
        consultaId = consultarEquipoId;
        eliminar = eliminarEquipoId;
    }

    Formulario.resetearRegistros(tabla);
    consulta((lista)=>{
        console.log("mostrando: " + lista.length + " regis");
        rellenarTabla(tabla, lista, consultaId, eliminar);
    })
}
function configurarActualizarTablaEspecifico(lista){

    let consultaId = consultarArticuloId;
    let eliminar = eliminarArticuloId;

    if(TIPO_INVENTARIO == "equipo"){
        consultaId = consultarEquipoId;
        eliminar = eliminarEquipoId;
    }

    Formulario.resetearRegistros(tabla);
    console.log("mostrando: " + lista.length + " regis");
        
    rellenarTabla(tabla, lista, consultaId, eliminar);
}

configurarActualizarTabla();



formHTML.addEventListener("submit", (ev)=>{
    console.log(ev.target);
    
    ev.preventDefault();
    let codigo = ev.target.id.value;
    let nombre = ev.target.nombre.value;
    let existencias = ev.target.existencias.value;
    let tipo = Articulo_Inventario;
    if(TIPO_INVENTARIO == "equipo") tipo = Articulo_Equipo;
    //poner los datos del form en un objeto de formulario para poder validarlos
    let form = Formulario.crearDeModelo(tipo);
    form.generar();
    
    
    form.getInput("Id").value = codigo;
    form.getInput("Nombre").value = nombre;
    form.getInput("Existencias").value = existencias;

    let cods = Formulario.validar(form);
    let allBad = []; //arreglo de mensajes de error
    cods.forEach((codigo, nombre) => {//revisar cada codigo
        //en caso de error, obtiene el mensaje acorde al campo y lo mete al arreglo de mensajes
        if (codigo != 0) {
            let label = form.labels.get(nombre);
            let tipoDato = form.tipoDatos.get(nombre);
            let longitud = form.longitudes.get(nombre);
            let especiales = form.especiales.get(nombre);
            allBad.push(Analizador.getMensajeError(codigo, label, tipoDato, longitud, especiales));
        }
    })
    if(allBad.length > 0) {
        alert(allBad.join("\n")); return;
    }else{
        let agrega = agregarArticulo;
        let modifica = modificarArticuloId

        if(TIPO_INVENTARIO == "equipo"){
            agrega = agregarEquipo;
            modifica = modificarEquipoId;
        }
        let data = Formulario.extraer(form);
        let modelo = Modelador.instanciar(tipo.name, data);
        
        console.log(modelo);
        if(Selector.codigo == null){
            agrega(modelo, (datos)=>{
                //actualizar la tabla
                alert("Registro agregado")
                configurarActualizarTabla();
            })
        }else {
            modifica(modelo, Selector.codigo, (datos)=>{
                alert("Registro modificado");
                configurarActualizarTabla();
            })
        }
        
    }
    
    //busqueda (o agregar?)
})

ErrorHandler.registrarError(ErrorHandler.WRONG_VALUE, ()=>{
    alert("Los datos del registro son incorrectos, verifique los campos");
  })
  ErrorHandler.registrarError(ErrorHandler.DUPLICATE_ENTRY, ()=>{
    alert("Este registro ya existe");
  })

///FUNCIONES DE CAMBIO
function modificarTablaId(tabla, alertTipo, modelo, id, call=(datos)=>{}){

    consultarId(tabla, "Id", id, (lista)=>{
        if(lista.length == 0) return;
        DAO.queryCambiarModelo("inventario", modelo, [id], (res)=>{

            
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

///CAMBIO DE ARTICULOS
function modificarArticuloId(modelo, id, call=(datos)=>{}){
    modificarTablaId(Articulo_Inventario.name, "articulos", modelo, id, call);
}
///CAMBIO DE EQUIPO
function modificarEquipoId(modelo, id, call=(datos)=>{}){
    modificarTablaId(Articulo_Equipo.name, "equipo fotografico", modelo, id, call);
}

///FUNCIONES DE CONSULTA
function consultarTabla(tabla, selecNombres=[], filtroNombres=[], filtroValores=[], l=(lista)=>{}){
    DAO.queryConsultar("inventario", tabla, selecNombres, filtroNombres, filtroValores, (err, lista)=>{
        switch (err) {
            case Protocol.QUERY_SUCCESS:

                console.log("CONSULTA EXITOSA")
                l(lista);
                break;

            case Protocol.QUERY_BLOCK:
                alert("No tiene permitido consultar artículos");
                console.log("CONSULTA BLOQUEADA")
                break;

            default:
                console.log("Error de instruccion: ", error);
                ErrorHandler.handelarError(error);
        }
    })
}
function consultarGlobal(tabla, l=(lista)=>{}){
    consultarTabla(tabla, null, null, null, l);
}
export function consultarId(tabla, idNombre, id, l=(lista)=>{}){
    consultarTabla(tabla, null, [idNombre], [id], l);
}
//FUNCION DE AGREGAR
function agregarTabla(tipoAlert, modelo, l=(datos)=>{}){
    DAO.queryAgregar(modelo, "inventario", (datos) => {
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

//CONSULTAS DE ARTICULOS
function consultarArticulos(l=(lista)=>{}){
    consultarGlobal(Articulo_Inventario.name, l);
}
function consultarArticuloId(id, l=(lista)=>{}){
    consultarId(Articulo_Inventario.name, "Id", id, l);
}

//CONSULTAS DE EQUIPO
function consultarEquipos(l=(lista)=>{}){
    consultarGlobal(Articulo_Equipo.name, l);
}
function consultarEquipoId(id, l=(lista)=>{}){
    consultarId(Articulo_Equipo.name, "Id", id, l);
}

//AGREGAR ARTICULOS
function agregarArticulo(modelo, call = (datos) => { }) {
    agregarTabla("articulos", modelo, call)
}
//AGREGAR EQUIPOS
function agregarEquipo(modelo, call = (datos) => { }) {
    agregarTabla("equipo fotográfico", modelo, call)
}

///FUNCIONES DE ELIMINACION 
function eliminarTablaId(alertTipo, tabla, id, l=(datos)=>{}){
    DAO.queryEliminarPrimaria("inventario", tabla, id, (datos)=>{
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

//BAJAS ARTICULOS
function eliminarArticuloId(id, l=(datos)=>{}){
    eliminarTablaId("articulos", Articulo_Inventario.name, id, l);
}
//BAJAS EQUIPO
function eliminarEquipoId(id, l=(datos)=>{}){
    eliminarTablaId("equipo fotografico", Articulo_Equipo.name, id, l);
}