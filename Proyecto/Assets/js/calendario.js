import { DAO } from "../../controlador/DAO.mjs";
import { Evento } from "../../modelo/Evento.mjs";
import { Analizador } from "./Analizador.mjs";
import { ErrorHandler } from "./ErrorHandler.mjs";
import { Formulario } from "./Formulario.mjs";
import { Protocol } from "./protocol.mjs";

const monthYear = document.getElementById("monthYear");
const daysContainer = document.getElementById("daysContainer");
const selectorMes = document.getElementById("selectorMes");
const selectorAnio = document.getElementById("selectorAnio");

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const day = now.getDay();

/**
 * Catalogo de paquetes fotograficos, ID y nombre de paquete(?)
 * @type {Map<number, string>}
 */
const paquetesFotograficos = new Map()
.set(0, "Paquete 1");
/**
 * Catalogo de eventos, ID y tipo de evento
 * @type {Map<number, string>}
 */
const tiposEvento = new Map()
.set(0, "Evento 1");
/**
 * Catalogo de modelos, ID y nombre
 * @type {Map<string, string>}
 */
const modelos = new Map()
.set(0, "Modelo 1");


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

      ///--------------crear el formulario de eventos

      frame.onload = () => {
        /**
         * -Falta: eventos de botones enviar, limpiar, cancelar. Ya estan puestos
         * Falta: un validador de datos. Ya esta puesto (casi)
         * -Falta: poner los empleados, paquetes fotograficos, tipos de evento. Ya esta puesto
         */
        let form = Formulario.crearDeModelo(Evento);
        form.attach(frame.contentWindow.document.getElementById("contenedor"));

        //en vez de escribir el nombre del empleado a mano, se despliega una lista para seleccionar a un empleado
        //hay que sacar los empleados de la BD y poner sus nombres en la lista del formulario
        obtenerNombresEmpleados((lista)=>{
          lista.forEach(nombre=>{
            form.agregarOpcionA("Nombre_Empleado", nombre, nombre);//agregarle opciones al campo de Nombre_Empleado de formulario
          })
          
        })
        //hay que agregar los modelos al form, no se por que le puse nombre si es un ID
        modelos.forEach((modelo, modeloID)=>{
          form.agregarOpcionA("Nombre_Modelo", modeloID, modelo);
        })
        //hay que agregar los paquetes fotograficos al form
        paquetesFotograficos.forEach((paquete, paqueteID)=>{
          form.agregarOpcionA("Paquete_Fotografico", paqueteID, paquete);
        })
        //hay que agregar los tipos de evento al form
        tiposEvento.forEach((evento, eventoID)=>{
          form.agregarOpcionA("Tipo_Evento", evento, eventoID);
        })
        
        //que hacer al picarle a confirmar
        form.accionConfirmar((ev)=>{
          let cods = Formulario.validar(form); //obtener codigos de error de cada campo
          let allBad = []; //arreglo de mensajes de error
          cods.forEach((codigo, nombre)=>{//revisar cada codigo
            //en caso de error, obtiene el mensaje acorde al campo y lo mete al arreglo de mensajes
            if(codigo != 0){
              let label = form.labels.get(nombre);
              let tipoDato = form.tipoDatos.get(nombre);
              let longitud = form.longitudes.get(nombre);
              let especiales = form.especiales.get(nombre);
              allBad.push(Analizador.getMensajeError(codigo, label, tipoDato, longitud, especiales));
            }
          })
          //convertir arreglo de mensajes a un texto en forma de lista
          if(allBad.length > 0) {
            alert(allBad.join("\n")); return;
          }
          else {//si jalo el formulario
            alert("Evento agregado");
            console.log(Formulario.extraer(form));
          }
        })

        ///DETECTAR SI EL USUARIO LE PICA FUERA DEL FORMULARIO

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
  
        console.log("CONSULTA BLOQUEADA: ", lista);
        break;
  
      default:
  
        console.log("ERROR EN LA CONSULTA: ", err);
        break;
    }
  })
}

/**
 * consulta los usuarios actuales de la BD y enlista sus nombres en un arreglo
 */
function obtenerNombresEmpleados(call=
  /**
   * en esta funcion se maneja la lista de los nombres de los empleados
   * @param {string[]} nombresLista lista de los nombres de los empleados
   * @returns 
   */
  (nombresLista)=>{return}){

  DAO.queryConsultar("calendario", "usuario", ["Nombre"], null, null, (err, instancias)=>{
      let lista = [];
      switch(err){
        case Protocol.QUERY_SUCCESS:
          instancias.forEach(ins=>{
            lista.push(ins.Nombre)
          })
          call(lista);
          break;
        case Protocol.QUERY_BLOCK:
          alert("No tienes permiso de lectura de datos");
          break;
        case Protocol.QUERY_FAILURE:
          console.log("Error en la consulta: ", err);
          ErrorHandler.handelarError(err);
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