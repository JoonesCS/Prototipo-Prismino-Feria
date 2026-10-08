// Prismino · arrastre con Pointer Events (mouse y pantalla táctil) y alternativa de tocar y tocar.
// No guarda estado del problema: antes de cada gesto pregunta a problema.js si se puede interactuar,
// y le avisa lo que pasó mediante callbacks. Así las barras quedan bloqueadas fuera de «construyendo».
(function () {
  "use strict";
  var P = window.Prismino = window.Prismino || {};
  var UMBRAL = 6; // px que hay que mover para que un toque se vuelva arrastre

  // op: { taller, svg, puedeInteractuar(), alAjustar(id, x), alMoverDivisor(id, x), alTeclaAsa(clase, id, delta),
  //       alSoltar(idTarjeta, destino|null), alTocarTarjeta(id), alTocarDestino(id), alCancelar() }
  function conectar(op) {
    var taller = op.taller, svg = op.svg;
    var gesto = null, fantasma = null, encima = null;

    function aSvg(e) {
      var m = svg.getScreenCTM();
      if (!m) return { x: 0, y: 0 };
      var pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      return pt.matrixTransform(m.inverse());
    }

    function destinoBajo(e) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      var d = el && el.closest("[data-destino]");
      return d && taller.contains(d) ? d : null;
    }

    function marcarEncima(d) {
      if (encima === d) return;
      if (encima) encima.classList.remove("destino--encima");
      encima = d;
      if (encima) encima.classList.add("destino--encima");
    }

    function terminar() {
      if (fantasma) fantasma.remove();
      fantasma = null;
      marcarEncima(null);
      taller.classList.remove("taller--arrastrando");
      gesto = null;
    }

    // Un toque sobre una tarjeta o un destino (tocar y tocar).
    function tocar(objetivo) {
      if (!op.puedeInteractuar()) return;
      var tarjeta = objetivo.closest("[data-tarjeta]");
      if (tarjeta && !tarjeta.closest("svg")) { op.alTocarTarjeta(tarjeta.getAttribute("data-tarjeta")); return; }
      var d = objetivo.closest("[data-destino]");
      if (d) op.alTocarDestino(d.getAttribute("data-destino"));
    }

    taller.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (gesto || !op.puedeInteractuar()) return;
      var asa = e.target.closest("[data-asa]");
      var div = e.target.closest("[data-divisor]");
      if (asa || div) {
        gesto = { clase: asa ? "asa" : "divisor", id: asa ? asa.getAttribute("data-asa") : div.getAttribute("data-divisor"), puntero: e.pointerId };
        // Se captura en el SVG, que no se redibuja: el asa sí se reemplaza en cada cambio.
        svg.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }
      // Toque o, si se mueve una tarjeta, arrastre.
      var tarjeta = e.target.closest("[data-tarjeta]");
      gesto = {
        clase: "toque", objetivo: e.target, puntero: e.pointerId,
        x0: e.clientX, y0: e.clientY, arrastrando: false,
        tarjeta: tarjeta ? tarjeta.getAttribute("data-tarjeta") : null,
        desdeModelo: !!(tarjeta && tarjeta.closest("svg")),
        texto: tarjeta ? tarjeta.textContent : ""
      };
    });

    // Movimiento y fin se escuchan en window: el puntero puede salir del taller antes de capturarse.
    window.addEventListener("pointermove", function (e) {
      if (!gesto || e.pointerId !== gesto.puntero) return;
      if (gesto.clase === "asa") { op.alAjustar(gesto.id, aSvg(e).x); return; }
      if (gesto.clase === "divisor") { op.alMoverDivisor(gesto.id, aSvg(e).x); return; }

      if (!gesto.arrastrando) {
        if (Math.abs(e.clientX - gesto.x0) + Math.abs(e.clientY - gesto.y0) < UMBRAL) return;
        // Se movió: ya no es un toque. Solo las tarjetas se arrastran.
        if (!gesto.tarjeta || !op.puedeInteractuar()) { terminar(); return; }
        gesto.arrastrando = true;
        taller.setPointerCapture(e.pointerId);
        taller.classList.add("taller--arrastrando");
        fantasma = document.createElement("div");
        fantasma.className = "tarjeta tarjeta-fantasma" + (gesto.texto === "?" ? " tarjeta--incognita" : "");
        fantasma.textContent = gesto.texto;
        fantasma.setAttribute("aria-hidden", "true");
        document.body.appendChild(fantasma);
      }
      e.preventDefault();
      fantasma.style.left = e.clientX + "px";
      fantasma.style.top = e.clientY + "px";
      marcarEncima(destinoBajo(e));
    });

    window.addEventListener("pointerup", function (e) {
      if (!gesto || e.pointerId !== gesto.puntero) return;
      var g = gesto;
      if (g.clase === "toque" && g.arrastrando) {
        var d = destinoBajo(e);
        var id = d ? d.getAttribute("data-destino") : null;
        terminar();
        // Soltar fuera de todo destino: una tarjeta del modelo vuelve a la bandeja.
        if (id !== null || g.desdeModelo) op.alSoltar(g.tarjeta, id);
        return;
      }
      terminar();
      // El toque se resuelve aquí y no con «click»: tras otro gesto táctil el navegador a veces no lo genera.
      if (g.clase === "toque") tocar(g.objetivo);
    });

    window.addEventListener("pointercancel", function (e) {
      if (gesto && e.pointerId === gesto.puntero) terminar();
    });

    // «click» solo para el teclado (Enter o Espacio sobre los botones de la bandeja): detail === 0.
    taller.addEventListener("click", function (e) {
      if (e.detail === 0) tocar(e.target);
    });

    taller.addEventListener("keydown", function (e) {
      if (!op.puedeInteractuar()) return;
      if (e.key === "Escape") { op.alCancelar(); return; }
      var asa = e.target.closest("[data-asa]");
      var div = e.target.closest("[data-divisor]");
      if (asa || div) {
        var delta = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
        if (delta) {
          e.preventDefault();
          op.alTeclaAsa(asa ? "asa" : "divisor", asa ? asa.getAttribute("data-asa") : div.getAttribute("data-divisor"), delta);
        }
        return;
      }
      var destino = e.target.closest("svg [data-destino]");
      if (destino && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        op.alTocarDestino(destino.getAttribute("data-destino"));
      }
    });
  }

  P.arrastre = { conectar: conectar };
})();
