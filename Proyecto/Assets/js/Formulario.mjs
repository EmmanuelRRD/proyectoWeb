import { Modelador } from "../../modelo/Modelador.mjs";
import { Modelo } from "../../modelo/Modelo.mjs";
import { Analizador } from "./Analizador.mjs";
import { Selector } from "./Seleccionador.mjs";

/**
 * Clase para crear formularios automaticamente.
 * Utiliza mapas para identificar datos de cada campo como:
 * la etiqueta de un campo, su HTML, tipo de dato, restricciones, etc.
 */
export class Formulario {
    /**
     * 
     * @param {string[]} nombres 
     * @param {string[]} tipoDatos 
     * @param {string[]} tipoComponentes 
     */
    constructor(nombres, labels, tipoDatos, tipoComponentes, exps, longitudes, nonulos, especiales){
        /**
         * Mapa de etiquetas, asocia el texto de una etiqueta al nombre de su respectivo campo
         * @type {Map<string, string>}
         */
        this.labels = new Map();
        /**
         * Mapa de campos, asocia a un HTML al nombre de su respectivo campo
         * @type {Map<string, HTMLDivElement>}
         */
        this.campos = new Map();

        /**
         * Mapa de tipos de dato, asocia un tipo de dato al nombre de su respectivo campo
         * @type {Map<string, string>}
         */
        this.tipoDatos = new Map();

        /**
         * Mapa de tipo de componente, asocia el tipo de HTML a generar con su respectivo campo
         * @type {Map<string, string}
         */
        this.tipoComponentes = new Map();

        /**
         * Mapa de expresiones regulares, asocia una expresion regular al nombre de su respectivo campo.
         * No se utiliza
         * @type {Map<string, RegExp | null>}
         */
        this.exps = new Map();
        
        /**
         * Mapa de longitudes, asocia una longitud máxima de caracteres a su respectivo campo
         * @type {Map<string, number>}
         */
        this.longitudes = new Map();

        /**
         * Mapa de no nulos, asocia si un campo puede o no contener caracteres nulos
         * @type {Map<string, boolean>}
         */
        this.nonulos = new Map();

        /**
         * Mapa de caracteres especiales, asocia una lista de caracteres especiales permitidos en su respectivo campo
         * @type {Map<string, string[]>}
         */
        this.especiales = new Map();

        ///botones genericos para formularios
        this.btnEnviar = null;
        this.btnLimpiar = null;
        this.btnCancelar = null;
        this.btnEliminar = null;
        let i = 0;
        /**
         * popula los mapas del formulario, asigna el nombre del campo a su HTML, tipo de dato, tipo de componente, etiqueta, etc
         */
        nombres.forEach(nom=>{
            this.campos.set(nom, document.createElement("div"))
            this.campos.get(nom).setAttribute("class", "campo");

            this.tipoDatos.set(nom, tipoDatos[i]);
            this.tipoComponentes.set(nom, tipoComponentes[i]);
            this.labels.set(nom, labels[i]);
            this.exps.set(nom, exps[i]);
            this.longitudes.set(nom, longitudes[i]);
            this.nonulos.set(nom, nonulos[i]);
            this.especiales.set(nom, especiales[i]);
            i++;
        })
    }
    /**
     * crea los elementos HTML de cada campo en base a la informacion de cada mapa en el formulario
     */
    generar(){
        //iterar sobre cada campo para generar y configurar su label e input
        this.campos.forEach((campo, nombre)=>{
            let input = Formulario.obtenerComponente(this.tipoComponentes.get(nombre));
            let label = document.createElement("label");
            
            campo.setAttribute("id", nombre);
            input.setAttribute("id", "input_"+nombre);
            
            label.htmlFor = "input_"+nombre
            label.innerHTML = this.labels.get(nombre);
            campo.appendChild(label);
            campo.appendChild(input);
        })

    }
    /**
     * Recupera el campo del formulario que tenga el nombre especificado, le agrega una nueva opcion solo si es un elemento Select
     * @param {string} nombre nombre del campo en el formulario 
     * @param {any} valor valor real de la nueva opcion
     * @param {string} texto texto a mostrar para la nueva opcion
     */
    agregarOpcionA(nombre, valor, texto){
        let campo = this.campos.get(nombre);
        let inp = campo.children.namedItem("input_"+nombre);
        if(!(inp instanceof HTMLSelectElement)){
            console.log("El elemento no puede tener opciones: ", inp);
            console.log(nombre, campo.children)
        }else{
            inp.appendChild(Formulario.generarOpcion(valor, texto));
        }
    }
    /**
     * Genera un elemento HTML para el formulario en base al tipo de componente especificado
     * @param {string} nombre el tipo de componente que se desea crear
     * @returns {HTMLInputElement | HTMLSelectElement} elemento configurado
     */
    static obtenerComponente(nombre){
        //es nomas un switch que checa el tipo de componente para crear y configurar un poquito un html
        let comp = null;
        switch(nombre){
            case "text":
            case "date":
            case "checkbox":
                comp = document.createElement("input");
                comp.type = nombre;
                break;
            case "select":
                comp = document.createElement("select");
                comp.appendChild(this.generarOpcion(null, "Escoja una opción"))
                break;
            default:
                console.log("DESCONOCIDO: ", nombre);
                
        }
        return comp;
    }
    /**
     * Genera un elemento Option con el valor y texto dados para agregarlo a un elemento Select de HTML
     * @param {any} valor valor real que tiene la opcion 
     * @param {string} txt el texto que se mostrara para la opcion
     * @returns {HTMLOptionElement} elemento HTMLOption configurado
     */
    static generarOpcion(valor, txt){
        let op = document.createElement("option");
        op.value = valor;
        op.innerHTML = txt;
        return op;
    }
    /**
     * genera los elementos del formulario y los agrega al html
     * @param {HTMLDivElement} html div contenedor del formulario
     */
    attach(html){
        this.generar();
        this.campos.forEach(campo=>{
            html.children.namedItem("campos").appendChild(campo);
        })
        this.btnEnviar = Formulario.crearBoton("btnEnviar", "green", "white", "Confirmar");
        this.btnLimpiar = Formulario.crearBoton("btnLimpiar", "white", "black", "Limpiar datos");
        this.btnCancelar = Formulario.crearBoton("btnCancelar", "white", "red", "Cancelar");
        this.btnEliminar = Formulario.crearBoton("btnEliminar", "red", "white", "Eliminar");

        html.children.namedItem("botones").appendChild(this.btnEnviar);
        html.children.namedItem("botones").appendChild(this.btnLimpiar);
        html.children.namedItem("botones").appendChild(this.btnCancelar);
        html.children.namedItem("botones").appendChild(this.btnEliminar);
    }
    /**
     * Genera un boton
     * @param {string} id 
     * @param {string} backgroundColor 
     * @param {string} color 
     * @param {string} texto 
     * @returns {HTMLButtonElement} boton simple configurado
     */
    static crearBoton(id, backgroundColor, color, texto){
        let btn = document.createElement("button");

        btn.setAttribute("class", "btn");
        btn.setAttribute("id", id);
        btn.style.backgroundColor = backgroundColor;
        btn.style.color = color;
        btn.innerHTML = texto;
        return btn;
    }
    /**
     * Inicia un formulario (sin HTMLs todavia) a partir de los datos del modelo especificado
     * @param {typeof Modelo} modelo 
     */
    static crearDeModelo(modelo){
        //agarra toda la info del modelo y metesela al formulario
        let f = new Formulario(
            Object.keys(new modelo),
            modelo.labels(),
            modelo.tiposSQL(),
            modelo.componentes(),
            modelo.exps(),
            modelo.longitudes(),
            modelo.noNulos(),
            modelo.especiales(),
        )
        return f;
    }
    /**
    * @returns {HTMLInputElement | HTMLSelectElement}
    */
    getInput(campoNombre){    
        return this.campos.get(campoNombre).children.namedItem("input_"+campoNombre);
    }
    /**
     * recupera los datos de los campos del formulario, los organiza en un mapa
     * @returns {Map<string, string>}
     */
    obtenerInformacion(){
        let o = new Map();
        //itera en cada campo y saca info de su HTML
        this.campos.forEach((campo, nombre)=>{
            /**
             * @type {HTMLInputElement | HTMLSelectElement}
             */
            let info = campo.children.namedItem("input_"+nombre);
            
            /**
             * tanto el input element como el select usan .value para guardar el dato, solo es necesario sacarlo
             * pero los checkbox no xd
             */
            //console.log(info, nombre, info.type);
            
            if(info instanceof HTMLInputElement && info.type == "checkbox") o.set(nombre, info.checked);
            else o.set(nombre, info.value);
        })
        return o;
    }
    limpiar(){
        this.campos.forEach((campo, nombre)=>{
            /**
             * @type {HTMLInputElement | HTMLSelectElement}
             */
            let input = campo.children.namedItem("input_"+nombre);
            if(input instanceof HTMLInputElement) input.value = "";
            else input.value = "null";
        })
    }
    /**
     * obtiene los codigos de validacion de todos los campos del formulario, los organiza en un mapa
     * @param {Formulario} form formulario a validar
     * @returns {Map<string, number>} mapa con el nombre de los campos y su codigo de error
     */
    static validar(form){
        let o = new Map();
        let info = form.obtenerInformacion();
        //itera sobre los datos de cada campo y los checa con el analizador
        info.forEach((dato, nombre)=>{
            //hay que darle la informacion (tipo de dato, longitud, etc...) del campo al analizador
            let val = Analizador.revisarDato(""+dato, form.tipoDatos.get(nombre), form.exps.get(nombre), form.longitudes.get(nombre), form.nonulos.get(nombre))
            o.set(nombre, val);
        })
        return o;
    }
    /**
     * obtiene los datos del formulario
     * @param {Formulario} form 
     */
    static extraer(form){
        let o = [];
        let info = form.obtenerInformacion();
        //pon cada dato en un arreglo
        info.forEach((dato, nombre)=>{
            o.push(Analizador.procesar(dato, form.tipoDatos.get(nombre)));
        })
        return o;
    }
   
