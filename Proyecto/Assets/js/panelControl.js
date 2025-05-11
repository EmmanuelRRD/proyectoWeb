import { Protocol } from "./protocol.mjs";
let user = Protocol.getUserDatos();
console.log(user);
let admin = Protocol.userAdmin(user);

if(!admin){ //manejo de permisos
    
    document.getElementById("btnAdminUsers").hidden = true;
    //console.log(document.getElementById("btnAdminUsers").disabled)
}

document.getElementById("nombre").innerHTML = Protocol.getUserNombre(user);
document.getElementById("btnLogout").addEventListener("click", (ev)=>{
    console.log("logeo fuera");
    Protocol.enviarRequestJSON(Protocol.logout(), "panelControl", (res)=>{
        let datos = Protocol.getDatos(res);
        if(datos[0] == Protocol.LOGOUT_SUCCESS){
            Protocol.borrarUser();
            Protocol.enviarPagina("index");
        }else{
            alert("Error al cerrar sesion");
        }
    })
})
if(!admin){
    try{
        document.removeChild(document.getElementById("btnAdminUsers"));
    }catch(e){
        console.log("usr")
    }
    
}else document.getElementById("btnAdminUsers").addEventListener("click", (ev)=>{
    window.location.href = "panelUsuario.html";
})