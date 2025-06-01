
/**
 * MATERIA: INGENIERÍA EN SOFTWARE
 * TEMA: DESARROLLO
 * NOMBRE DEL SISTEMA: PhotoCalendar
 * NOMBRE DEL EQUIPO DE DESARROLLO: PhotoCalendar
 * NOMBRE DE LOS ALUMNOS:
 *  Santiago Dominik Bañuelos de la Torre
 *  Emmanuel Rogelio Robles Dorado
 * FECHA:  Jueves 15/05/2025
 */
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

import { Usuario } from "./Proyecto/modelo/usuario.mjs";
import { Evento } from "./Proyecto/modelo/Evento.mjs";
import { Modelador } from "./Proyecto/modelo/Modelador.mjs";

const app = express();
const front = path.join(path.resolve("Proyecto"));
console.log(front)
/**
 * @type {Usuario}
 */
let usuario = null;

function verificarPermiso(permiso){
    return permiso || usuario.Es_Admin;
}
function handlePacket(packet, res){
    const data = packet.data;
    const object = packet.object;
    let errno = Protocol.QUERY_SUCCESS;
    //que tipo de paquete es
    switch(packet.header){

        case Protocol.QUERY:

            console.log("QUERY RECIBIDO: ", data);

            if(!verificarPermiso(usuario.Lectura)){
                console.log("lectura bloqueada a ", usuario);
                res.send(Protocol.paqueteQuery(Protocol.QUERY_BLOCK, tablaNombre, null));
                return;
            }
            //el usuario logeado si puede selectear
            ConexionBD.ejecutarRes(data, (err, result, fields)=>{
                
                if(err){
                    console.log("error en la consulta: ", err)
                    errno = err.errno;
                }
                res.send(Protocol.paqueteQuery(errno, object, result));
            })     
            break;

        case Protocol.INSERT:
            console.log("INSERT RECIBIDO: ", data);

            if(!verificarPermiso(usuario.Escritura)){
                console.log("escritura bloqueada a ", usuario);
                res.send(Protocol.paqueteInsert(Protocol.QUERY_BLOCK, tablaNombre, null));
                return;
            }
            //el usuario logeado si puede insertar
            ConexionBD.ejecutarRes(data, (err, result, fields)=>{
                console.log(result);
                if(err){
                    console.log("error en la insercion: ", err)
                    errno = err.errno;
                }
                res.send(Protocol.paqueteInsert(errno, object, result));
            })
            break;
        
        case Protocol.UPDATE:
            console.log("UPDATE RECIBIDO: ", data);
            if(!verificarPermiso(usuario.Escritura)){
                console.log("escritura bloqueada a ", usuario);
                res.send(Protocol.paqueteInsert(Protocol.QUERY_BLOCK, tablaNombre, null));
                return;
            }
            ConexionBD.ejecutarRes(data, (err, result, fields)=>{
                console.log(result);
                if(err){
                    console.log("error en la actualizacion: ", err)
                    errno = err.errno;
                }
                res.send(Protocol.paqueteUpdate(errno, object, result));
            })
            break;
        
        case Protocol.DELETE:
            console.log("DELETE RECIBIDO: ", data);
            if(!verificarPermiso(usuario.Escritura)){
                console.log("escritura bloqueada a ", usuario);
                res.send(Protocol.paqueteInsert(Protocol.QUERY_BLOCK, tablaNombre, null));
                return;
            }
            ConexionBD.ejecutarRes(data, (err, result, fields)=>{
                console.log(result);
                if(err){
                    console.log("error en la delecion: ", err)
                    errno = err.errno;
                }
                res.send(Protocol.paqueteDelete(errno, object, result));
            })
            break;
        case Protocol.QUERY_STACK: //repite el procesado de paquetes por cada instruccion del stack
            console.log("Multiples instrucciones: ", data);
            data.forEach(query=>{
                handlePacket(query, res);
            })
            break;
    } //varias instrucciones, costea mas usar transacciones
}
function handleRequest(req, res){
    if(usuario == null){
        res.send(Protocol.paqueteLogback());
        return;
    }
    try{
        const packet = Protocol.parse(req.body);
        handlePacket(packet, res);
    }catch(e){
        console.error("Paquete malformado: ", req.body)
    }
    
}

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(front));
app.use("/modelo", express.static(path.resolve("Proyecto/modelo")));
app.use("/controlador", express.static(path.resolve("Proyecto/controlador")))
//si ya esta logeado mandalo al control, si no entonces al login
app.get("/", (req, res)=>{
    res.redirect("/pages/index.html");
})
app.listen(5500, ()=>{
    console.log("sv prendido like");
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
                let datos = Protocol.paqueteLogin(null, Protocol.LOGIN_FAILURE);
                console.log(datos);
                res.send(datos);

                callback();
            } else {
                ConexionBD.ejecutarRes("USE PhotoCalendar", (err) => {
                    if (err) {
                        console.log("No tiene permitido utilizar la BD: ", err);
                        let datos = Protocol.paqueteLogin(null, Protocol.LOGIN_DENIED);
                        res.send(datos);
                        return;
                    }
                    //fuaa chaval hay que mandarle los permisos al usuario AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                    DAO.consultar("usuario", null, ['Nombre', 'Pass'], [user, pass], (err, ins) => {
                        if (err) {
                            console.log("valio pilin", err);
                        } else {
                            console.log(ins[0]);
                            ins[0].Pass = "pass";
                            let datos = Protocol.paqueteLogin(ins[0], 0);
                            console.log(datos);
                            res.send(datos);
                            console.log("conexion exitosa");
                            usuario = ins[0];
                        }

                        callback();
                    });

                });

            }
        })
    }).run();
})
app.post("/pages/panelControl.html", (req, res)=>{
    if(usuario == null){
        res.send(Protocol.paqueteLogback());
        return;
    }

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
//lo sabroso del protocolo
app.post("/pages/calendario.html", (req, res)=>{
    handleRequest(req, res);
})
app.post("/pages/inventario.html", (req, res)=>{
    handleRequest(req, res);
})
app.get("/pages/panelUsuario.html", (req, res)=>{
    res.redirect("/pages/panelUsuarios.html")
})
app.post("/pages/panelUsuarios.html", (req, res)=>{
    if(usuario == null || !usuario.Es_Admin){
        res.send(Protocol.paqueteLogback());
        return;
    }
    handleRequest(req, res);
})


Inicializador.iniciar2((err) => {
    if(err) return;
});









