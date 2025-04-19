import { Protocol } from "./protocol.mjs";
localStorage.clear();
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Capturar valores
    const username = event.target.user.value;
    const password = event.target.password.value;

    //console.log("Usuario:", username);
    //console.log("Contraseña:", password);

    let obj = {
      "user":username,
      "pass":password,
    }
    const xhttp = new XMLHttpRequest();

    //hacer el request de login y checar la respuesta del sv
    Protocol.enviarRequestJSON(obj, "index", (res)=>{
      let data = Protocol.getDatos(res);
      if(Protocol.getLoginEstado(data)){
        Protocol.guardarUser(data);
        Protocol.enviar("panelControl.html");
      }else{
        alert("Usuario o contraseña incorrectos, intente de nuevo");
        return;
      }
    })
    
  });