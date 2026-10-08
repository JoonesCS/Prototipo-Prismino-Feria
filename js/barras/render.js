// Prismino · dibujo del modelo de barras en SVG.
// Es el mismo para los tres tipos: recibe el estado de modelo.js y lo dibuja completo en cada cambio.
// Los colores salen de clases en css/barras.css (fill/stroke no aceptan var() de forma fiable).
(function () {
  "use strict";
  var P = window.Prismino = window.Prismino || {};
  var M = P.modelo;

  // Geometría en unidades del viewBox (no son estilos). El ancho del viewBox sigue al ancho real del
  // SVG, entre ANCHO_MIN y ANCHO_MAX, para que en pantallas chicas las barras y asas no se encojan de más.
  var ANCHO_MIN = 480, ANCHO_MAX = 800;
  var ALTO = 52;            // alto de una barra
  var FILA = 104;           // distancia entre barras
  var ARRIBA = 28;          // margen superior
  var Y_PARTE_TODO = 108;   // en parte–todo la llave del total va arriba de la barra
  var MARGEN = 20;          // margen derecho
  var RESERVA_LLAVE = 136;  // en unidades, la llave del total va a la derecha de las barras

  // Se recalculan en cada dibujo (ver medir).
  var ANCHO = ANCHO_MAX;    // ancho del viewBox
  var X0 = 140;             // inicio de las barras (a la izquierda van los nombres)
  var CELDA = 40;           // largo de una celda o unidad

  function medir(svg, tipo) {
    var real = Math.round(svg.getBoundingClientRect().width) || ANCHO_MAX;
    ANCHO = Math.max(ANCHO_MIN, Math.min(ANCHO_MAX, real));
    X0 = ANCHO < 640 ? 96 : 140;
    var disponible = ANCHO - X0 - MARGEN - (tipo === "unidades" ? RESERVA_LLAVE : 0);
    CELDA = disponible / M.MAXIMO[tipo];
  }

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function n(v) { return Math.round(v * 10) / 10; }

  // Convierte una x del viewBox (del último dibujo) en largo del modelo.
  function largoDesdeX(x) { return (x - X0) / CELDA; }

  function filas(estado) {
    var y = {};
    if (estado.tipo === "parte-todo") {
      y[estado.barras[0].id] = Y_PARTE_TODO;
      return { y: y, alto: Y_PARTE_TODO + ALTO + 44 };
    }
    estado.barras.forEach(function (b, i) { y[b.id] = ARRIBA + i * FILA; });
    return { y: y, alto: ARRIBA + (estado.barras.length - 1) * FILA + ALTO + 36 };
  }

  function tarjetaSvg(t, cx, cy, op) {
    var texto = t.texto, revelada = false;
    if (op.revelar && t.texto === "?" && op.valorDe) {
      texto = op.valorDe(t.lugar);
      revelada = true;
    }
    var w = Math.max(56, 15 * String(texto).length + 32), h = 38;
    var clases = "tarjeta-svg" +
      (t.texto === "?" ? " tarjeta-svg--incognita" : "") +
      (revelada ? " tarjeta-svg--revelada" : "") +
      (t.fija ? " tarjeta-svg--fija" : "") +
      (op.seleccion === t.id ? " tarjeta-svg--seleccionada" : "");
    return '<g class="' + clases + '"' + (op.interactivo && !t.fija ? ' data-tarjeta="' + t.id + '"' : "") + ">" +
      '<rect x="' + n(cx - w / 2) + '" y="' + n(cy - h / 2) + '" width="' + n(w) + '" height="' + h + '" rx="' + h / 2 + '"/>' +
      '<text x="' + n(cx) + '" y="' + n(cy + 7) + '" text-anchor="middle">' + esc(texto) + "</text></g>";
  }

  // Un lugar donde puede ir una tarjeta. `caja` es su zona sensible y el marco de la señal.
  function destino(ctx, id, etiqueta, caja, interior, centro) {
    var op = ctx.op, estado = ctx.estado;
    var activo = op.interactivo && ctx.disponibles.indexOf(id) !== -1;
    var t = M.tarjetaEn(estado, id);
    ctx.cajas[id] = caja;
    var attrs = ' data-id="' + id + '"';
    if (activo) {
      attrs += ' data-destino="' + id + '" tabindex="0" role="button" aria-label="' +
        esc(etiqueta + (t ? ": tarjeta " + t.texto : ": vacío")) + '"';
    }
    var clase = "destino" + (activo && op.seleccion ? " destino--disponible" : "");
    return '<g class="' + clase + '"' + attrs + ">" + interior +
      '<rect class="destino__zona" x="' + n(caja.x) + '" y="' + n(caja.y) + '" width="' + n(caja.w) + '" height="' + n(caja.h) + '" rx="3"/>' +
      (t && ctx.ve(id) ? tarjetaSvg(t, centro.x, centro.y, op) : "") + "</g>";
  }

  function asa(b, x, y, tipo) {
    return '<g class="asa" data-asa="' + b.id + '" tabindex="0" role="slider" aria-label="Largo de la barra de ' + esc(b.etiqueta) +
      '" aria-valuemin="0" aria-valuemax="' + M.MAXIMO[tipo] + '" aria-valuenow="' + b.largo + '">' +
      '<rect class="asa__zona" x="' + n(x - 22) + '" y="' + (y - 10) + '" width="44" height="' + (ALTO + 20) + '"/>' +
      '<rect class="asa__cuerpo" x="' + n(x - 10) + '" y="' + (y - 8) + '" width="20" height="' + (ALTO + 16) + '" rx="5"/>' +
      '<path class="asa__surco" d="M' + n(x - 3) + " " + (y + ALTO / 2 - 9) + " v18 M" + n(x + 3) + " " + (y + ALTO / 2 - 9) + ' v18"/></g>';
  }

  function divisorSvg(b, x, y) {
    return '<g class="divisor" data-divisor="' + b.id + '" tabindex="0" role="slider" aria-label="División de la barra de ' + esc(b.etiqueta) +
      '" aria-valuemin="1" aria-valuemax="' + (b.largo - 1) + '" aria-valuenow="' + b.divisor + '">' +
      '<rect class="asa__zona" x="' + n(x - 22) + '" y="' + (y - 10) + '" width="44" height="' + (ALTO + 44) + '"/>' +
      '<path class="divisor__linea" d="M' + n(x) + " " + (y - 6) + " V" + (y + ALTO + 6) + '"/>' +
      '<rect class="asa__cuerpo" x="' + n(x - 10) + '" y="' + (y + ALTO + 8) + '" width="20" height="22" rx="5"/>' +
      '<path class="asa__surco" d="M' + n(x - 3) + " " + (y + ALTO + 13) + " v12 M" + n(x + 3) + " " + (y + ALTO + 13) + ' v12"/></g>';
  }

  function etiqueta(b, y) {
    return '<text class="escena__nombre" x="' + (X0 - 18) + '" y="' + (y + ALTO / 2 + 7) + '" text-anchor="end">' + esc(b.etiqueta) + "</text>";
  }

  function barraVacia(y) {
    return '<rect class="barra-vacia" x="' + X0 + '" y="' + y + '" width="100" height="' + ALTO + '" rx="2"/>' +
      '<text class="barra-vacia__texto" x="' + (X0 + 12) + '" y="' + (y + ALTO / 2 + 6) + '">Estira →</text>';
  }

  // — comparación y unidades: una fila por barra —
  function dibujarFilas(ctx) {
    var estado = ctx.estado, op = ctx.op, C = CELDA, s = "";
    estado.barras.forEach(function (b, i) {
      if (!ctx.ve(b.id)) return;
      var y = ctx.filas.y[b.id], w = b.largo * C;
      s += etiqueta(b, y);
      if (b.largo === 0) {
        if (op.interactivo) s += barraVacia(y);
      } else {
        var interior = "";
        if (estado.tipo === "unidades") {
          for (var k = 0; k < b.largo; k++) {
            interior += '<rect class="barra barra--' + i + '" x="' + (X0 + k * C + 2) + '" y="' + y + '" width="' + (C - 4) + '" height="' + ALTO + '" rx="2"/>';
          }
        } else {
          interior = '<rect class="barra barra--' + i + '" x="' + X0 + '" y="' + y + '" width="' + n(w) + '" height="' + ALTO + '" rx="2"/>';
        }
        s += destino(ctx, b.id, "Barra de " + b.etiqueta, { x: X0, y: y, w: w, h: ALTO }, interior, { x: X0 + w / 2, y: y + ALTO / 2 });
      }
    });

    if (estado.tipo === "comparacion" && ctx.ve("diferencia")) {
      var a = estado.barras[0], c = estado.barras[1];
      if (a.largo > 0 && c.largo > 0 && a.largo !== c.largo && ctx.ve(a.id) && ctx.ve(c.id)) {
        var corta = a.largo < c.largo ? a : c, larga = corta === a ? c : a;
        var x1 = X0 + corta.largo * C, x2 = X0 + larga.largo * C, yd = ctx.filas.y[corta.id];
        var tramo = '<rect class="tramo" x="' + n(x1) + '" y="' + (yd + 1) + '" width="' + n(x2 - x1) + '" height="' + (ALTO - 2) + '" rx="2"/>';
        s += destino(ctx, "diferencia", "Tramo de diferencia", { x: x1, y: yd, w: x2 - x1, h: ALTO }, tramo, { x: (x1 + x2) / 2, y: yd + ALTO / 2 });
      }
    }

    if (estado.tipo === "unidades" && ctx.ve("total")) {
      var alguna = estado.barras.some(function (b) { return b.largo > 0 && ctx.ve(b.id); });
      if (alguna) {
        var xb = X0 + M.MAXIMO.unidades * C + 24;
        var yA = ARRIBA, yB = ctx.filas.y[estado.barras[estado.barras.length - 1].id] + ALTO, ym = (yA + yB) / 2;
        var llave = '<path class="llave" d="M' + xb + " " + yA + " Q" + (xb + 10) + " " + yA + " " + (xb + 10) + " " + (yA + 10) +
          " V" + (ym - 10) + " Q" + (xb + 10) + " " + ym + " " + (xb + 20) + " " + ym +
          " Q" + (xb + 10) + " " + ym + " " + (xb + 10) + " " + (ym + 10) +
          " V" + (yB - 10) + " Q" + (xb + 10) + " " + yB + " " + xb + " " + yB + '"/>';
        var ranura = M.tarjetaEn(estado, "total") ? "" :
          '<rect class="ranura" x="' + (xb + 30) + '" y="' + (ym - 19) + '" width="96" height="38" rx="19"/>';
        s += destino(ctx, "total", "Llave del total", { x: xb, y: yA, w: ANCHO - xb, h: yB - yA }, llave + ranura, { x: xb + 78, y: ym });
      }
    }

    if (op.interactivo) {
      estado.barras.forEach(function (b) {
        if (!b.bloqueada) s += asa(b, X0 + b.largo * C, ctx.filas.y[b.id], estado.tipo);
      });
    }
    return s;
  }

  // — parte–todo: una barra que se divide, con la llave del total arriba —
  function dibujarParteTodo(ctx) {
    var estado = ctx.estado, op = ctx.op, C = CELDA, s = "";
    var b = estado.barras[0];
    if (!ctx.ve(b.id)) return s;
    var y = ctx.filas.y[b.id], w = b.largo * C;
    s += etiqueta(b, y);

    if (b.largo === 0) {
      if (op.interactivo) s += barraVacia(y);
    } else {
      var verPartes = b.divisor !== null && (ctx.ve("parte-1") || ctx.ve("parte-2"));
      if (!verPartes) {
        s += '<g data-id="' + b.id + '"><rect class="barra barra--0" x="' + X0 + '" y="' + y + '" width="' + n(w) + '" height="' + ALTO + '" rx="2"/></g>';
        ctx.cajas[b.id] = { x: X0, y: y, w: w, h: ALTO };
      } else {
        var xd = X0 + b.divisor * C;
        s += destino(ctx, "parte-1", "Primera parte", { x: X0, y: y, w: xd - X0, h: ALTO },
          '<rect class="barra parte--1" x="' + X0 + '" y="' + y + '" width="' + n(xd - X0) + '" height="' + ALTO + '" rx="2"/>',
          { x: (X0 + xd) / 2, y: y + ALTO / 2 });
        s += destino(ctx, "parte-2", "Segunda parte", { x: xd, y: y, w: X0 + w - xd, h: ALTO },
          '<rect class="barra parte--2" x="' + n(xd) + '" y="' + y + '" width="' + n(X0 + w - xd) + '" height="' + ALTO + '" rx="2"/>',
          { x: (xd + X0 + w) / 2, y: y + ALTO / 2 });
        ctx.cajas[b.id] = { x: X0, y: y, w: w, h: ALTO };
      }

      if (ctx.ve("total")) {
        var x1 = X0, x2 = X0 + w, xm = (x1 + x2) / 2, yl = y - 16;
        var llave = '<path class="llave" d="M' + x1 + " " + yl + " V" + (yl - 8) + " Q" + x1 + " " + (yl - 14) + " " + (x1 + 6) + " " + (yl - 14) +
          " H" + n(xm - 10) + " Q" + n(xm) + " " + (yl - 14) + " " + n(xm) + " " + (yl - 24) +
          " Q" + n(xm) + " " + (yl - 14) + " " + n(xm + 10) + " " + (yl - 14) +
          " H" + n(x2 - 6) + " Q" + n(x2) + " " + (yl - 14) + " " + n(x2) + " " + (yl - 8) + " V" + yl + '"/>';
        var ranura = M.tarjetaEn(estado, "total") ? "" :
          '<rect class="ranura" x="' + n(xm - 48) + '" y="' + 8 + '" width="96" height="38" rx="19"/>';
        s += destino(ctx, "total", "Llave del total", { x: x1, y: 4, w: w, h: yl - 4 }, llave + ranura, { x: xm, y: 27 });
      }
    }

    if (op.interactivo) {
      if (b.divisor !== null && !b.divisorFijo && b.largo > 0) s += divisorSvg(b, X0 + b.divisor * C, y);
      if (!b.bloqueada) s += asa(b, X0 + w, y, estado.tipo);
    }
    return s;
  }

  // op: { interactivo, visibles (lista de ids o null = todo), senal, seleccion, revelar, valorDe(destino) }
  function escena(svg, estado, op) {
    op = op || {};
    var visibles = op.visibles || null;
    medir(svg, estado.tipo);
    var ctx = {
      estado: estado,
      op: op,
      filas: filas(estado),
      cajas: {},
      disponibles: op.interactivo ? M.destinos(estado) : [],
      ve: function (id) { return !visibles || visibles.indexOf(id) !== -1; }
    };
    var s = estado.tipo === "parte-todo" ? dibujarParteTodo(ctx) : dibujarFilas(ctx);

    var caja = op.senal && ctx.cajas[op.senal];
    if (caja) {
      s += '<rect class="senal-marco" x="' + n(caja.x - 7) + '" y="' + n(caja.y - 7) + '" width="' + n(caja.w + 14) +
        '" height="' + n(caja.h + 14) + '" rx="6"/>';
    }
    svg.setAttribute("viewBox", "0 0 " + ANCHO + " " + ctx.filas.alto);
    svg.innerHTML = s;
  }

  // Tarjetas que todavía no están en el modelo.
  function bandeja(lista, estado, op) {
    op = op || {};
    lista.innerHTML = "";
    estado.tarjetas.forEach(function (t) {
      if (t.lugar !== null) return;
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "tarjeta" + (t.texto === "?" ? " tarjeta--incognita" : "");
      boton.setAttribute("data-tarjeta", t.id);
      boton.setAttribute("aria-pressed", op.seleccion === t.id ? "true" : "false");
      boton.disabled = !op.interactivo;
      boton.textContent = t.texto;
      lista.appendChild(boton);
    });
  }

  P.render = {
    escena: escena,
    bandeja: bandeja,
    largoDesdeX: largoDesdeX
  };
})();
