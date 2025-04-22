import { DAO } from "../../controlador/DAO.mjs";
import { Evento } from "../../modelo/Evento.mjs";
import { Analizador } from "./Analizador.mjs";
import { ErrorHandler } from "./ErrorHandler.mjs";
import { Protocol } from "./protocol.mjs";

const monthYear = document.getElementById("monthYear");
const daysContainer = document.getElementById("daysContainer");
const selectorMes = document.getElementById("selectorMes");
const selectorAnio = document.getElementById("selectorAnio");

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const day = now.getDay();

console.log(now);
console.log(year);
console.log(month);
console.log(day);

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/**
 * @type {Map<string, HTMLButtonElement>}
 */
const dias = new Map();

// Rellenar los meses
months.forEach((mes, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = mes;
  selectorMes.appendChild(option);
});

// Rellenar años (por ejemplo de 1950 a 2100)
for (let anio = 1950; anio <= 2030; anio++) {
  const option = document.createElement("option");
  option.value = anio;
  option.textContent = anio;
  selectorAnio.appendChild(option);
}

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

function renderCalendar(year, month) {
  // Limpiar días anteriores
  daysContainer.innerHTML = "";
  dias.clear();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  //-------------------------------Espacios vacíos antes del primer día
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    daysContainer.appendChild(empty);
  }

  //{---------------------------------Crear botones de días-------------------------------------
  for (let i = 1; i <= lastDate; i++) {
    const dayBtn = document.createElement("button");
    dayBtn.textContent = i;
    dayBtn.dataset.day = i;

    dayBtn.addEventListener("click", function () {
      const dia = this.dataset.day;
      const mes = parseInt(selectorMes.value);
      const anio = parseInt(selectorAnio.value);

      console.log(`Fecha completa: ${anio}-${mes + 1}-${dia}`);
      let frame = document.createElement("iframe");
      frame.setAttribute("class", "popmenu");
      frame.src = "formularioEvento.html";
      dayBtn.dataset.form = frame;
      dayBtn.dataset.formClick = false;
      dayBtn.dataset.outClick = false;

      frame.onload = () => {
        frame.contentWindow.document.addEventListener("click", () => {
          if (!Analizador.revisarBool(dayBtn.dataset.formClick)) {
            frame.remove();
          } else {
            dayBtn.dataset.formClick = false;
          }
        });

        frame.contentWindow.document.getElementById("form").addEventListener("click", () => {
          dayBtn.dataset.formClick = true;
        });
      };

      document.body.appendChild(frame);
    });

    daysContainer.appendChild(dayBtn);
    dias.set(i, dayBtn);
  }

  consultarMes(year, month + 1); // de 0- delante
}

selectorMes.value = month;  //La fecha de hoy
selectorAnio.value = year;

renderCalendar(year,month);

selectorMes.addEventListener("change", () => {
  const newMonth = parseInt(selectorMes.value);
  const newYear = parseInt(selectorAnio.value);
  renderCalendar(newYear, newMonth);
});

selectorAnio.addEventListener("change", () => {
  const newMonth = parseInt(selectorMes.value);
  const newYear = parseInt(selectorAnio.value);
  renderCalendar(newYear, newMonth);
});
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