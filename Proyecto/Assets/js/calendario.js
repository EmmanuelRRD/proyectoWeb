const monthYear = document.getElementById("monthYear");
const daysContainer = document.getElementById("daysContainer");

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();

// Array de nombres de meses
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Mostrar el mes y año actual
monthYear.textContent = `${months[month]} ${year}`;

// Obtener el primer día del mes
const firstDay = new Date(year, month, 1).getDay();

// Obtener el último día del mes
const lastDate = new Date(year, month + 1, 0).getDate();

// Rellenar espacios vacíos al principio
for (let i = 0; i < firstDay; i++) {
  const empty = document.createElement("div");
  daysContainer.appendChild(empty);
}

// Crear días del mes
for (let i = 1; i <= lastDate; i++) {
  const dayBtn = document.createElement("button");
  dayBtn.textContent = i;
  dayBtn.dataset.day = i; // Guardamos el día en un atributo
  dayBtn.addEventListener("click", function () {

    console.log("Año y mes",this.textContent.monthYear,"Día seleccionado:", this.dataset.day);
  });
  daysContainer.appendChild(dayBtn);
}