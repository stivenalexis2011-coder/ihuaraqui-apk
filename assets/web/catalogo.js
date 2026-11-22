
(() => {
  "use strict";

  const WHATSAPP_CATALOGO = "51987221347";

  const categorias = [
    ["Torneado de piezas", "Ejes, bujes, poleas, bridas y piezas en general.", "01-torneado-de-piezas.jpg"],
    ["Fresado industrial", "Ranuras, placas, matrices y piezas especiales.", "02-fresado-industrial.jpg"],
    ["Bujes y casquillos", "Fabricación en acero, bronce y otros materiales.", "03-bujes-y-casquillos.jpg"],
    ["Ejes y flechas", "Ejes lisos, estriados y escalonados.", "04-ejes-y-flechas.jpg"],
    ["Fabricación de poleas", "Poleas de diferentes diámetros y perfiles.", "05-fabricacion-de-poleas.jpg"],
    ["Engranajes", "Fabricación y reparación de engranajes.", "06-engranajes.jpg"],
    ["Rosca y mecanizado", "Roscas, acoples y ajustes de precisión.", "07-rosca-y-mecanizado.jpg"],
    ["Bridas y conexiones", "Fabricación y reparación de conexiones.", "08-bridas-y-conexiones.jpg"],
    ["Piezas a medida", "Fabricación según planos o muestras.", "09-piezas-a-medida.jpg"],
    ["Estructuras metálicas", "Fabricación de soportes y estructuras industriales.", "10-estructuras-metalicas.jpg"],
    ["Soldadura especial", "Soldadura MIG, TIG y recargue de piezas.", "11-soldadura-especial.jpg"],
    ["Reparación de componentes", "Recuperación de piezas desgastadas o dañadas.", "12-reparacion-de-componentes.jpg"],
    ["Reparación de cilindros", "Reparación de cilindros hidráulicos y neumáticos.", "13-reparacion-de-cilindros.jpg"],
    ["Mantenimiento industrial", "Reparación y ajuste de maquinaria.", "14-mantenimiento-industrial.jpg"],
    ["Válvulas y componentes", "Fabricación y reparación de componentes.", "15-valvulas-y-componentes.jpg"],
    ["Platos y adaptadores", "Platos, adaptadores y accesorios para torno.", "16-platos-y-adaptadores.jpg"],
    ["Herramientas especiales", "Fabricación de herramientas para mecanizado.", "17-herramientas-especiales.jpg"],
    ["Piñones y coronas", "Fabricación para cadenas y transmisiones.", "18-pinones-y-coronas.jpg"],
    ["Acoples y uniones", "Fabricación y reemplazo de acoples.", "19-acoples-y-uniones.jpg"],
    ["Trabajos especiales", "Proyectos industriales según requerimiento.", "20-trabajos-especiales.jpg"]
  ].map((c, i) => ({
    id: i + 1,
    nombre: c[0],
    descripcion: c[1],
    imagen: "assets/img/catalogo/" + c[2]
  }));

  let carrito = [];
  let filtroActual = "todas";
  let busqueda = "";
  let vistaLista = false;
let envioEnCurso = false;
let claveEnvioPendiente = null;
let datosEnvioPendientes = null;
  const escapar = (valor) =>
    String(valor).replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);

  function iniciar() {
    const app = document.getElementById("catalogoApp");
    if (!app) {
      console.error("No se encontró catalogoApp.");
      return;
    }

    app.innerHTML = `
      <div class="ihu-catalogo">
        <div class="ihu-cabecera">
          <div>
            <h2>⚙️ Catálogo de productos y servicios</h2>
            <p>Explora nuestras 20 categorías y selecciona lo que necesitas.</p>
          </div>
          <button class="ihu-carrito-toggle" id="ihuAbrirCarrito">
            🛒 Mi carrito (<span id="ihuContador">0</span>)
          </button>
        </div>

        <div class="ihu-filtros">
          <label>
            Categoría:
            <select id="ihuFiltro">
              <option value="todas">Todas las categorías</option>
              ${categorias.map(c =>
                `<option value="${c.id}">${escapar(c.nombre)}</option>`
              ).join("")}
            </select>
          </label>

          <input id="ihuBuscar" type="search"
            placeholder="Buscar producto o servicio...">

          <div class="ihu-vistas">
            <button type="button" id="ihuTarjetas" class="activo">▦ Tarjetas</button>
            <button type="button" id="ihuLista">☷ Lista</button>
          </div>
        </div>

        <div id="ihuGrid" class="ihu-grid"></div>

        <section class="ihu-panel-carrito" id="ihuPanelCarrito" hidden>
          <div class="ihu-carrito-titulo">
            <h3>🛒 Tu solicitud de cotización</h3>
            <button type="button" id="ihuCerrarCarrito">Cerrar ✕</button>
          </div>

          <div id="ihuContenidoCarrito"></div>

          <div class="ihu-datos-cliente">
            <input id="ihuNombre" placeholder="Nombre y apellido" required>
            <input id="ihuEmpresa" placeholder="Empresa o taller">
            <input id="ihuTelefono" type="tel" placeholder="Teléfono de contacto">
            <input id="ihuDocumento" type="text" maxlength="11"
              placeholder="DNI (8 dígitos) o RUC (11 dígitos)" required>
            <textarea id="ihuObservaciones"
              placeholder="Medidas, material u observaciones adicionales"></textarea>
          </div>

          <div class="ihu-acciones-carrito">
            <button type="button" id="ihuVaciar">Vaciar carrito</button>
            <button type="button" id="ihuEnviar">Enviar solicitud por WhatsApp</button>
          </div>
        </section>
      </div>
    `;

    agregarEventos();
    mostrarCategorias();
    actualizarContador();
  }

  function mostrarCategorias() {
    const grid = document.getElementById("ihuGrid");

    const resultados = categorias.filter(c => {
      const coincideFiltro =
        filtroActual === "todas" || c.id === Number(filtroActual);

      const coincideBusqueda =
        (c.nombre + " " + c.descripcion)
          .toLowerCase().includes(busqueda.toLowerCase());

      return coincideFiltro && coincideBusqueda;
    });

    grid.className = vistaLista ? "ihu-grid ihu-lista" : "ihu-grid";

    if (!resultados.length) {
      grid.innerHTML = "<p>No encontramos categorías con esa búsqueda.</p>";
      return;
    }

    grid.innerHTML = resultados.map(c => {
      const seleccionado = carrito.find(p => p.id === c.id);

      return `
        <article class="ihu-producto">
          <div class="ihu-imagen-contenedor">
            <img src="${c.imagen}"
              alt="${escapar(c.nombre)}"
              loading="lazy"
              onerror="this.style.display='none'">

          </div>

          <div class="ihu-producto-info">
            <h3>${escapar(c.nombre)}</h3>
            <p>${escapar(c.descripcion)}</p>

            <details>
              <summary>Ver detalles</summary>
              <p>Solicita información sobre fabricación, materiales,
              medidas y disponibilidad de este servicio.</p>
            </details>

            <button type="button" class="ihu-agregar"
              data-agregar="${c.id}">
              ${seleccionado ? "✓ Agregado" : "🛒 Agregar"}
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  function agregar(id) {
    const producto = categorias.find(c => c.id === id);
    if (!producto) return;

    const existente = carrito.find(p => p.id === id);

    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        cantidad: 1
      });
    }

    actualizarContador();
    mostrarCategorias();
    mostrarCarrito();
  }

  function cambiarCantidad(id, cambio) {
    const producto = carrito.find(p => p.id === id);
    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
      carrito = carrito.filter(p => p.id !== id);
    }

    actualizarContador();
    mostrarCategorias();
    mostrarCarrito();
  }

  function actualizarContador() {
    const contador = document.getElementById("ihuContador");
    if (contador) {
      contador.textContent = carrito.reduce(
        (total, p) => total + p.cantidad, 0
      );
    }
  }

  function mostrarCarrito() {
    const contenido = document.getElementById("ihuContenidoCarrito");

    if (!carrito.length) {
      contenido.innerHTML = "<p>Tu carrito está vacío.</p>";
      return;
    }

    contenido.innerHTML = carrito.map(p => `
      <div class="ihu-item-carrito">
        <strong>${escapar(p.nombre)}</strong>
        <div>
          <button type="button" data-menos="${p.id}">−</button>
          <span>${p.cantidad}</span>
          <button type="button" data-mas="${p.id}">+</button>
          <button type="button" data-eliminar="${p.id}">Eliminar</button>
        </div>
      </div>
    `).join("");
  }

  function abrirCarrito() {
    const panel = document.getElementById("ihuPanelCarrito");
    panel.hidden = false;
    mostrarCarrito();
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  
  async function enviarWhatsApp() {
    if (envioEnCurso) return;

    if (!carrito.length) {
      alert("Agrega al menos un producto al carrito.");
      return;
    }

    const nombre = document.getElementById("ihuNombre").value.trim();
    const empresa = document.getElementById("ihuEmpresa").value.trim();
    const telefono = document.getElementById("ihuTelefono").value.trim();
    const documento = document.getElementById("ihuDocumento").value.replace(/\D/g, "");
    const observaciones =
      document.getElementById("ihuObservaciones").value.trim();

    if (!nombre) {
      alert("Por favor, escribe tu nombre.");
      document.getElementById("ihuNombre").focus();
      return;
    }

    if (!/^(?:\d{8}|\d{11})$/.test(documento)) {
      alert("Ingresa un DNI de 8 dígitos o un RUC de 11 dígitos.");
      document.getElementById("ihuDocumento").focus();
      return;
    }

    const datosActuales = {
      nombre,
      empresa,
      telefono,
      documento,
      observaciones,
      productos: carrito.map(p => ({
        nombre: p.nombre,
        cantidad: p.cantidad
      }))
    };

    if (
      !claveEnvioPendiente ||
      JSON.stringify(datosEnvioPendientes) !== JSON.stringify(datosActuales)
    ) {
      if (typeof crypto.randomUUID !== "function") {
        alert("Tu navegador no permite generar una clave segura.");
        return;
      }

      claveEnvioPendiente = crypto.randomUUID();
      datosEnvioPendientes = datosActuales;
    }

    const ventana = window.open("about:blank", "_blank");

    if (!ventana) {
      alert("Permite las ventanas emergentes para continuar.");
      return;
    }

    const boton = document.getElementById("ihuEnviar");
    envioEnCurso = true;

    if (boton) {
      boton.disabled = true;
      boton.textContent = "Registrando solicitud...";
    }

    try {
      const respuesta = await fetch("/api/solicitudes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          clave_envio: claveEnvioPendiente,
          ...datosEnvioPendientes
        })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.ok || !resultado.solicitud) {
        throw new Error(
          resultado.error || "No se pudo registrar la solicitud."
        );
      }

      let mensaje =
        "SOLICITUD DE COTIZACIÓN\n" +
        "IHUARAQUI TORNO INDUSTRIAL\n" +
        "------------------------------\n\n" +
        "N.º DE SOLICITUD: " + resultado.solicitud.numero + "\n\n" +
        "DATOS DEL CLIENTE\n" +
        "Nombre: " + datosEnvioPendientes.nombre + "\n" +
        "Empresa: " + (datosEnvioPendientes.empresa || "No indicada") + "\n" +
        "Teléfono: " + (datosEnvioPendientes.telefono || "No indicado") + "\n" +
        "DNI/RUC: " + datosEnvioPendientes.documento + "\n\n" +
        "PRODUCTOS Y SERVICIOS SOLICITADOS\n\n";

      datosEnvioPendientes.productos.forEach((p, i) => {
        mensaje += `${i + 1}. ${p.nombre}\n` +
          `   Cantidad: ${p.cantidad}\n\n`;
      });

      mensaje +=
        "OBSERVACIONES\n" +
        (datosEnvioPendientes.observaciones || "Por confirmar") +
        "\n\nSolicito una cotización, precio y plazo de entrega.";

      const url = "https://wa.me/" + WHATSAPP_CATALOGO +
        "?text=" + encodeURIComponent(mensaje);

      claveEnvioPendiente = null;
      datosEnvioPendientes = null;

      ventana.opener = null;
      ventana.location.href = url;

    } catch (error) {
      ventana.close();

      alert(
        "No se pudo registrar la solicitud.\n\n" +
        error.message +
        "\nTus datos y productos se conservaron."
      );

      console.error("Error al enviar solicitud:", error);

    } finally {
      envioEnCurso = false;

      if (boton) {
        boton.disabled = false;
        boton.textContent = "Enviar solicitud por WhatsApp";
      }
    }
  }

  function agregarEventos() {
    const app = document.getElementById("catalogoApp");

    app.addEventListener("click", e => {
      const boton = e.target.closest("button");
      if (!boton) return;

      if (boton.dataset.agregar) agregar(Number(boton.dataset.agregar));
      if (boton.dataset.mas) cambiarCantidad(Number(boton.dataset.mas), 1);
      if (boton.dataset.menos) cambiarCantidad(Number(boton.dataset.menos), -1);
      if (boton.dataset.eliminar) cambiarCantidad(Number(boton.dataset.eliminar), -999);

      if (boton.id === "ihuAbrirCarrito") abrirCarrito();
      if (boton.id === "ihuCerrarCarrito") {
        document.getElementById("ihuPanelCarrito").hidden = true;
      }
      if (boton.id === "ihuVaciar") {
        carrito = [];
        actualizarContador();
        mostrarCategorias();
        mostrarCarrito();
      }
      if (boton.id === "ihuEnviar") enviarWhatsApp();

      if (boton.id === "ihuTarjetas") {
        vistaLista = false;
        document.getElementById("ihuTarjetas").classList.add("activo");
        document.getElementById("ihuLista").classList.remove("activo");
        mostrarCategorias();
      }

      if (boton.id === "ihuLista") {
        vistaLista = true;
        document.getElementById("ihuLista").classList.add("activo");
        document.getElementById("ihuTarjetas").classList.remove("activo");
        mostrarCategorias();
      }
    });

    document.getElementById("ihuFiltro").addEventListener("change", e => {
      filtroActual = e.target.value;
      mostrarCategorias();
    });

    document.getElementById("ihuBuscar").addEventListener("input", e => {
      busqueda = e.target.value;
      mostrarCategorias();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