    accionConfirmar(call=(ev)=>{return}){
        this.btnEnviar.onclick = call;
    }
    accionLimpiar(call=(ev)=>{return}){
        this.btnLimpiar.onclick = call;
    }
    accionCancelar(call=(ev)=>{return}){
        this.btnCancelar.onclick = call;
    }
    accionEliminar(call=(ev)=>{return}){
        this.btnEliminar.onclick = call;
    }
    /**
     * 
     * @param {Modelo} modelo 
     * @param {*} id 
     * @returns {HTMLTableRowElement}
     */
    static crearRegistro(modelo, id){

        let r = document.createElement("tr");
        r.setAttribute("id", id);
        
        let datos = modelo.getDatos();
        let noms = Modelador.getCamposNombre(modelo.constructor.name);
        let i = 0;
        //dice q es funcion pero es un dato
        datos.forEach((dato)=>{
            let th = document.createElement("th");
            th.setAttribute("id", noms[i]);
            th.innerHTML = dato;
            r.appendChild(th);
            i++;
        })
        let btnEditar = this.makeBotonTabla("bx bx-edit", id+"_editar");
        let btnEliminar = this.makeBotonTabla("bx bx-trash", id+"_eliminar");
        let td1 = document.createElement("td");
        td1.appendChild(btnEditar);
        let td2 = document.createElement("td");
        td2.appendChild(btnEliminar);

        r.appendChild(td1);
        r.appendChild(td2);
        //agregar quiza

        
        //agregar botones
        return r;   
    }
    static crearRegistroCalls(modelo, id, editar=(ev, row)=>{}, eliminar=(ev, row)=>{}){
        
        let r = document.createElement("tr");
        r.setAttribute("id", id);
        
        let datos = modelo.getDatos();
        let noms = Modelador.getCamposNombre(modelo.constructor.name);
        let i = 0;
        //dice q es funcion pero es un dato
        datos.forEach((dato)=>{
            let th = document.createElement("th");
            th.setAttribute("id", noms[i]);
            th.innerHTML = dato;
            r.appendChild(th);
        })
        let btnEditar = this.makeBotonTabla("bx bx-edit", id+"_editar");
        let btnEliminar = this.makeBotonTabla("bx bx-trash", id+"_eliminar");
        let td1 = document.createElement("td");
        td1.appendChild(btnEditar);
        let td2 = document.createElement("td");
        td2.appendChild(btnEliminar);

        btnEditar.addEventListener("click", (ev)=>{
            editar(ev, r);
        });
        btnEliminar.addEventListener("click", (ev)=>{
            
            
            eliminar(ev, r);
        });

        r.appendChild(td1);
        r.appendChild(td2);
        //agregar quiza

        
        //agregar botones
        return r;   
    }
    /**
     * @param {HTMLTableElement} tabla 
     * @param {Modelo[]} modelos 
     * @param {string} idNombre 
     */
    static agregarRegistros(tabla, modelos, idNombre){
        modelos.forEach(modelo=>{
            console.log("REGISTRO: ", modelo, modelo[idNombre]);
            
            let r = this.crearRegistro(modelo, modelo[idNombre]);
            tabla.tBodies[0].appendChild(r);
        })
    }
    static agregarRegistrosCalls(tabla, modelos, idNombre, editar=(ev)=>{}, eliminar=(ev)=>{}){
        modelos.forEach(modelo=>{
            
            let r = this.crearRegistroCalls(modelo, modelo[idNombre], editar, eliminar);
            tabla.tBodies[0].appendChild(r);
        })
    }
    /**
     * 
     * @param {HTMLTableElement} tabla 
     */
    static resetearRegistros(tabla){
        let bd = tabla.tBodies[0]
        while(bd.lastChild){
            if(bd.childElementCount == 1) break;
            bd.removeChild(bd.lastChild)
        }
    }
    static actualizarTabla(tabla, modelos, idxNombre){
        this.resetearRegistros(tabla);
        this.agregarRegistros(tabla, modelos, idxNombre);
    }
    static actualizarTablaCalls(tabla, modelos, idxNombre, editar=(ev)=>{}, eliminar=(ev)=>{}){
        this.resetearRegistros(tabla);
        this.agregarRegistrosCalls(tabla, modelos, idxNombre, editar, eliminar);
    }
    static makeBotonTabla(iconoClass, id){
        let btn = document.createElement("button");
        btn.setAttribute("id", id);
        btn.setAttribute("class", "btnTabla")
        let icon = document.createElement("i");
        icon.setAttribute("class", iconoClass);

        btn.appendChild(icon);
        return btn;
    }
    /**
     * rellena automaticamente una tabla con la lista de registros, define acciones de actualizacion y eliminacion de los botones de cada uno. 
     * Necesita funciones de consulta global, consulta por id y eliminacion por id para definir el comportamiento de los botones. 
     * Al eliminar un registro, se llama al metodo refrescarTabla.
     * @param {HTMLTableElement} tabla tabla HTML a rellenar
     * @param {Modelo[]} lista lista de modelos a mostrar
     * @param {string} idNombre nombre de la ID del modelo
     * @param {((lista)=>{})=>{}} consultaGlobal funcion de consulta global
     * @param {(id, (lista)=>{})=>{}} consulta funcion de consulta por ID
     * @param {(id, (datos)=>{})=>{}} eliminacion funcion de eliminacion por ID
     */
    static rellenarTabla(tabla, lista, idNombre, consultaGlobal=(call=(lista)=>{})=>{}, consulta=(id, call=(lista)=>{})=>{}, eliminacion=(id, call=(datos)=>{})=>{}){
        Formulario.actualizarTablaCalls(tabla, lista, idNombre,
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
                    
                    for(const field in mod){
                        let elem = document.getElementById("c"+field);
                        if(elem == null) continue;
                        elem.setAttribute("value", ""+mod[field]);
                    }
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
                    this.refrescarTabla(tabla, idNombre, consultaGlobal, consulta, eliminacion);
                });
                
        });
    }
    /**
     * limpia la tabla, realiza una consulta global y llama a la funcion de rellenado con la lista obtenida. 
     * Necesita funciones de consulta global, consulta por id y eliminacion por id para el rellenado de la tabla. 
     * @param {HTMLTableElement} tabla 
     * @param {string} idNombre 
     * @param {((lista)=>{})=>{}} consultaGlobal funcion de consulta global
     * @param {(id, (lista)=>{})=>{}} consulta funcion de consulta por ID
     * @param {(id, (datos)=>{})=>{}} eliminacion funcion de eliminacion por ID
     */
    static refrescarTabla(tabla, idNombre, consultaGlobal=(l=(call)=>{}), consulta=(id, l=(lista)=>{}), eliminacion=(id, l=(datos)=>{})){
        Formulario.resetearRegistros(tabla);
        consultaGlobal((lista)=>{
            this.rellenarTabla(tabla, lista, idNombre, consulta, eliminacion);
        })
    }
}