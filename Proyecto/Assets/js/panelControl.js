let user = Protocol.getUserDatos();
let admin = Protocol.userAdmin(user);

if(!admin){ //manejo de permisos
    
    document.getElementById("btnAdminUsers").hidden = true;
    //console.log(document.getElementById("btnAdminUsers").disabled)
}

document.getElementById("nombre").innerHTML = Protocol.getUserNombre(user);