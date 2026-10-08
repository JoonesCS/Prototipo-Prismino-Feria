// Prismino · plantilla única de problemas.
// Lee ?id= del enlace, busca el problema en window.PROBLEMAS y lo arma. El flujo es una máquina de
// estados explícita: `app.estado` y una sola función `ir()` que decide qué se ve y qué se puede tocar.
// Nada se guarda: la reflexión vive en memoria y se descarta al cambiar de página.
(function () {
  "use strict";
  var P = window.Prismino;
  var M = P.modelo, R = P.reglas;

  var TIPOS = { "parte-todo": "Parte–todo", "comparacion": "Comparación", "unidades": "Unidades" };

  var INSTRUCCIONES = {
    "comparacion": "Estira cada barra con su asa: ¿quién tiene más? Luego lleva cada tarjeta a su lugar. Puedes arrastrarla, o tocarla y después tocar el lugar.",
    "parte-todo": "Estira la barra para mostrar el total y divídela en partes. Luego lleva cada tarjeta a una parte o a la llave del total.",
    "unidades": "Arma cada barra con unidades del mismo tamaño usando su asa. Luego lleva cada tarjeta a su lugar: la llave de la derecha abarca a los dos."
  };

  var el = {};
  [
    "problema", "antetitulo", "titulo", "etiquetas", "enunciado", "taller", "herramientas", "escena",
    "bandeja", "bandeja-lista", "guia-paso", "guia-texto", "guia-extra", "guia-estado", "guia-acciones",
    "aviso", "aviso-texto"
  ].forEach(function (id) { el[id] = document.getElementById(id); });

  var app = {
    estado: null,      // leyendo | construyendo | verificando | senal | reflexion | explicacion | reintento | calculando | resuelto | demostrando
    problema: null,
    modelo: null,
    errores: 0,        // errores de estructura en este problema (la reflexión solo se pide en el primero)
    reflexion: "",     // no se guarda ni se califica
    resultado: null,   // último resultado del verificador
    guiada: null,      // variante guiada activa
    seleccion: null,   // tarjeta tocada, a la espera de un destino
    senal: null,       // id del elemento resaltado
    paso: 0            // modo «resuelto»
  };

  // — utilidades de vista —

  function crear(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  // Activa un botón con un toque (Pointer Events) o con el teclado. No se depende de «click» porque,
  // después de un arrastre táctil, el navegador a veces no lo genera para el toque siguiente.
  // soloPuntero: el teclado lo resuelve otro camino (el envío del formulario).
  function alActivar(boton, fn, soloPuntero) {
    var abajo = null;
    boton.addEventListener("pointerdown", function (e) {
      abajo = e.pointerType === "mouse" && e.button !== 0 ? null : { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    boton.addEventListener("pointerup", function (e) {
      if (!abajo || abajo.id !== e.pointerId) return;
      var cerca = Math.abs(e.clientX - abajo.x) + Math.abs(e.clientY - abajo.y) < 10;
      abajo = null;
      if (cerca && !boton.disabled) fn();
    });
    boton.addEventListener("pointercancel", function () { abajo = null; });
    if (soloPuntero) return;
    boton.addEventListener("click", function (e) {
      if (e.detail === 0 && !boton.disabled) fn();  // Enter o Espacio
    });
  }

  // o: { paso, texto, extra, acciones: [{ texto, alHacer | href, secundaria, id }] }
  function guia(o) {
    el["guia-paso"].textContent = o.paso || "";
    el["guia-texto"].textContent = o.texto || "";
    el["guia-extra"].innerHTML = "";
    if (o.extra) el["guia-extra"].appendChild(o.extra);
    el["guia-estado"].textContent = "";
    el["guia-acciones"].innerHTML = "";
    (o.acciones || []).forEach(function (a) {
      var nodo;
      if (a.href) {
        nodo = crear("a", "boton", a.texto);
        nodo.href = a.href;
      } else {
        nodo = crear("button", "boton", a.texto);
        nodo.type = "button";
        alActivar(nodo, a.alHacer);
      }
      if (a.secundaria) nodo.classList.add("boton--secundario");
      if (a.id) nodo.id = a.id;
      el["guia-acciones"].appendChild(nodo);
    });
  }

  function puedeInteractuar() {
    return app.estado === "construyendo";
  }

  function pasos() {
    var lista = app.problema.pasos;
    return Array.isArray(lista) && lista.length ? lista : [{ texto: "Este es el modelo de barras del problema.", mostrar: null }];
  }

  // Elementos visibles hasta el paso actual (acumulativo); null = todo.
  function visiblesHasta(i) {
    var lista = pasos(), visibles = [];
    for (var k = 0; k <= i; k++) {
      if (!lista[k].mostrar) return null;
      visibles = visibles.concat(lista[k].mostrar);
    }
    return visibles;
  }

  // Recuerda qué control tenía el foco para devolvérselo después de redibujar el SVG.
  function claveDeFoco() {
    var a = document.activeElement;
    if (!a || !el.taller.contains(a)) return null;
    var atributos = ["data-asa", "data-divisor", "data-destino", "data-tarjeta"];
    for (var i = 0; i < atributos.length; i++) {
      if (a.hasAttribute(atributos[i])) return "[" + atributos[i] + '="' + a.getAttribute(atributos[i]) + '"]';
    }
    return null;
  }

  function dibujar() {
    var visibles = app.estado === "demostrando" ? visiblesHasta(app.paso) : null;
    var op = {
      interactivo: puedeInteractuar(),
      seleccion: app.seleccion,
      senal: app.senal,
      visibles: visibles,
      revelar: app.estado === "resuelto" || (visibles !== null && visibles.indexOf("respuesta") !== -1),
      valorDe: function (destino) { return M.valorIncognita(app.problema, destino); }
    };
    var foco = claveDeFoco();
    P.render.escena(el.escena, app.modelo, op);
    P.render.bandeja(el["bandeja-lista"], app.modelo, op);
    el.bandeja.hidden = app.problema.modo === "resuelto" || app.estado === "resuelto" || app.estado === "calculando";
    el.bandeja.classList.toggle("es-senal", app.senal === "bandeja");
    el.taller.classList.toggle("taller--interactivo", op.interactivo);
    herramientas();
    if (foco) {
      var nodo = el.taller.querySelector(foco);
      if (nodo) nodo.focus();
    }
    if (app.estado === "construyendo") estadoDeConstruccion();
  }

  // Botones de parte–todo para dividir o unir la barra.
  function herramientas() {
    el.herramientas.innerHTML = "";
    if (app.problema.tipo !== "parte-todo" || !puedeInteractuar()) return;
    var b = app.modelo.barras[0];
    var boton = crear("button", "boton boton--secundario boton--chico");
    boton.type = "button";
    if (b.divisor === null) {
      boton.textContent = "Dividir la barra";
      boton.disabled = b.largo < 2;
      alActivar(boton, function () { M.dividir(app.modelo, b.id); dibujar(); });
    } else {
      boton.textContent = "Unir la barra";
      boton.disabled = b.divisorFijo;
      alActivar(boton, function () { M.unir(app.modelo, b.id); dibujar(); });
    }
    el.herramientas.appendChild(boton);
  }

  // Línea de estado mientras se construye, y si ya se puede revisar.
  function estadoDeConstruccion() {
    var modelo = app.modelo, texto;
    var sinColocar = modelo.tarjetas.filter(function (t) { return t.lugar === null; }).length;
    var seleccionada = app.seleccion && M.tarjeta(modelo, app.seleccion);
    if (seleccionada) {
      texto = "Tarjeta «" + seleccionada.texto + "» elegida: toca el lugar donde va.";
    } else if (modelo.barras.some(function (b) { return b.largo === 0; })) {
      texto = "Estira todas las barras con su asa.";
    } else if (modelo.tipo === "parte-todo" && modelo.barras[0].divisor === null && sinColocar > 0) {
      texto = "Divide la barra para tener dónde poner cada parte.";
    } else if (sinColocar > 0 && !M.listoParaRevisar(modelo)) {
      texto = sinColocar === 1 ? "Falta 1 tarjeta por colocar." : "Faltan " + sinColocar + " tarjetas por colocar.";
    } else {
      texto = "Cuando quieras, revisa tu modelo.";
    }
    el["guia-estado"].textContent = texto;
    var revisar = document.getElementById("revisar");
    if (revisar) revisar.disabled = !M.listoParaRevisar(modelo);
  }

  // — respuestas del cálculo —

  function respuestasEsperadas() {
    var p = app.problema, s = p.solucion;
    if (p.tipo !== "unidades") {
      return [{ id: "respuesta", etiqueta: "¿Cuánto vale el «?»?", valor: s.respuesta }];
    }
    var unidades = app.modelo.barras.reduce(function (suma, b) { return suma + b.largo; }, 0);
    var unidad = Number(s.total) / unidades;
    return [{ id: "unidad", etiqueta: "¿Cuánto vale 1 unidad?", valor: unidad }].concat(
      app.modelo.barras.map(function (b) {
        return { id: b.id, etiqueta: "¿Cuánto tiene " + b.etiqueta + "?", valor: unidad * b.largo };
      })
    );
  }

  // Toma el primer número escrito: «18», «B/.40», «20,5».
  // La expresión de los datos describe el modelo esperado. En unidades se acepta cualquier modelo
  // proporcional (2 y 4 unidades), y entonces la expresión («1 unidad = 20») ya no corresponde.
  function expresionCoincide() {
    var u = app.problema.solucion.unidades;
    if (app.problema.tipo !== "unidades" || app.problema.modo === "resuelto") return true;
    return app.modelo.barras.every(function (b) { return b.largo === u[b.id]; });
  }

  function leerNumero(texto) {
    var m = String(texto).match(/-?\d+(?:[.,]\d+)?/);
    return m ? Number(m[0].replace(",", ".")) : NaN;
  }

  // — estados —

  var VISTAS = {
    leyendo: function () {
      el.taller.hidden = true;
      var resuelto = app.problema.modo === "resuelto";
      guia({
        paso: "Antes de empezar",
        texto: "Lee el problema completo, sin calcular todavía. ¿Qué sabes? ¿Qué te piden?",
        acciones: [resuelto
          ? { texto: "Ver el modelo paso a paso →", alHacer: function () { app.paso = 0; ir("demostrando"); } }
          : { texto: "Armar el modelo →", alHacer: function () { ir("construyendo"); } }]
      });
    },

    construyendo: function () {
      el.taller.hidden = false;
      app.senal = null;
      guia({
        paso: app.guiada ? "Con más ayuda" : "Arma el modelo",
        texto: app.guiada ? app.guiada.pista : INSTRUCCIONES[app.problema.tipo],
        acciones: [{ texto: "Revisar mi modelo", id: "revisar", alHacer: function () { ir("verificando"); } }]
      });
      dibujar();
    },

    // Estado interno: revisa la estructura y pasa a «calculando» o a «senal».
    verificando: function () {
      app.seleccion = null;
      var r = P.verificar(app.problema, app.modelo);
      if (r.correcto) { ir("calculando"); return; }
      app.resultado = r;
      app.errores += 1;
      app.senal = R.senal(app.problema, r);
      ir("senal");
    },

    senal: function () {
      guia({
        paso: "Revisa",
        texto: "Mira lo que está marcado en tu modelo. Algo ahí no encaja con el problema.",
        acciones: [{ texto: "Continuar", alHacer: function () { ir(app.errores === 1 ? "reflexion" : "explicacion"); } }]
      });
      dibujar();
    },

    reflexion: function () {
      var campo = crear("textarea", "campo campo--texto");
      campo.id = "reflexion";
      campo.rows = 3;
      campo.setAttribute("aria-labelledby", "guia-texto");
      var nota = crear("p", "guia__nota", "No se guarda ni se califica. «No sé» también es una respuesta.");
      var extra = document.createDocumentFragment();
      extra.appendChild(campo);
      extra.appendChild(nota);
      guia({
        paso: "Piensa un momento",
        texto: "¿Qué crees que te faltó?",
        extra: extra,
        acciones: [
          { texto: "No sé", secundaria: true, alHacer: function () { app.reflexion = "No sé"; ir("explicacion"); } },
          { texto: "Confirmar", id: "confirmar", alHacer: function () { app.reflexion = campo.value.trim(); ir("explicacion"); } }
        ]
      });
      var confirmar = document.getElementById("confirmar");
      confirmar.disabled = true;
      campo.addEventListener("input", function () { confirmar.disabled = campo.value.trim() === ""; });
      dibujar();
      campo.focus();
    },

    explicacion: function () {
      guia({
        paso: "Qué estaba mal",
        texto: R.explicacion(app.problema, app.resultado.error),
        acciones: [{ texto: "Intentar de nuevo", alHacer: function () { ir("reintento"); } }]
      });
      dibujar();
    },

    // Prepara la variante guiada y vuelve a construir.
    reintento: function () {
      app.guiada = R.variante(app.problema);
      app.modelo = M.prearmar(M.crear(app.problema), app.problema, app.guiada.barras_prearmadas);
      app.senal = null;
      app.seleccion = null;
      ir("construyendo");
    },

    calculando: function () {
      app.senal = null;
      var esperadas = respuestasEsperadas();
      var form = crear("form", "calculo");
      form.noValidate = true;
      var campos = esperadas.map(function (r) {
        var fila = crear("label", "calculo__fila");
        fila.appendChild(crear("span", "calculo__etiqueta", r.etiqueta));
        var campo = crear("input", "campo campo--numero");
        campo.type = "text";
        campo.inputMode = "decimal";
        campo.autocomplete = "off";
        campo.name = r.id;
        fila.appendChild(campo);
        form.appendChild(fila);
        return campo;
      });
      var comprobar = crear("button", "boton", "Comprobar");
      comprobar.type = "submit";  // Enter en un campo envía el formulario
      form.appendChild(comprobar);
      // Mouse y toque comprueban por Pointer Events (ver alActivar); el envío nativo de ese «click» se anula.
      alActivar(comprobar, revisarCalculo, true);
      comprobar.addEventListener("click", function (e) { if (e.detail > 0) e.preventDefault(); });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        revisarCalculo();
      });

      function revisarCalculo() {
        var primeraMala = null;
        esperadas.forEach(function (r, i) {
          var bien = Math.abs(leerNumero(campos[i].value) - r.valor) < 1e-9;
          campos[i].classList.toggle("campo--senal", !bien);
          campos[i].setAttribute("aria-invalid", bien ? "false" : "true");
          if (!bien && !primeraMala) primeraMala = campos[i];
        });
        if (!primeraMala) { ir("resuelto"); return; }
        // Flujo corto: señal en el campo y una pista que remite al dibujo, sin reflexión.
        el["guia-estado"].textContent = R.pistaCalculo(app.problema);
        primeraMala.focus();
      }

      guia({
        paso: "Ahora sí, calcula",
        texto: "La estructura de tu modelo es correcta. Ahora calcula: la operación sale del dibujo.",
        extra: form
      });
      dibujar();
      campos[0].focus();
    },

    resuelto: function () {
      app.senal = null;
      app.seleccion = null;
      el.taller.hidden = false;
      var extra = null;
      if (app.problema.solucion.expresion && expresionCoincide()) {
        extra = crear("p", "expresion", app.problema.solucion.expresion);
      }
      var siguiente = R.siguiente(app.problema, window.PROBLEMAS);
      var acciones = [];
      if (siguiente) acciones.push({ texto: "Siguiente ejemplo →", href: "problema.html?id=" + encodeURIComponent(siguiente.id) });
      acciones.push({ texto: "Volver a la lista", href: "matematicas.html", secundaria: !!siguiente });
      guia({
        paso: "Resuelto",
        texto: app.problema.modo === "resuelto"
          ? "Así queda el modelo: primero el dibujo, después la operación."
          : "¡Lo resolviste! Primero armaste el modelo y la operación salió del dibujo.",
        extra: extra,
        acciones: acciones
      });
      dibujar();
    },

    // Modo «resuelto»: el modelo se muestra armado paso a paso, sin arrastre ni verificador.
    demostrando: function () {
      el.taller.hidden = false;
      var lista = pasos(), i = app.paso, acciones = [];
      if (i > 0) acciones.push({ texto: "← Paso anterior", secundaria: true, alHacer: function () { app.paso -= 1; ir("demostrando"); } });
      if (i < lista.length - 1) acciones.push({ texto: "Siguiente paso →", alHacer: function () { app.paso += 1; ir("demostrando"); } });
      else acciones.push({ texto: "Terminar", alHacer: function () { ir("resuelto"); } });
      guia({ paso: "Paso " + (i + 1) + " de " + lista.length, texto: lista[i].texto, acciones: acciones });
      dibujar();
    }
  };

  function ir(nuevo) {
    app.estado = nuevo;
    VISTAS[nuevo]();
  }

  // — arrastre y toques (solo tienen efecto en «construyendo») —

  function conectarArrastre() {
    P.arrastre.conectar({
      taller: el.taller,
      svg: el.escena,
      puedeInteractuar: puedeInteractuar,
      alAjustar: function (id, x) {
        if (M.ajustarLargo(app.modelo, id, P.render.largoDesdeX(x))) dibujar();
      },
      alMoverDivisor: function (id, x) {
        if (M.moverDivisor(app.modelo, id, P.render.largoDesdeX(x))) dibujar();
      },
      alTeclaAsa: function (clase, id, delta) {
        var b = M.barra(app.modelo, id);
        var cambio = clase === "asa"
          ? M.ajustarLargo(app.modelo, id, b.largo + delta)
          : M.moverDivisor(app.modelo, id, b.divisor + delta);
        if (cambio) dibujar();
      },
      alSoltar: function (idTarjeta, destino) {
        M.colocar(app.modelo, idTarjeta, destino);
        app.seleccion = null;
        dibujar();
      },
      alTocarTarjeta: function (id) {
        app.seleccion = app.seleccion === id ? null : id;
        dibujar();
      },
      alTocarDestino: function (destino) {
        if (app.seleccion) {
          M.colocar(app.modelo, app.seleccion, destino);
          app.seleccion = null;
        } else if (destino !== "bandeja") {
          var t = M.tarjetaEn(app.modelo, destino);
          if (t && !t.fija) app.seleccion = t.id;
        }
        dibujar();
      },
      alCancelar: function () {
        app.seleccion = null;
        dibujar();
      }
    });
  }

  // — arranque —

  function aviso(texto) {
    el.problema.hidden = true;
    el.titulo.textContent = "No se pudo abrir el problema";
    el["aviso-texto"].textContent = texto;
    el.aviso.hidden = false;
  }

  function etiquetaHero(texto, clase) {
    el.etiquetas.appendChild(crear("span", "hero-etiqueta" + (clase ? " " + clase : ""), texto));
  }

  function preparar(problema) {
    app.problema = problema;
    document.title = problema.titulo + " · Prismino";
    el.antetitulo.textContent = "Nivel " + problema.nivel + " · " + TIPOS[problema.tipo];
    el.titulo.textContent = problema.titulo;
    etiquetaHero(problema.modo === "resuelto" ? "Resuelto paso a paso" : "Interactivo");
    if (problema.borrador) etiquetaHero("Borrador", "hero-etiqueta--borrador");
    el.enunciado.textContent = problema.enunciado;
    app.modelo = problema.modo === "resuelto" ? M.desdeSolucion(problema) : M.crear(problema);
    el.problema.hidden = false;
    conectarArrastre();
    // La geometría del SVG sigue al ancho disponible (p. ej., al girar la tableta).
    var pendiente = false;
    window.addEventListener("resize", function () {
      if (pendiente) return;
      pendiente = true;
      window.requestAnimationFrame(function () {
        pendiente = false;
        if (!el.taller.hidden) dibujar();
      });
    });
    ir("leyendo");
  }

  function iniciar() {
    var problemas = Array.isArray(window.PROBLEMAS) ? window.PROBLEMAS : [];
    var id = new URLSearchParams(window.location.search).get("id");
    if (!id) { aviso("Falta indicar qué problema abrir. Elige uno de la lista."); return; }
    var problema = problemas.filter(function (p) { return p.id === id; })[0];
    if (!problema) { aviso("No encontramos el problema «" + id + "». Elige uno de la lista."); return; }
    if (!M.tipoConocido(problema.tipo)) {
      aviso("El problema «" + id + "» es de un tipo que esta página todavía no sabe mostrar: «" + problema.tipo + "».");
      return;
    }
    try {
      preparar(problema);
    } catch (err) {
      console.error(err);
      aviso("No se pudo armar el problema «" + id + "». Revisa sus datos en data/problemas.js.");
    }
  }

  iniciar();
})();
