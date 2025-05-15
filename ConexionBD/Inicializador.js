const fs = require("fs");
const readline = require("readline");
const DAO = require("../controlador/DAO");
const config = require("../Datos/config");
const Encadenador = require("../Encadenador/Encadenador");
const { Usuario } = require("../Proyecto/modelo/usuario.mjs");
const conexionBD = require("./ConexionBD");

class Inicializador {
    constructor(){}
    static iniciar(callback){
        let user = `'${config.init.adminUser}'@'localhost'`;
        let pass = `'${config.init.adminPass}'`;
        let enc = new Encadenador();
        enc.wipe()
        .then(callback=>{
            console.log("Iniciando configuraciones...")
            conexionBD.conectarRes("root", config.init.rootPass, true, (err)=>{
                if(err){
                    console.log("ERROR DE CONEXION: ", err);
                    return;
                }
                callback();
            })
        })
        .then(callback=>{

            ///CARGAR EL SCRIPT

            console.log("Iniciando Base de Datos... ");

            let rl = readline.createInterface({
                input: fs.createReadStream("Script/PhotoCalendar.sql"),
                terminal: false,
            })

            let scrip = "";
            rl.on("line", (linea) => {
                scrip += linea;
            })
            rl.on("close", () => {
                conexionBD.ejecutarRes(scrip, (err) => {
                    if(err) {
                        console.log("Error al cargar la BD", err);
                        return;
                    }
                    
                    console.log("Base de datos cargada con exito");
                    callback();
                    //conexionBD.desconectar();
                    //callback();
                });
            });
        }).then(callback=>{
            console.log("Preparando cuenta de administrador...")
            let admin = new Usuario(config.init.adminUser, config.init.adminPass);
            admin.Es_Admin = true;
            DAO.agregarUsuario(admin, callback);
        }).run().then(()=>{
            console.log("administrador registrado exitosamente, considere actualizar los datos");
        })
    }
    static iniciar2(after=(err)=>{}) {
        
        console.log("Iniciando configuraciones...")
        conexionBD.conectarRes("root", config.init.rootPass, true, (err) => {
            if (err) {
                console.log("ERROR DE CONEXION: ", err);
                return;
            }
            ///CARGAR EL SCRIPT
            console.log("Iniciando Base de Datos... ");

            let rl = readline.createInterface({
                input: fs.createReadStream("Script/PhotoCalendar.sql"),
                terminal: false,
            })

            let scrip = "";
            rl.on("line", (linea) => {
                scrip += linea;
            })
            rl.on("close", () => {
                conexionBD.ejecutarRes(scrip, (err) => {
                    if (err) {
                        console.log("Error al cargar la BD", err);
                        return;
                    }

                    console.log("Base de datos cargada con exito");

                    console.log("Preparando cuenta de administrador...")
                    let admin = new Usuario(config.init.adminUser, config.init.adminPass);
                    admin.Es_Admin = true;
                    DAO.agregarUsuario(admin, (err) => {
                        console.log("administrador registrado exitosamente, considere actualizar los datos");
                    });


                });
            });

        })
    }
}

module.exports = Inicializador;