//el diablo
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const DAO = require("./controlador/DAO");
const ConexionBD = require("./ConexionBD/ConexionBD");
const Encadenador = require("./Encadenador/Encadenador");
const Inicializador = require("./ConexionBD/Inicializador");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const conexionBD = require("./ConexionBD/ConexionBD");

import { Protocol } from "./Proyecto/Assets/js/protocol.mjs";
//cargar cada mendigo modelo porque si no no se agregan al modelador :>
import { Usuario } from "./Proyecto/modelo/usuario.mjs";
import { Evento } from "./Proyecto/modelo/Evento.mjs";
import { Modelador } from "./Proyecto/modelo/Modelador.mjs";

const app = express();
const front = path.join(path.resolve("Proyecto"));
console.log(front)
let usuario = null;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(front));
app.use("/modelo", express.static(path.resolve("Proyecto/modelo")));

//si ya esta logeado mandalo al control, si no entonces al login
app.get("/", (req, res)=>{
    console.log("a gion")
    res.redirect("/pages/index.html");
})
app.listen(8080, ()=>{
    console.log("SI")
})

app.post("/pages/index.html", (req, res)=>{
    console.log(req.body)
    const { user, pass } = req.body;
    //res.send("Datos recibidos: ", user, pass);
    console.log("INICIO DE SESION DE: ", user, pass);

    new Encadenador().then(callback=>{
        ConexionBD.desconectar((err)=>{callback()});
    }).then(callback=>{
        conexionBD.conectarRes(user, pass, false, (err)=>{
            if(err){
                console.log(err.code);
                let datos = Protocol.paqueteLogin(null, 1);
                console.log(datos);
                res.send(datos);

                callback();
            }else{
                ConexionBD.ejecutar("USE PhotoCalendar");   
                //fuaa chaval hay que mandarle los permisos al usuario AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                DAO.consultar("usuario", null, ['Nombre', 'Pass'], [user, pass], (err, ins)=>{
                    if(err){
                        console.log("valio pilin", err);
                    }else{
                        console.log(ins[0]);
                        let datos = Protocol.paqueteLogin(ins[0], 0);
                        console.log(datos);
                        res.send(datos);
                        console.log("conexion exitosa");
                        usuario = ins[0];
                    }

                    callback();
                });
            }
        })
    }).run();
})
app.post("/pages/panelControl.html", (req, res)=>{
    const { data } = req.body;
    console.log("sasca: ", data);
    if(data[0] == Protocol.LOGOUT){
        console.log("paquete desconectambo");
        ConexionBD.desconectar((err)=>{
            console.log("desconectando.. ");
            if(err){
                let p = Protocol.paqueteLogout(Protocol.LOGOUT_FAILURE);
                console.log(err);
                res.send(p);
            }else{
                console.log("Usuario desconectado: ") //poner datos de usuario
                usuario = null;
                res.send(Protocol.paqueteLogout(Protocol.LOGOUT_SUCCESS));
            }
        })
    }
    else{
        console.log("request desconocido: ", data);
    }
})

//lo sabroso
app.post("/pages/calendario.html", (req, res)=>{
    if(usuario == null){
        res.send(Protocol.paqueteLogback());
        return;
    }
    const header = req.body.data[0];
    switch(header){
        case Protocol.QUERY:

            if(!usuario.Lectura && !usuario.Es_Admin){
                console.log("lectura bloqueada a ", usuario);
                res.send(Protocol.paqueteQuery(Protocol.QUERY_BLOCK, tablaNombre, null));
                return;
            }
            const { tablaNombre, seleccionNombres, filtroNombres, filtroValores } = req.body;
            console.log("CONSULTA A ", tablaNombre, seleccionNombres, filtroNombres, filtroValores);
            DAO.consultar(tablaNombre, seleccionNombres, filtroNombres, filtroValores, (err, result)=>{
                console.log(result);
                if(err) res.send(Protocol.paqueteQuery(Protocol.QUERY_FAILURE, tablaNombre, null));
                else res.send(Protocol.paqueteQuery(Protocol.QUERY_SUCCESS, tablaNombre, result.length));
            })
            break;
        case Protocol.INSERT:
            
            if(!usuario.Lectura && !usuario.Es_Admin){
                console.log("escritura bloqueada a ", usuario);
                res.send(Protocol.paqueteQuery(Protocol.QUERY_BLOCK, tablaNombre, null));
                return;
            }
            let datos = Protocol.getQueryDatos(JSON.stringify(req.body));
            const mod = Modelador.instanciar(datos.modelo, datos.data);

            DAO.agregarRes(mod, (err, result, fields)=>{
                if(err) {
                    console.error("Error al agregar el registro", err);
                    res.send(Protocol.paqueteAgregar(Protocol.QUERY_FAILURE, datos.modelo, null));
                }
                else {
                    console.log("Nuevo registro agregado a: ", datos.modelo);
                    res.send(Protocol.paqueteAgregar(Protocol.QUERY_SUCCESS, datos.modelo, null));
                }
            })
            
            break;
    }
})
const configura = new Encadenador();

configura.then((callback)=>{
    //ConexionBD.iniciar(callback);
    Inicializador.iniciar(callback);

}).then((callback)=>{
    ConexionBD.conectar("admin", "admin", true, callback);
}).then((callback)=>{
    let userio = new Usuario("Juanin", "12345");
    userio.Es_Admin = true;

    
    DAO.agregarUsuario(userio, callback);
    
}).then(callback=>{
    console.log("ENVIEN AYUDA")
    callback();
});
configura.run();

let dios = new Usuario("Dios", "9999");
dios.Lectura=true;
dios.Escritura=true;
    
DAO.agregarUsuario(dios, ()=>{});










