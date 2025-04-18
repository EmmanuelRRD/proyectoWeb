const mysql = require('mysql');
const async = require('async');
const fs = require('fs');
const readline = require('readline');

const config = require('../Datos/config');
const path = require('path');
const Encadenador = require('../Encadenador/Encadenador');
class ConexionBD {
    /**
     * Se conecta mediante root al servidor para crear los objetos de la BD
     * @param {string} contraseniaRoot 
     */
    iniciar(callback){

        //CREACION DEL ADMINISTRADOR

        let user = `'${config.init.adminUser}'@'localhost'`;
        let pass = `'${config.init.adminPass}'`;
        let enc = new Encadenador();
        enc.wipe()
        .then((callback)=>{
            console.log("Iniciando configuraciones...")
            this.conectar("root", config.init.rootPass, true, callback);
        }).then((callback)=>{
            console.log("Preparando cuenta de administrador...")
            this.ejecutar(`CREATE USER IF NOT EXISTS ${user} IDENTIFIED WITH mysql_native_password BY ${pass}`, callback);
        }).then((callback)=>{
            this.ejecutar(`ALTER USER ${user} IDENTIFIED WITH mysql_native_password BY ${pass}`, callback);
        }).then((callback)=>{
            this.ejecutar(`GRANT ALL PRIVILEGES ON *.* TO ${user} WITH GRANT OPTION`, callback);
        }).then((callback)=>{
            this.ejecutar("FLUSH PRIVILEGES", callback);
        })
        
        enc.run().then((value)=>{
            console.log("Administrador actualizado");

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
                this.ejecutar(scrip, () => {
                    console.log("Base de datos cargada con exito");
                    this.desconectar();
                    callback();
                });
            });
        }, (reason)=>{
            console.log("valio pilin", reason)
        });
        enc.wipe();
        enc = null;
    }
    conectar(usuario, contrasenia, multi=false, callback=()=>{}){
        try{
            
            this.conexion = mysql.createConnection({

                host:"localhost",
                user:usuario,
                password:contrasenia,
                multipleStatements:true,
            })
        }catch(err){
            console.error(err.errno+ ": Los datos de conexion son incorrectos: ", usuario, contrasenia);
            return;
        }
        this.conexion.connect((error)=>{
            if(error){
                console.error("Conexion fallida:", usuario, contrasenia, error.code);
                throw error;
            }
            callback();
        })
    }
    conectarRes(usuario, contrasenia, multi=false, callback=(error)=>{}){
        try{
            
            this.conexion = mysql.createConnection({

                host:"localhost",
                user:usuario,
                password:contrasenia,
                multipleStatements:true,
            })
        }catch(err){
            console.error(err.errno+ ": Los datos de conexion son incorrectos: ", usuario, contrasenia);
            return;
        }
        this.conexion.connect(callback)
    }
    desconectar(){
        if(this.conexion.state == "connected") this.conexion.end();
    }
    ejecutar(consulta, callback=()=>{}){
        let rs = null
        this.conexion.query(consulta, (err, result, fields)=>{
            if(err){
                console.error("Consulta fallida: ", consulta);
                
                throw err;
            }
            callback();
            rs = result
        })
        
    }
}
const conexionBD = new ConexionBD();

module.exports = conexionBD;