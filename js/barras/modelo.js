// Prismino · modelo de barras (sin DOM).
// Estado de las barras de un problema y las operaciones que el estudiante puede hacer sobre él.
// Los largos van en celdas (comparación, parte–todo) o en unidades (unidades); render.js los
// convierte a coordenadas. El verificador compara relaciones entre largos, nunca píxeles.
(function () {
  "use strict";
  var P = window.Prismino = window.Prismino || {};

  // Largo máximo que se puede estirar una barra, por tipo.
  var MAXIMO = { "comparacion": 16, "parte-todo": 16, "unidades": 5 };
  // Largo que ocupa la cantidad mayor cuando el modelo se arma desde la solución.
  var LARGO_REFERENCIA = 14;

  function tipoConocido(tipo) {
    return Object.prototype.hasOwnProperty.call(MAXIMO, tipo);
  }

  function exigirTipo(tipo) {
    if (!tipoConocido(tipo)) throw new Error("Tipo de problema desconocido: " + tipo);
  }

  // Qué tarjeta va en cada destino según los datos: { idDestino: "texto" }.
  function esperados(p) {
    exigirTipo(p.tipo);
    var s = p.solucion, mapa = {};
    if (p.tipo === "comparacion") {
      p.barras.forEach(function (b) { mapa[b.id] = String(b.segmentos[0]); });
      mapa.diferencia = String(s.diferencia);
    } else if (p.tipo === "parte-todo") {
      mapa["parte-1"] = String(p.barras[0].segmentos[0]);
      mapa["parte-2"] = String(p.barras[0].segmentos[1]);
      mapa.total = String(s.total);
    } else {
      p.barras.forEach(function (b) { mapa[b.id] = String(b.segmentos[0]); });
      mapa.total = String(s.total);
    }
    return mapa;
  }

  function textosDeTarjetas(p) {
    if (Array.isArray(p.tarjetas)) return p.tarjetas.map(String);
    var mapa = esperados(p);
    return Object.keys(mapa).map(function (k) { return mapa[k]; });
  }

  function crear(p) {
    exigirTipo(p.tipo);
    return {
      tipo: p.tipo,
      barras: p.barras.map(function (b) {
        return { id: b.id, etiqueta: b.etiqueta, largo: 0, divisor: null, bloqueada: false, divisorFijo: false };
      }),
      tarjetas: textosDeTarjetas(p).map(function (texto, i) {
        return { id: "t" + i, texto: texto, lugar: null, fija: false };
      })
    };
  }

  function barra(estado, id) {
    for (var i = 0; i < estado.barras.length; i++) if (estado.barras[i].id === id) return estado.barras[i];
    return null;
  }

  function tarjeta(estado, id) {
    for (var i = 0; i < estado.tarjetas.length; i++) if (estado.tarjetas[i].id === id) return estado.tarjetas[i];
    return null;
  }

  function tarjetaEn(estado, destino) {
    for (var i = 0; i < estado.tarjetas.length; i++) if (estado.tarjetas[i].lugar === destino) return estado.tarjetas[i];
    return null;
  }

  // Valor numérico de una cantidad del problema; «?» toma el valor de la respuesta.
  function valor(p, v, destino) {
    if (v !== "?") return Number(v);
    var r = p.solucion.respuesta;
    return typeof r === "object" ? r[destino] : r;
  }

  // Lo que vale el «?» colocado en un destino (para revelar la respuesta).
  function valorIncognita(p, destino) {
    var r = p.solucion.respuesta;
    return typeof r === "object" ? r[destino] : r;
  }

  // Destinos donde ahora mismo se puede soltar una tarjeta.
  function destinos(estado) {
    var lista = [];
    if (estado.tipo === "comparacion") {
      estado.barras.forEach(function (b) { if (b.largo > 0) lista.push(b.id); });
      var a = estado.barras[0], b = estado.barras[1];
      if (a.largo > 0 && b.largo > 0 && a.largo !== b.largo) lista.push("diferencia");
    } else if (estado.tipo === "parte-todo") {
      var unica = estado.barras[0];
      if (unica.largo > 0) lista.push("total");
      if (unica.divisor !== null) lista.push("parte-1", "parte-2");
    } else {
      var alguna = false;
      estado.barras.forEach(function (b) { if (b.largo > 0) { lista.push(b.id); alguna = true; } });
      if (alguna) lista.push("total");
    }
    return lista;
  }

  // Devuelve a la bandeja las tarjetas cuyo destino dejó de existir.
  function limpiar(estado) {
    var validos = destinos(estado);
    estado.tarjetas.forEach(function (t) {
      if (t.lugar !== null && validos.indexOf(t.lugar) === -1) { t.lugar = null; t.fija = false; }
    });
  }

  function ajustarLargo(estado, id, largo) {
    var b = barra(estado, id);
    if (!b || b.bloqueada) return false;
    var nuevo = Math.max(0, Math.min(MAXIMO[estado.tipo], Math.round(largo)));
    if (nuevo === b.largo) return false;
    b.largo = nuevo;
    if (b.divisor !== null && b.divisor >= b.largo) b.divisor = b.largo >= 2 ? b.largo - 1 : null;
    limpiar(estado);
    return true;
  }

  function dividir(estado, id) {
    var b = barra(estado, id);
    if (!b || b.largo < 2 || b.divisor !== null) return false;
    b.divisor = Math.round(b.largo / 2);
    return true;
  }

  function unir(estado, id) {
    var b = barra(estado, id);
    if (!b || b.divisor === null || b.divisorFijo) return false;
    b.divisor = null;
    limpiar(estado);
    return true;
  }

  function moverDivisor(estado, id, pos) {
    var b = barra(estado, id);
    if (!b || b.divisor === null || b.divisorFijo) return false;
    var nuevo = Math.max(1, Math.min(b.largo - 1, Math.round(pos)));
    if (nuevo === b.divisor) return false;
    b.divisor = nuevo;
    return true;
  }

  // Pone una tarjeta en un destino («bandeja» o null la devuelve). Si el destino está ocupado,
  // la tarjeta que estaba vuelve a la bandeja.
  function colocar(estado, idTarjeta, destino) {
    var t = tarjeta(estado, idTarjeta);
    if (!t || t.fija) return false;
    if (destino === null || destino === "bandeja") {
      if (t.lugar === null) return false;
      t.lugar = null;
      return true;
    }
    if (destinos(estado).indexOf(destino) === -1) return false;
    var ocupante = tarjetaEn(estado, destino);
    if (ocupante === t) return false;
    if (ocupante) {
      if (ocupante.fija) return false;
      ocupante.lugar = null;
    }
    t.lugar = destino;
    return true;
  }

  // Todas las barras estiradas y todas las tarjetas colocadas.
  function completo(estado) {
    return estado.barras.every(function (b) { return b.largo > 0; }) &&
      estado.tarjetas.every(function (t) { return t.lugar !== null; });
  }

  // Se puede revisar con el modelo completo. En comparación, también con dos barras iguales: sin
  // tramo de diferencia no hay dónde poner esa tarjeta, y el error de estructura ya está a la vista.
  function listoParaRevisar(estado) {
    if (completo(estado)) return true;
    if (estado.tipo !== "comparacion") return false;
    var a = estado.barras[0], b = estado.barras[1];
    return a.largo > 0 && a.largo === b.largo;
  }

  function colocarEsperada(estado, destino, texto, fija) {
    if (tarjetaEn(estado, destino)) return;
    for (var i = 0; i < estado.tarjetas.length; i++) {
      var t = estado.tarjetas[i];
      if (t.lugar === null && t.texto === texto) { t.lugar = destino; t.fija = !!fija; return; }
    }
  }

  // El modelo ya armado: lo usan el modo «resuelto» y las barras prearmadas.
  function desdeSolucion(p) {
    var estado = crear(p), s = p.solucion;
    if (p.tipo === "comparacion") {
      var valores = p.barras.map(function (b) { return valor(p, b.segmentos[0], b.id); });
      var mayor = Math.max.apply(null, valores);
      estado.barras.forEach(function (b, i) { b.largo = valores[i] / mayor * LARGO_REFERENCIA; });
    } else if (p.tipo === "parte-todo") {
      var segs = p.barras[0].segmentos;
      var total = valor(p, s.total);
      estado.barras[0].largo = LARGO_REFERENCIA;
      estado.barras[0].divisor = valor(p, segs[0]) / total * LARGO_REFERENCIA;
    } else {
      estado.barras.forEach(function (b) { b.largo = s.unidades[b.id]; });
    }
    var mapa = esperados(p);
    Object.keys(mapa).forEach(function (d) { colocarEsperada(estado, d, mapa[d], false); });
    return estado;
  }

  // Variante guiada: arma y bloquea los elementos indicados (barras, partes o «total»).
  function prearmar(estado, p, ids) {
    var armado = desdeSolucion(p), mapa = esperados(p);
    (ids || []).forEach(function (id) {
      var b = barra(estado, id), modelo = barra(armado, id);
      if (b && modelo) {
        b.largo = modelo.largo;
        b.bloqueada = true;
      }
      if (estado.tipo === "parte-todo" && (id === "parte-1" || id === "parte-2")) {
        var unica = estado.barras[0];
        unica.largo = armado.barras[0].largo;
        unica.divisor = armado.barras[0].divisor;
        unica.bloqueada = true;
        unica.divisorFijo = true;
      }
    });
    (ids || []).forEach(function (id) {
      if (mapa[id] !== undefined && destinos(estado).indexOf(id) !== -1) colocarEsperada(estado, id, mapa[id], true);
    });
    return estado;
  }

  P.modelo = {
    MAXIMO: MAXIMO,
    tipoConocido: tipoConocido,
    esperados: esperados,
    crear: crear,
    desdeSolucion: desdeSolucion,
    prearmar: prearmar,
    barra: barra,
    tarjeta: tarjeta,
    tarjetaEn: tarjetaEn,
    valorIncognita: valorIncognita,
    destinos: destinos,
    ajustarLargo: ajustarLargo,
    dividir: dividir,
    unir: unir,
    moverDivisor: moverDivisor,
    colocar: colocar,
    completo: completo,
    listoParaRevisar: listoParaRevisar
  };
})();
