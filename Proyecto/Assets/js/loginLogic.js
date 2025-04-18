
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Capturar valores
    const username = event.target.user.value;
    const password = event.target.password.value;

    console.log("Usuario:", username);
    console.log("Contraseña:", password);

    let obj = {
      "user":username,
      "pass":password,
    }
    let str = JSON.stringify(obj);

    const xhttp = new XMLHttpRequest();
    //sacar la respuesta del request
    xhttp.onreadystatechange = (ev) =>{
      console.log(xhttp.readyState);
      if(xhttp.readyState == 4){
          if(xhttp.status == 200){
            
            if(xhttp.response=="0"){
              window.location.href = "panelControl.html"
            }else{
              alert("Usuario o contraseña incorrectos, vuelva a intentar");
            }
          }
      }
    }
    //iniciar y mandar el request
    xhttp.open("POST", "/pages/", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(str);
  });