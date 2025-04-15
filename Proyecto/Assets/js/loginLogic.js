document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Capturar valores
    const username = event.target.user.value;
    const password = event.target.password.value;

    console.log("Usuario:", username);
    console.log("Contraseña:", password);

    window.location.href = "panelControl.html"
  });