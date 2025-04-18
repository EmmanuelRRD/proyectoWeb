const DAO = require("./controlador/DAO");
const ConexionBD = require("./ConexionBD/ConexionBD");
const Modelador = require("./modelo/Modelador")
const Usuario = require("./modelo/usuario");
const Encadenador = require("./Encadenador/Encadenador");

//const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const conexionBD = require("./ConexionBD/ConexionBD");
const port = 8080;

const front = path.join(__dirname, "Proyecto")
console.log(front)

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(front));

app.listen(8080, ()=>{
    console.log("SI")
})

app.get("/", (req, res)=>{
    res.redirect("/pages");
})

app.post("/pages/", (req, res)=>{
    console.log(req.body)
    const { user, pass } = req.body;
    //res.send("Datos recibidos: ", user, pass);
    console.log("INICIO DE SESION DE: ", user, pass);

    ConexionBD.desconectar();
    conexionBD.conectarRes(user, pass, false, (err)=>{
        if(err){
            console.log(err.code);
            res.send("1");
        }else{
            res.send("0");
            console.log("conexion exitosa");
            //res.redirect("/pages/panelControl.html");
        }
        
    })
})

const configura = new Encadenador();

configura.then((callback)=>{
    ConexionBD.iniciar(callback);
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











