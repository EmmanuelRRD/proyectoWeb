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
      let log = Protocol.getLoginTipo(data);
      if(log == Protocol.LOGIN_SUCCESS){
        Protocol.guardarUser(data);
        Protocol.enviar("panelControl.html");
      }else if(log == Protocol.LOGIN_FAILURE){
        alert("Usuario o contraseña incorrectos, intente de nuevo");
      }else if(log == Protocol.LOGIN_DENIED){
        alert("No tiene permiso para acceder a la BD");
      }
    })
    
  });