const botonMenu = document.getElementById("boton-menu");
const navegacion = document.getElementById("navegacion");
const formulario = document.getElementById("formulario");
const respuesta = document.getElementById("respuesta");

botonMenu.addEventListener("click", () => {
  navegacion.classList.toggle("abierta");
});

navegacion.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", () => navegacion.classList.remove("abierta"));
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  respuesta.textContent = `Gracias, ${nombre}. Recibimos tu mensaje y te responderemos pronto.`;
  respuesta.hidden = false;
  formulario.reset();
});
