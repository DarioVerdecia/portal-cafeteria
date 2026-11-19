// Lógica del sitio: carta interactiva, carrito y pedido por WhatsApp.
(function () {
  "use strict";

  var DATOS = window.DATOS;
  var NEGOCIO = DATOS.negocio;

  var CLAVE_CARRITO = "rincon.carrito.v1";
  var CLAVE_TEMA = "rincon.tema";

  var elementos = {
    filtros: document.getElementById("filtros"),
    busqueda: document.getElementById("busqueda"),
    lista: document.getElementById("lista-productos"),
    sinResultados: document.getElementById("carta-vacio"),

    botonCarrito: document.getElementById("boton-carrito"),
    contador: document.getElementById("contador-carrito"),
    panel: document.getElementById("carrito-panel"),
    velo: document.getElementById("velo"),
    cerrar: document.getElementById("cerrar-carrito"),
    items: document.getElementById("carrito-items"),
    carritoVacio: document.getElementById("carrito-vacio"),
    subtotal: document.getElementById("subtotal"),
    form: document.getElementById("form-pedido"),
    error: document.getElementById("error-pedido"),
    vaciar: document.getElementById("vaciar-carrito"),
    confirmacion: document.getElementById("confirmacion"),
    resumen: document.getElementById("resumen-pedido"),
    copiar: document.getElementById("copiar-pedido"),

    botonMenu: document.getElementById("boton-menu"),
    navegacion: document.getElementById("navegacion"),

    botonTema: document.getElementById("boton-tema"),
    iconoTema: document.getElementById("icono-tema"),

    avisos: document.getElementById("avisos"),
    anio: document.getElementById("anio"),
    estadoHorario: document.getElementById("estado-horario"),
    botonEncargo: document.getElementById("boton-encargo"),
  };

  var estado = {
    carrito: [],          // [{ id: "espresso", cantidad: 2 }]
    filtro: "todos",
    busqueda: "",
    ultimoFoco: null,
  };

  /* ---------- Utilidades ---------- */

  function formatearPrecio(valor) {
    return valor.toLocaleString("es-CU") + " CUP";
  }

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function buscarProducto(id) {
    for (var i = 0; i < DATOS.productos.length; i++) {
      if (DATOS.productos[i].id === id) return DATOS.productos[i];
    }
    return null;
  }

  function avisar(mensaje) {
    var aviso = document.createElement("div");
    aviso.className = "aviso";
    aviso.textContent = mensaje;
    elementos.avisos.appendChild(aviso);

    window.setTimeout(function () {
      aviso.remove();
    }, 2600);
  }

  /* ---------- Almacenamiento ---------- */

  function leerCarrito() {
    try {
      var guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
      if (!Array.isArray(guardado)) return [];

      // Se descartan entradas que ya no existan en la carta.
      return guardado.filter(function (linea) {
        return linea && buscarProducto(linea.id) && linea.cantidad > 0;
      });
    } catch (error) {
      return [];
    }
  }

  function guardarCarrito() {
    try {
      localStorage.setItem(CLAVE_CARRITO, JSON.stringify(estado.carrito));
    } catch (error) {
      // Sin almacenamiento disponible el carrito sigue funcionando en memoria.
    }
  }

  /* ---------- Carta ---------- */

  function crearFiltros() {
    var opciones = [{ id: "todos", nombre: "Todo" }].concat(DATOS.categorias);

    opciones.forEach(function (categoria) {
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "filtro";
      boton.textContent = categoria.nombre;
      boton.dataset.categoria = categoria.id;
      boton.setAttribute("aria-pressed", String(categoria.id === estado.filtro));

      boton.addEventListener("click", function () {
        estado.filtro = categoria.id;
        elementos.filtros.querySelectorAll(".filtro").forEach(function (otro) {
          otro.setAttribute("aria-pressed", String(otro === boton));
        });
        pintarCarta();
      });

      elementos.filtros.appendChild(boton);
    });
  }

  function productosVisibles() {
    var termino = normalizar(estado.busqueda.trim());

    return DATOS.productos.filter(function (producto) {
      var coincideCategoria =
        estado.filtro === "todos" || producto.categoria === estado.filtro;

      var coincideTexto =
        !termino ||
        normalizar(producto.nombre).indexOf(termino) !== -1 ||
        normalizar(producto.descripcion).indexOf(termino) !== -1;

      return coincideCategoria && coincideTexto;
    });
  }

  function crearTarjetaProducto(producto) {
    var articulo = document.createElement("article");
    articulo.className = "producto";

    if (producto.etiqueta) {
      var etiqueta = document.createElement("span");
      etiqueta.className = "etiqueta";
      etiqueta.textContent = producto.etiqueta;
      articulo.appendChild(etiqueta);
    }

    var cabecera = document.createElement("div");
    cabecera.className = "producto-cabecera";

    var titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    var precio = document.createElement("span");
    precio.className = "producto-precio";
    precio.textContent = formatearPrecio(producto.precio);

    cabecera.appendChild(titulo);
    cabecera.appendChild(precio);

    var descripcion = document.createElement("p");
    descripcion.className = "producto-descripcion";
    descripcion.textContent = producto.descripcion;

    var pie = document.createElement("div");
    pie.className = "producto-pie";

    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "añadir";
    boton.textContent = "Añadir al carrito";
    boton.addEventListener("click", function () {
      agregarAlCarrito(producto.id);
    });

    pie.appendChild(boton);

    articulo.appendChild(cabecera);
    articulo.appendChild(descripcion);
    articulo.appendChild(pie);

    return articulo;
  }

  function pintarCarta() {
    var productos = productosVisibles();

    elementos.lista.replaceChildren();
    productos.forEach(function (producto) {
      elementos.lista.appendChild(crearTarjetaProducto(producto));
    });

    elementos.sinResultados.hidden = productos.length > 0;
  }

  /* ---------- Carrito ---------- */

  function cantidadEnCarrito(id) {
    for (var i = 0; i < estado.carrito.length; i++) {
      if (estado.carrito[i].id === id) return estado.carrito[i].cantidad;
    }
    return 0;
  }

  function agregarAlCarrito(id) {
    var producto = buscarProducto(id);
    if (!producto) return;

    var cantidad = cantidadEnCarrito(id);

    if (cantidad === 0) {
      estado.carrito.push({ id: id, cantidad: 1 });
    } else {
      for (var i = 0; i < estado.carrito.length; i++) {
        if (estado.carrito[i].id === id) estado.carrito[i].cantidad += 1;
      }
    }

    guardarCarrito();
    pintarCarrito();
    avisar(producto.nombre + " añadido");
  }

  function cambiarCantidad(id, diferencia) {
    for (var i = 0; i < estado.carrito.length; i++) {
      if (estado.carrito[i].id !== id) continue;

      estado.carrito[i].cantidad += diferencia;

      if (estado.carrito[i].cantidad <= 0) {
        estado.carrito.splice(i, 1);
      }
      break;
    }

    guardarCarrito();
    pintarCarrito();
  }

  function quitarDelCarrito(id) {
    estado.carrito = estado.carrito.filter(function (linea) {
      return linea.id !== id;
    });
    guardarCarrito();
    pintarCarrito();
  }

  function totalDelCarrito() {
    return estado.carrito.reduce(function (total, linea) {
      var producto = buscarProducto(linea.id);
      return total + (producto ? producto.precio * linea.cantidad : 0);
    }, 0);
  }

  function crearLineaCarrito(linea) {
    var producto = buscarProducto(linea.id);

    var item = document.createElement("li");
    item.className = "carrito-item";

    var nombre = document.createElement("span");
    nombre.className = "carrito-item-nombre";
    nombre.textContent = producto.nombre;

    var total = document.createElement("span");
    total.className = "carrito-item-total";
    total.textContent = formatearPrecio(producto.precio * linea.cantidad);

    var unitario = document.createElement("span");
    unitario.className = "carrito-item-precio";
    unitario.textContent = formatearPrecio(producto.precio) + " c/u";

    var controles = document.createElement("div");
    controles.className = "carrito-item-controles";

    var cajaCantidad = document.createElement("div");
    cajaCantidad.className = "cantidad";

    var menos = document.createElement("button");
    menos.type = "button";
    menos.textContent = "−";
    menos.setAttribute("aria-label", "Quitar una unidad de " + producto.nombre);
    menos.addEventListener("click", function () {
      cambiarCantidad(producto.id, -1);
    });

    var numero = document.createElement("span");
    numero.textContent = linea.cantidad;
    numero.setAttribute("aria-label", linea.cantidad + " unidades");

    var mas = document.createElement("button");
    mas.type = "button";
    mas.textContent = "+";
    mas.setAttribute("aria-label", "Añadir una unidad de " + producto.nombre);
    mas.addEventListener("click", function () {
      cambiarCantidad(producto.id, 1);
    });

    cajaCantidad.appendChild(menos);
    cajaCantidad.appendChild(numero);
    cajaCantidad.appendChild(mas);

    var quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "quitar";
    quitar.textContent = "Quitar";
    quitar.addEventListener("click", function () {
      quitarDelCarrito(producto.id);
    });

    controles.appendChild(cajaCantidad);
    controles.appendChild(quitar);

    item.appendChild(nombre);
    item.appendChild(total);
    item.appendChild(unitario);
    item.appendChild(controles);

    return item;
  }

  function pintarCarrito() {
    elementos.items.replaceChildren();

    estado.carrito.forEach(function (linea) {
      elementos.items.appendChild(crearLineaCarrito(linea));
    });

    var vacio = estado.carrito.length === 0;
    elementos.carritoVacio.hidden = !vacio;
    elementos.items.hidden = vacio;
    elementos.form.hidden = vacio;

    var total = totalDelCarrito();
    var unidades = estado.carrito.reduce(function (suma, linea) {
      return suma + linea.cantidad;
    }, 0);

    elementos.subtotal.textContent = formatearPrecio(total);
    elementos.contador.textContent = String(unidades);
    elementos.contador.dataset.vacio = unidades === 0 ? "si" : "no";

    if (vacio) elementos.confirmacion.hidden = true;
  }

  /* ---------- Panel del carrito ---------- */

  function abrirCarrito() {
    estado.ultimoFoco = document.activeElement;

    elementos.velo.hidden = false;
    elementos.panel.dataset.abierto = "si";
    elementos.panel.setAttribute("aria-hidden", "false");
    elementos.botonCarrito.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";

    elementos.cerrar.focus();
  }

  function cerrarCarrito() {
    elementos.velo.hidden = true;
    elementos.panel.dataset.abierto = "no";
    elementos.panel.setAttribute("aria-hidden", "true");
    elementos.botonCarrito.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";

    if (estado.ultimoFoco && estado.ultimoFoco.focus) {
      estado.ultimoFoco.focus();
    }
  }

  /* ---------- Pedido ---------- */

  function datosDelFormulario() {
    return {
      nombre: document.getElementById("nombre").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      entrega: document.getElementById("entrega").value,
      nota: document.getElementById("nota").value.trim(),
    };
  }

  function validar(datos) {
    if (datos.nombre.length < 2) {
      return "Escribe tu nombre para que sepamos a quién entregar el pedido.";
    }

    var soloDigitos = datos.telefono.replace(/[^0-9]/g, "");
    if (soloDigitos.length < 6) {
      return "Escribe un teléfono de contacto válido.";
    }

    if (estado.carrito.length === 0) {
      return "El carrito está vacío. Añade algo de la carta antes de enviar.";
    }

    return "";
  }

  function armarMensaje(datos) {
    var lineas = [
      "*Pedido — " + NEGOCIO.nombre + "*",
      "Nombre: " + datos.nombre,
      "Teléfono: " + datos.telefono,
      "Entrega: " + datos.entrega,
    ];

    if (datos.nota) lineas.push("Nota: " + datos.nota);

    lineas.push("");

    estado.carrito.forEach(function (linea) {
      var producto = buscarProducto(linea.id);
      lineas.push(
        linea.cantidad + " × " + producto.nombre + " — " +
        formatearPrecio(producto.precio * linea.cantidad)
      );
    });

    lineas.push("");
    lineas.push("Total: " + formatearPrecio(totalDelCarrito()));

    return lineas.join("\n");
  }

  function enviarPedido(evento) {
    evento.preventDefault();

    var datos = datosDelFormulario();
    var problema = validar(datos);

    elementos.error.hidden = !problema;
    elementos.error.textContent = problema;

    if (problema) return;

    var mensaje = armarMensaje(datos);
    var enlace = "https://wa.me/" + NEGOCIO.whatsapp + "?text=" + encodeURIComponent(mensaje);

    elementos.resumen.textContent = mensaje;
    elementos.confirmacion.hidden = false;

    window.open(enlace, "_blank", "noopener");

    estado.carrito = [];
    guardarCarrito();
    pintarCarrito();

    elementos.form.reset();
    elementos.confirmacion.hidden = false;
    elementos.confirmacion.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function copiarResumen() {
    var texto = elementos.resumen.textContent;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(
        function () { avisar("Resumen copiado"); },
        function () { avisar("No se pudo copiar"); }
      );
      return;
    }

    var area = document.createElement("textarea");
    area.value = texto;
    document.body.appendChild(area);
    area.select();

    try {
      document.execCommand("copy");
      avisar("Resumen copiado");
    } catch (error) {
      avisar("Copia el texto a mano");
    }

    area.remove();
  }

  /* ---------- Tema ---------- */

  function pintarIconoTema() {
    var oscuro = document.documentElement.dataset.tema === "oscuro";
    elementos.iconoTema.textContent = oscuro ? "☀" : "☾";
    elementos.botonTema.setAttribute(
      "aria-label",
      oscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
    );
  }

  function alternarTema() {
    var actual = document.documentElement.dataset.tema;
    var nuevo = actual === "oscuro" ? "claro" : "oscuro";

    document.documentElement.dataset.tema = nuevo;
    pintarIconoTema();

    try {
      localStorage.setItem(CLAVE_TEMA, nuevo);
    } catch (error) {
      // Sin almacenamiento, el tema vuelve al del sistema en la próxima visita.
    }
  }

  /* ---------- Horario ---------- */

  function pintarHorario() {
    var ahora = new Date();
    var dia = ahora.getDay();
    var minutos = ahora.getHours() * 60 + ahora.getMinutes();

    var franjas = {
      0: [9 * 60, 15 * 60],
      1: [7 * 60, 19 * 60],
      2: [7 * 60, 19 * 60],
      3: [7 * 60, 19 * 60],
      4: [7 * 60, 19 * 60],
      5: [7 * 60, 19 * 60],
      6: [8 * 60, 21 * 60],
    };

    document.querySelectorAll(".horario tr[data-dia]").forEach(function (fila) {
      var dias = fila.dataset.dia.split(",").map(Number);
      fila.dataset.hoy = dias.indexOf(dia) !== -1 ? "si" : "no";
    });

    var franja = franjas[dia];
    var abierto = minutos >= franja[0] && minutos < franja[1];

    elementos.estadoHorario.hidden = false;
    elementos.estadoHorario.textContent = abierto
      ? "Ahora mismo estamos abiertos. Cierra a las " + formatearHora(franja[1]) + "."
      : minutos < franja[0]
        ? "Ahora está cerrado. Hoy abrimos a las " + formatearHora(franja[0]) + "."
        : "Ahora está cerrado. Mañana volvemos a abrir.";
  }

  function formatearHora(minutos) {
    var horas = Math.floor(minutos / 60);
    var resto = minutos % 60;
    var sufijo = horas < 12 ? "a.m." : "p.m.";
    var hora12 = horas % 12 === 0 ? 12 : horas % 12;

    return hora12 + ":" + String(resto).padStart(2, "0") + " " + sufijo;
  }

  /* ---------- Arranque ---------- */

  function iniciar() {
    estado.carrito = leerCarrito();

    crearFiltros();
    pintarCarta();
    pintarCarrito();
    pintarIconoTema();
    pintarHorario();

    if (elementos.anio) {
      elementos.anio.textContent = String(new Date().getFullYear());
    }

    elementos.busqueda.addEventListener("input", function (evento) {
      estado.busqueda = evento.target.value;
      pintarCarta();
    });

    elementos.botonCarrito.addEventListener("click", abrirCarrito);
    elementos.cerrar.addEventListener("click", cerrarCarrito);
    elementos.velo.addEventListener("click", cerrarCarrito);
    elementos.form.addEventListener("submit", enviarPedido);
    elementos.copiar.addEventListener("click", copiarResumen);

    elementos.vaciar.addEventListener("click", function () {
      estado.carrito = [];
      guardarCarrito();
      pintarCarrito();
      avisar("Carrito vacío");
    });

    elementos.botonTema.addEventListener("click", alternarTema);

    elementos.botonMenu.addEventListener("click", function () {
      var abierta = elementos.navegacion.dataset.abierta === "si";
      elementos.navegacion.dataset.abierta = abierta ? "no" : "si";
      elementos.botonMenu.setAttribute("aria-expanded", String(!abierta));
    });

    elementos.navegacion.addEventListener("click", function (evento) {
      if (evento.target.tagName === "A") {
        elementos.navegacion.dataset.abierta = "no";
        elementos.botonMenu.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key !== "Escape") return;

      if (elementos.panel.dataset.abierto === "si") {
        cerrarCarrito();
      }

      elementos.navegacion.dataset.abierta = "no";
      elementos.botonMenu.setAttribute("aria-expanded", "false");
    });

    elementos.botonEncargo.addEventListener("click", function () {
      avisar("Escríbenos por WhatsApp para coordinar el encargo");
    });
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
