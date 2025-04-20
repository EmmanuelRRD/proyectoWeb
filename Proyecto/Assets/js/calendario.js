import { DAO } from "../../controlador/DAO.mjs";
import { Evento } from "../../modelo/Evento.mjs";
import { Protocol } from "./protocol.mjs";

const monthYear = document.getElementById("monthYear");
const daysContainer = document.getElementById("daysContainer");

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();

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

// Crear días del mes
for (let i = 1; i <= lastDate; i++) {
  const dayBtn = document.createElement("button");
  dayBtn.textContent = i;
  dayBtn.dataset.day = i; // Guardamos el día en un atributo
  dayBtn.addEventListener("click", function () {

    console.log("Año y mes",this.textContent.monthYear,"Día seleccionado:", this.dataset.day);
  });
  daysContainer.appendChild(dayBtn);
  dias.set(i, dayBtn);
}
//actualizar el calendario al entrar, solo los datos del mes visible
function consultarMes(anio, mes){
  return Protocol.consulta("evento", null, ["YEAR(Fecha_Inicio)", "MONTH(Fecha_Inicio)"], [anio, mes]);
}
function requestAgregarEvento(id, fecha_inicio, empleado, nombre_cliente, apellido_cliente, nombre_modelo, paquete_fotografico, tipo_evento, fecha_fin){
  let ev = new Evento(id, fecha_inicio, empleado, nombre_cliente, apellido_cliente, nombre_modelo, paquete_fotografico, tipo_evento, fecha_fin);
  let paq = Protocol.paqueteAgregar(0, ev.constructor.name, ev.getDatos());
  Protocol.enviarRequestJSON(paq, "calendario", (res)=>{
    console.log(res);
  })
}

DAO.queryConsultar("calendario", "evento", null, ["YEAR(Fecha_Inicio)", "MONTH(Fecha_Inicio)"], [year, month], (err, lista)=>{
  switch(err){
    case Protocol.QUERY_SUCCESS:
      console.log("CONSULTA EXITOSA: ", lista);
      break;
    default:
      console.log("ERROR EN LA CONSULTA: ", err);
      break;
  }
})

//requestAgregarEvento(1, `${year}-${month}-01`, "Dios", "El Jersa", "Jerusalem", 1, 1, 1, `${year}-${month}-01`);