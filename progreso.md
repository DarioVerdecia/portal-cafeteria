# Progreso del proyecto: Cafetería El Rincón

Última actualización: 20 de noviembre de 2026.
Este archivo sirve para retomar el trabajo en otro chat sin perder contexto.
Pega su contenido o pide leer `C:\DarioAI\projects\portal-cafeteria\progreso.md`.

## Qué es este proyecto

Primer proyecto del plan de freelancer: un portal web para un negocio pequeño,
usado como pieza de portafolio. La cafetería es inventada; el sitio debe poder
mostrarse a un cliente real sin que parezca una práctica.

Un profesor le sugirió tres tipos de trabajo para empezar: portales informativos,
portales con alguna aplicación, y tiendas con pasarela de pagos. Este es el primero
de los tres, pero ya incluye una aplicación: un flujo de pedido completo.

## Dónde está todo

- Carpeta: `C:\DarioAI\projects\portal-cafeteria`
- Repositorio git local, rama `main`, conectado al remoto `origin`:
  `https://github.com/DarioVerdecia/portal-cafeteria`.
- Publicado con GitHub Pages en `https://darioverdecia.github.io/portal-cafeteria/`.
- Commits:
  - `fd739ed` Portal completo de la cafetería (primera versión, hecha en otro chat)
  - `471260f` Carta interactiva con carrito, pedido por WhatsApp y tema claro/oscuro
  - `2b193da` Onda al cambiar de tema, animaciones de entrada y dirección real
  - `8c49ed3` Añadir progreso.md para retomar el proyecto

## Archivos

```
portal-cafeteria/
├── index.html          estructura, secciones y carrito
├── style.css           diseño, temas claro/oscuro, animaciones y onda
├── datos.js            negocio, categorías y 17 productos  ← se edita por cliente
├── script.js           carta interactiva, carrito, pedido y tema
├── README.md           descripción del proyecto para GitHub
├── progreso.md         este archivo
└── docs/capturas/      capturas usadas en el README
```

## Qué hace el sitio

- Carta con 17 productos cargados desde `datos.js`, filtros por categoría y búsqueda
  que ignora tildes y mayúsculas.
- Carrito con cantidades, guardado en `localStorage` (sobrevive a recargas).
- Pedido por WhatsApp: arma un mensaje con nombre, teléfono, entrega, nota y total,
  y abre `wa.me`. Si el navegador bloquea la ventana, hay botón para copiar el texto.
- Validación del formulario con mensajes de error propios.
- Tema claro y oscuro con la preferencia guardada y respeto por el sistema.
- Horario que resalta el día actual y calcula si está abierto ahora.
- Diseño adaptable, menú desplegable en móvil, accesibilidad básica (salto al
  contenido, `aria-live`, Escape cierra el carrito, foco devuelto).

## Animaciones

- **Onda al cambiar de tema**: usa View Transitions. El tema nuevo se revela con un
  `clip-path: circle()` que crece desde el centro del botón hasta la esquina más lejana.
  El radio se calcula en JS y se pasa por las variables `--onda-x`, `--onda-y`, `--onda-r`.
- El tema se guarda en la variable `temaActual` (no se lee del DOM) porque el cambio
  dentro de una transición ocurre de forma asíncrona; leer el atributo devolvía el valor
  viejo y se perdían clics rápidos. La variable `transicionEnCurso` evita encadenar dos
  transiciones, porque Chrome descarta la segunda sin ejecutar su callback.
- Entradas escalonadas en la portada, revelado por scroll con IntersectionObserver
  (`data-revelar` y `data-visible`), entrada de productos al filtrar, salto del contador,
  cabecera que se compacta, resplandor que deriva en la portada.
- Todo respeta `prefers-reduced-motion`.

## Dirección y datos del negocio

- Dirección mostrada: `22.714272, -83.054655`, San Cristóbal, Artemisa.
- Enlace "Ver en el mapa" con las coordenadas exactas.
- Teléfono y WhatsApp de ejemplo: `+53 5 000 0000` / `5350000000`. Cambiar en `datos.js`
  y en `index.html` (aparece en el enlace del mapa de contacto y en la confirmación).
- No se menciona en ninguna parte que sea un proyecto de portafolio: se quitó del pie,
  del contacto y del README, a petición suya.

## Cómo probarlo

Servidor de pruebas sin caché (el de la sesión anterior ya se apagó):

```powershell
cd C:\DarioAI\projects\portal-cafeteria
python -m http.server 5500 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:5500`. En VS Code también sirve "Open with Live Server".
El doble clic sobre `index.html` funciona, pero sin recarga automática.

## Verificado

- 17 productos, 5 filtros, búsqueda y estados vacíos.
- Carrito con totales correctos (`1.100 CUP`), persistencia y vaciado tras el pedido.
- Mensaje de WhatsApp generado con el pedido completo.
- Errores de validación (nombre vacío, teléfono corto).
- Animación `onda` corriendo sobre `::view-transition-new(root)`.
- Sitio publicado: `https://darioverdecia.github.io/portal-cafeteria/` responde con estado
  200 y la carta cargada.
- Sin errores en consola.

## Pendiente

1. **Publicar** (hecho el 20 de noviembre de 2026): repositorio creado, `origin`
   conectado, `main` subida y GitHub Pages activo en la rama `main`, carpeta raíz.
   Enlace: `https://darioverdecia.github.io/portal-cafeteria/`. Falta ponerlo en la
   descripción del repositorio y en LinkedIn.
2. **Etapa 2 del portafolio**: la misma cafetería con Python, Flask y SQLite, con panel
   para editar la carta y pedidos guardados en base de datos. Es lo que demuestra servidor,
   base de datos y permisos.
3. Galería de fotos de los productos (no hay imágenes todavía).
4. Revisar el README con las capturas ya actualizadas.

## Cómo prefiere trabajar

- Responde en español neutro, sin emojis ni coloquialismos regionales.
- **Prefiere que se le hagan preguntas del proyecto**: decisiones de diseño, alcance,
  textos, prioridades. No entregar todo cerrado salvo que lo pida explícitamente.
- Le gusta entender el porqué de las decisiones, no solo recibir el resultado.
- En estudio (matemática, C++) se le guía con preguntas; en proyectos se le explica y
  se le pregunta qué prefiere.
- Vive en Cuba: conexión lenta y cara, apagones, sin pagos internacionales. Evitar
  dependencias pesadas y servicios de pago.
- Su Brave tiene una extensión que fuerza el modo oscuro de las páginas. Lo sabe y le
  da igual; no hay que "arreglarlo" en el CSS.

## Notas técnicas sueltas

- Sin dependencias externas, sin frameworks, sin build. Scripts clásicos (no módulos)
  para que funcione abriendo el archivo directamente y en GitHub Pages sin configuración.
- El formateo de precios se hace a mano (`1.100 CUP`) porque `toLocaleString` con
  `es-CU` usaba coma en algunos navegadores.
- Los estilos usan `color-mix` y `:root[data-tema]`; el tema inicial se fija con un
  script en línea en el `<head>` para evitar el parpadeo al cargar.
