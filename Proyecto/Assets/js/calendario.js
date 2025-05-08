import { DAO } from "../../controlador/DAO.mjs";
import { Evento } from "../../modelo/Evento.mjs";
import { Modelador } from "../../modelo/Modelador.mjs";
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
const day = now.getDate();

let ID_DIA_SELECCIONADO = -1;

/**
 * Catalogo de paquetes fotograficos, ID y nombre de paquete(?)
 * @type {Map<number, string>}
 */
const paquetesFotograficos = new Map()
.set(1, "Paquete 1");
/**
 * Catalogo de eventos, ID y tipo de evento
 * @type {Map<number, string>}
 */
const tiposEvento = new Map()
.set(1, "Evento 1");
/**
 * Catalogo de modelos, ID y nombre
 * @type {Map<string, string>}
 */
const modelos = new Map()
.set(1, "Modelo 1");


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
      const date = `${anio}-${mes + 1}-${dia}`;
      console.log(`Fecha completa: ${date}`);

      

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
          form.agregarOpcionA("Tipo_Evento", eventoID, evento);
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
            let data = Formulario.extraer(form);
            
            
            let modelo = Modelador.instanciar(Evento.name, data);
            //si no hay un dia seleccionado, agrega
            //si si hay, actualizalo
            if(ID_DIA_SELECCIONADO == -1){
              requestAgregarModelo(modelo, (cod)=>{
                consultarMes(year, month, (lista=>{
                  pintarDiasEventos(lista);    
                })); // de 0- delante
              });  
            }else {//verificar usuario y permiso
              let usr = Protocol.getUserNombre(Protocol.getUserDatos());
              nombreEncargadoDeEvento(ID_DIA_SELECCIONADO, (nom)=>{

                if(nom != usr  && !Protocol.userAdmin(Protocol.getUserDatos())){
                  alert("No puedes editar eventos de otros empleados.")
                  return;
                }

                DAO.queryCambiarModelo("calendario", modelo, [ID_DIA_SELECCIONADO], (res)=>{
                  consultarMes(year, month, (lista=>{
                    pintarDiasEventos(lista);    
                  })); // de 0- delante
                })

              })
              
            }
          }
        })
        form.accionLimpiar((ev)=>{
          form.limpiar();
        })
        form.accionCancelar((ev)=>{
          frame.remove();
        })
        form.accionEliminar((ev)=>{
          
          if(ID_DIA_SELECCIONADO == -1){
            alert("No hay nada para eliminar")
            return;
          }

          let usr = Protocol.getUserNombre(Protocol.getUserDatos());
          nombreEncargadoDeEvento(ID_DIA_SELECCIONADO, (nom)=>{

            if(nom != usr  && !Protocol.userAdmin(Protocol.getUserDatos())){
              alert("No puedes eliminar eventos de otros empleados.")
              return;
            }

            DAO.queryEliminarPrimaria("calendario", "Evento", ID_DIA_SELECCIONADO, (datos)=>{
              let datos2 = Protocol.getDatos(datos);
              switch(datos2.status){
                case Protocol.QUERY_SUCCESS:
                  consultarMes(year, month, (lista=>{
                    alert("Evento eliminado")
                    pintarDiasEventos(lista);    
                  })); // de 0- delante
                  break;

                case Protocol.QUERY_BLOCK:
                  alert("No tiene permiso para eliminar eventos");
                  break;
                default:
                  console.log("Error de eliminacion: ", datos2.status);
                  ErrorHandler.handelarError(datos2.status);
              }
              
            });

          })
          
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

        //si el dia ya tenia un evento, ponle los datos en el formler
        //si no, entonces solo se autorrellenan las fechas con las de hoy
        consultarFechaInicio(date, (lista)=>{
          if(lista.length == 0){
            ID_DIA_SELECCIONADO = -1;
            let datler = Analizador.formatearDate(new Date(`${year}-${month+1}-${i}`));
            console.log("Nuevoevento ",datler);
            
            form.getInput("Fecha_Inicio").value = datler;
            form.getInput("Fecha_Fin").value = datler;
            return;
          }
          /**
          * @type {Evento}
          */
          let ev = lista[0];
          //guardar la ID original para editar el evento y poderle cambiar la llave primaria
          
          ID_DIA_SELECCIONADO = ev.Id; 
          ///los campos del form se llaman igual al modelo, se puede usar pa ponerle sus respectivos datos al form sencillon
          form.campos.forEach((campoDiv, nombre)=>{
            let input = form.getInput(nombre);
            input.value = ev[nombre];
            //console.log("Colocado: ", nombre, input, ev[nombre]);
            
          })
        })

      };

      document.body.appendChild(frame);
    });

    daysContainer.appendChild(dayBtn);
    dias.set(i, dayBtn);

  }

  consultarMes(year, month, (lista=>{
    pintarDiasEventos(lista);    
  })); // de 0- delante
}

