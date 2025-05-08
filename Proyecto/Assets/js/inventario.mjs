import { DAO } from "../../controlador/DAO.mjs";
import { Articulo_Inventario } from "../../modelo/Articulo.mjs";
import { Modelador } from "../../modelo/Modelador.mjs";
import { Analizador } from "./Analizador.mjs";
import { ErrorHandler } from "./ErrorHandler.mjs";
import { Formulario } from "./Formulario.mjs";
import { Protocol } from "./protocol.mjs";

let CODIGO_SELECCION = null;
/**
 * @type {HTMLFormElement}
 */
let formHTML = document.getElementById("formulario");
/**
 * @type {HTMLTableElement}
 */
let tabla = document.getElementsByClassName("tablaInventarios")[0];

function configurarActualizarTabla(){
    Formulario.resetearRegistros(tabla);
    consultarArticulos((lista)=>{
        console.log("mostrando: " + lista.length + " regis");
        
        Formulario.actualizarTablaCalls(tabla, lista, "Id",
            /**
             * 
             * @param {MouseEvent} ev 
             * @param {HTMLTableRowElement} row 
             */
            (ev, row)=>{
                CODIGO_SELECCION = row.getAttribute("id");
                //poner los campos en el formulario
                
                consultarArticuloId(CODIGO_SELECCION, (lista)=>{
                    if(lista.length ==0) return;

                    /**
                     * @type {Articulo_Inventario}
                     */
                    let mod = lista[0];

                    document.getElementById("cId").setAttribute("value", mod.Id);
                    document.getElementById("cNombre").setAttribute("value", mod.Nombre);
                    document.getElementById("cExistencias").setAttribute("value", mod.Existencias);
                    
                })
            }, 
            /**
             * 
             * @param {MouseEvent} ev 
             * @param {HTMLTableRowElement} row 
             */
            (ev, row)=>{
                CODIGO_SELECCION = null;
                eliminarArticuloId(""+row.getAttribute("id"), (res)=>{
                    alert("Articulo eliminado")
                    configurarActualizarTabla();
                });
                
        });
    })
}
configurarActualizarTabla();

formHTML.addEventListener("submit", (ev)=>{
    console.log(ev.target);
    
    ev.preventDefault();
    let codigo = ev.target.id.value;
    let nombre = ev.target.nombre.value;
    let existencias = ev.target.existencias.value;

    //poner los datos del form en un objeto de formulario para poder validarlos
    let form = Formulario.crearDeModelo(Articulo_Inventario);
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
        
        let data = Formulario.extraer(form);
        let modelo = Modelador.instanciar(Articulo_Inventario.name, data);
        
        console.log(modelo);
        if(CODIGO_SELECCION == null){
            agregarArticulo(modelo, (datos)=>{
                //actualizar la tabla
                alert("Articulo agregado")
                configurarActualizarTabla();
            })
        }else {
            modificarArticuloId(modelo, CODIGO_SELECCION, (datos)=>{
                alert("Articulo modificado");
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

function agregarArticulo(modelo, call = (datos) => { }) {
    DAO.queryAgregar(modelo, "inventario", (datos) => {
        switch (datos.status) {
            case Protocol.QUERY_SUCCESS:

                console.log("INSERCION EXITOSA")
                call(datos);
                break;

            case Protocol.QUERY_BLOCK:
                alert("No tiene permitido insertar artículos");
                console.log("INSERCION BLOQUEADA")
                break;

            default:
                console.log("Error de instruccion: ", datos.status);
                ErrorHandler.handelarError(datos.status);
        }
    })
}
function modificarArticuloId(modelo, id, call=(datos)=>{}){
    
    consultarArticuloId(id, (lista)=>{
        if(lista.length == 0) return;
        DAO.queryCambiarModelo("inventario", modelo, [id], (res)=>{

            
            switch (res.status) {
                case Protocol.QUERY_SUCCESS:
    
                    console.log("CAMBIO EXITOSO")
                    call(lista);
                    break;
    
                case Protocol.QUERY_BLOCK:
                    alert("No tiene permitido modificar artículos");
                    console.log("CAMBIO BLOQUEADA")
                    break;
    
                default:
                    console.log("Error de instruccion: ", res.status);
                    ErrorHandler.handelarError(res.status);
            }
        })
    })
}
function consultarArticulos(l=(lista)=>{}){
    DAO.queryConsultar("inventario", Articulo_Inventario.name, null, null, null, (error, lista)=>{
        switch (error) {
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
function consultarArticuloId(id, l=(lista)=>{}){
    DAO.queryConsultar("inventario", Articulo_Inventario.name, null, ["Id"], [id], (error, lista)=>{
        switch (error) {
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

function eliminarArticuloId(id, l=(datos)=>{}){
    DAO.queryEliminarPrimaria("inventario", Articulo_Inventario.name, id, (datos)=>{
        switch(datos.status){
            case Protocol.QUERY_SUCCESS:

                console.log("eliminaicon exitosa");
                l(datos);
                break;
            case Protocol.QUERY_BLOCK:

                alert("No tiene permiso para eliminar eventos");
                break;
            default:

                console.log("Error de eliminacion: ", datos);
                ErrorHandler.handelarError(datos.status);
        }
    })
}