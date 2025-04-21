import { DAO } from "../../controlador/DAO.mjs";
import { Evento } from "../../modelo/Evento.mjs";
import { Analizador } from "./Analizador.mjs";
import { ErrorHandler } from "./ErrorHandler.mjs";
import { Protocol } from "./protocol.mjs";

const monthYear = document.getElementById("monthYear");
const daysContainer = document.getElementById("daysContainer");

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const day = now.getDay();
/**
 * @type {Map<string, HTMLButtonElement>}
 */
const dias = new Map();

// Array de nombres de meses
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Mostrar el mes y año actual
monthYear.textContent = `${months[month]} ${year}`;

// Obtener el primer día del mes
const firstDay = new Date(year, month, 1).getDay();

// Obtener el último día del mes
const lastDate = new Date(year, month + 1, 0).getDate();

// Rellenar espacios vacíos al principio
for (let i = 0; i < firstDay; i++) {
  const empty = document.createElement("div");
  daysContainer.appendChild(empty);
}
/**
 * 
 * @param {HTMLButtonElement} btn 
 * @param {HTMLIFrameElement} frame
 */
function checarFormClick(btn, frame){
  if(btn.dataset.formClick === true && btn.dataset.outClick === false){
    console.log("FRAME SACAR");
  }
}
// Crear días del mes
for (let i = 1; i <= lastDate; i++) {
  const dayBtn = document.createElement("button");
  dayBtn.textContent = i;
  dayBtn.dataset.day = i; // Guardamos el día en un atributo
  dayBtn.addEventListener("click", function () {

    //agendar un evento

    //samparle el formulario a cada boton
    console.log("Año y mes",this.textContent.monthYear,"Día seleccionado:", this.dataset.day);
    let frame = document.createElement("iframe");
    frame.setAttribute("class", "popmenu");
    frame.src = "formularioEvento.html";
    dayBtn.dataset.form = frame;

    //variables pa checar si el usr le pica al frame o afuera
    dayBtn.dataset.formClick = false;
    dayBtn.dataset.outClick = false;

    ///AAAAAA RAZA

    frame.onload = (ev)=>{
    //listener al document del frame por si el usuario clica mientras el frame existe
    frame.contentWindow.document.addEventListener("click", (ev)=>{
        if(!Analizador.revisarBool(dayBtn.dataset.formClick)){
          frame.remove();
        }else {
            dayBtn.dataset.formClick = false; 
        }
      })

      frame.contentWindow.document.getElementById("form").addEventListener("click", (ev)=>{
        dayBtn.dataset.formClick = true;
      })
    }
    
    /**
     * Como cerrar el frame si el usr pica fuera del form
     * - si solo sale el event del document, pero no del body, significa que el usr le pico fuera del from
     * - el evento del document sale despues del evento del form, se usa ese pa checar los clics
     */

    document.body.appendChild(frame);
  });
  daysContainer.appendChild(dayBtn);
  dias.set(i, dayBtn);
}

///REGISTRO DE ERRORES PARA CALENDARIO

ErrorHandler.registrarError(ErrorHandler.WRONG_VALUE, ()=>{
  alert("Los datos del registro son incorrectos, verifique los campos");
})
ErrorHandler.registrarError(ErrorHandler.DUPLICATE_ENTRY, ()=>{
  alert("Este registro ya existe");
})


//sacalos eventos del calendario
function consultarMes(anio, mes){
  DAO.queryConsultar("calendario", "evento", null, ["YEAR(Fecha_Inicio)", "MONTH(Fecha_Inicio)"], [anio, mes], (err, lista)=>{
    switch(err){
  
      case Protocol.QUERY_SUCCESS:
  
        console.log("CONSULTA EXITOSA: ", lista);
        break;
  
      case Protocol.QUERY_BLOCK:
  
        console.log("CONSULTA EXITOSA: ", lista);
        break;
  
      default:
  
        console.log("ERROR EN LA CONSULTA: ", err);
        break;
    }
  })
}

function requestAgregarEvento(id, fecha_inicio, empleado, nombre_cliente, apellido_cliente, nombre_modelo, paquete_fotografico, tipo_evento, fecha_fin){
  let ev = new Evento(id, fecha_inicio, empleado, nombre_cliente, apellido_cliente, nombre_modelo, paquete_fotografico, tipo_evento, fecha_fin);
  DAO.queryAgregar(ev, "calendario", (datos)=>{
      switch(datos.header){

        case Protocol.QUERY_SUCCESS:

          console.log("INSERCION EXITOSA")
          consultarMes(year, month);
          break;

        case Protocol.QUERY_BLOCK:

          console.log("INSERCION BLOQUEADA")
          break;

        default:
          console.log("Error de instruccion: ", datos.status);
          ErrorHandler.handelarError(datos.status);
      }
  })
}

consultarMes(year, month);

requestAgregarEvento(4, `${year}-${month}-${day}`, "Dios", "El Jersa", "Jerusalem", 1, 1, 1, `${year}-${month}-${day}`);