function nombreEncargadoDeEvento(ID_Evento, call=(nombre)=>{}){
  DAO.queryConsultar("calendario", "Evento", ["Nombre_Empleado"], ["Id"], [ID_Evento], (err, lista)=>{
    
    switch(err){
  
      case Protocol.QUERY_SUCCESS:
        /**
        *@type {Evento}
        */
        let ev = lista[0];
        call(ev.Nombre_Empleado)
        break;
  
      case Protocol.QUERY_BLOCK:
  
        console.log("CONSULTA BLOQUEADA: ", lista);
        break;
  
      default:
  
        console.log("ERROR EN LA CONSULTA: ", err);
        break;
    }
  })
consultarMes
}
function getProximidad(fecha){
  let date = new Date(fecha)
  let diffMilis = date.getTime()-now.getTime();
  return new Date(diffMilis);
  
}
function pintarDiasEventos(lista){
  let diaMenor = 33;
  lista.forEach(ev=>{
    let dia = dias.get(obtenerInicioEvento(ev)+1);
    let diff = getProximidad(ev.Fecha_Inicio+"T00:00");
    
    if(diff.getTime() < 0) {
      console.log("griso");
      
      pintarDia(dia, "gray");
      return;
    }
    if(diff.getDate() > 2) pintarDia(dia, "yellow"); 
    else if(diff.getDate() > 0){
      pintarDia(dia, "orange");
      diaMenor = Math.min(diff.getDate(), diaMenor);
    }
    else if(diff.getDate() == 0){
      pintarDia(dia, "red");
      diaMenor = Math.min(diff.getDate(), diaMenor);
    }
  })
  if(diaMenor == 0){
    
    alert("Evento HOY ")
  }else if(diaMenor < 32){
    
    alert("Evento próximo en " + diaMenor + " días")
  }
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
function consultarMes(anio, mes, callback=(lista)=>{return}){
  DAO.queryConsultar("calendario", "evento", null, ["YEAR(Fecha_Inicio)", "MONTH(Fecha_Inicio)"], [anio, mes+1], (err, lista)=>{
    switch(err){
  
      case Protocol.QUERY_SUCCESS:
  
        callback(lista);
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
function consultarFechaInicio(fecha, callback=(lista)=>{return}){
  DAO.queryConsultar("calendario", "evento", null, ["Fecha_Inicio"], [fecha], (err, lista)=>{
    switch(err){
  
      case Protocol.QUERY_SUCCESS:
  
        console.log("CONSULTA EXITOSA: ", lista);
        callback(lista);
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
/**
 * pinta el dia especificado
 * @param {HTMLElement} dias
 * @param {string} color 
 */
function pintarDia(dias, color){
  dias.style.backgroundColor = color;
}
/**
 * obtiene el dia de inicio del evento dado
 * @param {Evento} ev
 */
function obtenerInicioEvento(ev){
  
   return new Date(ev.Fecha_Inicio).getDate();
}
/**
* obtiene el dia de fin del evento dado
 * @param {Evento} ev
 */
function obtenerFinEvento(ev){
  return new Date(ev.Fecha_Fin).getDate();
}


function requestAgregarEvento(id, fecha_inicio, empleado, nombre_cliente, apellido_cliente, nombre_modelo, paquete_fotografico, tipo_evento, fecha_fin){
  let ev = new Evento(id, fecha_inicio, empleado, nombre_cliente, apellido_cliente, nombre_modelo, paquete_fotografico, tipo_evento, fecha_fin);
  DAO.queryAgregar(ev, "calendario", (datos)=>{
      
      
      switch(datos.status){

        case Protocol.QUERY_SUCCESS:

          console.log("INSERCION EXITOSA")
          consultarMes(year, month, (lista)=>{
            lista.forEach(ev=>{
              console.log(obtenerInicioEvento(ev));
              
            })
          });
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
function requestAgregarModelo(modelo, call=(code)=>{return}){
  
  DAO.queryAgregar(modelo, "calendario", (datos)=>{
    
    switch(datos.status){

      case Protocol.QUERY_SUCCESS:

        console.log("INSERCION EXITOSA")
        call(datos);
        break;

      case Protocol.QUERY_BLOCK:
        alert("No tiene permitido insertar eventos");
        console.log("INSERCION BLOQUEADA")
        break;

      default:
        console.log("Error de instruccion: ", datos.status);
        ErrorHandler.handelarError(datos.status);
    }
})
}

consultarMes(year, month);

//requestAgregarEvento(7, `${year}-${month+1}-${day}`, "Dios", "El Jersa", "Jerusalem", 1, 1, 1, `${year}-${month+1}-${day}`);