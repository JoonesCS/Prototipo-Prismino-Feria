// Prismino · verificador: una función por estructura.
// Revisa la ESTRUCTURA del modelo (qué barra es mayor, qué es parte de qué, dónde está el «?»),
// no el cálculo. Devuelve { correcto, error, senal }: senal es el id del elemento a resaltar.
(function () {
  "use strict";
  var P = window.Prismino = window.Prismino || {};
  var M = P.modelo;

  function bien() { return { correcto: true, error: null, senal: null }; }
  function mal(error, senal) { return { correcto: false, error: error, senal: senal || null }; }

  function textoEn(estado, destino) {
    var t = M.tarjetaEn(estado, destino);
    return t ? t.texto : null;
  }

  function lugarDe(estado, texto) {
    for (var i = 0; i < estado.tarjetas.length; i++) {
      if (estado.tarjetas[i].texto === texto) return estado.tarjetas[i].lugar;
    }
    return null;
  }

  // Primer destino cuya tarjeta no es la esperada.
  function primerDatoMalUbicado(problema, estado) {
    var mapa = M.esperados(problema);
    var ids = Object.keys(mapa);
    for (var i = 0; i < ids.length; i++) {
      if (textoEn(estado, ids[i]) !== mapa[ids[i]]) return ids[i];
    }
    return null;
  }

  function verificarComparacion(problema, estado) {
    var s = problema.solucion;
    var mayor = M.barra(estado, s.mayor);
    var menor = estado.barras[0] === mayor ? estado.barras[1] : estado.barras[0];

    if (mayor.largo > 0 && mayor.largo === menor.largo) return mal("barras_iguales", menor.id);
    if (!M.completo(estado)) return mal("faltan_tarjetas", "bandeja");
    if (menor.largo > mayor.largo) return mal("barra_invertida", menor.id);

    var lugarIncognita = lugarDe(estado, "?");
    if (lugarIncognita !== s.incognita) return mal("incognita_mal_ubicada", lugarIncognita);

    var malUbicado = primerDatoMalUbicado(problema, estado);
    if (malUbicado) return mal("dato_mal_ubicado", malUbicado);
    return bien();
  }

  function verificarParteTodo(problema, estado) {
    var unica = estado.barras[0];
    var totalEsperado = M.esperados(problema).total;

    if (unica.divisor === null) return mal("sin_dividir", unica.id);
    if (!M.completo(estado)) return mal("faltan_tarjetas", "bandeja");

    var enTotal = textoEn(estado, "total");
    if (enTotal !== totalEsperado) {
      if (enTotal === "?") return mal("incognita_mal_ubicada", "total");
      var lugarTotal = lugarDe(estado, totalEsperado);
      if (totalEsperado !== "?" && (lugarTotal === "parte-1" || lugarTotal === "parte-2")) {
        return mal("total_como_parte", lugarTotal);
      }
      return mal("parte_como_total", "total");
    }

    // Con el total bien puesto, las partes son las dos tarjetas restantes (el orden no importa).
    var esperadas = problema.barras[0].segmentos.map(String).sort();
    var puestas = [textoEn(estado, "parte-1"), textoEn(estado, "parte-2")].sort();
    if (esperadas[0] !== puestas[0] || esperadas[1] !== puestas[1]) {
      return mal("dato_mal_ubicado", "parte-1");
    }
    return bien();
  }

  function verificarUnidades(problema, estado) {
    var u = problema.solucion.unidades;
    if (!M.completo(estado)) return mal("faltan_tarjetas", "bandeja");

    // Las unidades deben respetar la razón (Marta = 2 × Juan): a.largo / u[a] = b.largo / u[b].
    var base = estado.barras[0];
    for (var i = 1; i < estado.barras.length; i++) {
      var b = estado.barras[i];
      if (base.largo * u[b.id] !== b.largo * u[base.id]) {
        var senal = u[b.id] >= u[base.id] ? b.id : base.id;
        return mal("razon_incorrecta", senal);
      }
    }

    var totalEsperado = M.esperados(problema).total;
    if (textoEn(estado, "total") !== totalEsperado) {
      return mal("total_mal_ubicado", lugarDe(estado, totalEsperado));
    }
    return bien();
  }

  var verificadores = {
    "parte-todo": verificarParteTodo,
    "comparacion": verificarComparacion,
    "unidades": verificarUnidades
  };

  P.verificar = function (problema, estado) {
    var fn = verificadores[problema.tipo];
    if (!fn) throw new Error("Tipo de problema desconocido: " + problema.tipo);
    return fn(problema, estado);
  };
})();
