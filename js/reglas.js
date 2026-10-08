// Prismino · reglas de adaptación del prototipo.
// Error de estructura → explicación y variante guiada (más ayuda). Acierto → siguiente ejemplo.
// Los textos del problema (data/problemas.js) tienen prioridad; estos son los de respaldo.
(function () {
  "use strict";
  var P = window.Prismino = window.Prismino || {};

  var EXPLICACIONES = {
    barras_iguales: "Las dos cantidades no son iguales: una de las barras debe ser más larga que la otra.",
    barra_invertida: "Vuelve a leer quién tiene más: esa cantidad debe tener la barra más larga.",
    incognita_mal_ubicada: "Vuelve a leer la pregunta: el «?» va justo donde está lo que te piden.",
    dato_mal_ubicado: "Cada número va en la barra o el tramo que representa. Revisa qué cuenta cada uno.",
    faltan_tarjetas: "Todavía hay tarjetas sin colocar en el modelo.",
    sin_dividir: "Una barra entera es el total. Divídela para mostrar sus partes.",
    total_como_parte: "El total abarca toda la barra: va en la llave, no en una de las partes.",
    parte_como_total: "La llave abarca toda la barra. Ese número es solo una de las partes.",
    razon_incorrecta: "Las unidades son todas del mismo tamaño. Cuenta cuántas veces cabe una cantidad en la otra.",
    total_mal_ubicado: "El total es lo que tienen entre todos: va en la llave que abarca todas las barras."
  };

  var PISTAS_CALCULO = {
    "comparacion": "Mira tu dibujo: la barra corta y el tramo de diferencia juntos miden lo mismo que la barra larga.",
    "parte-todo": "Mira tu dibujo: las dos partes juntas miden lo mismo que el total.",
    "unidades": "Mira tu dibujo: todas las unidades juntas valen el total. ¿Cuánto vale una sola?"
  };

  function variantePorDefecto(problema) {
    if (problema.tipo === "comparacion") {
      return { barras_prearmadas: [problema.solucion.mayor], pista: "Ya dibujamos una de las barras. ¿La otra es más larga o más corta?" };
    }
    if (problema.tipo === "parte-todo") {
      return { barras_prearmadas: [problema.barras[0].id], pista: "Ya dibujamos la barra entera. Divídela en partes: ¿qué va en cada una y qué va en la llave?" };
    }
    return { barras_prearmadas: [problema.barras[0].id], pista: "Ya dibujamos una barra. ¿Cuántas unidades iguales le tocan a la otra?" };
  }

  function explicacion(problema, codigo) {
    var e = problema.errores && problema.errores[codigo];
    return (e && e.explicacion) || EXPLICACIONES[codigo] || "Algo en la estructura del modelo no corresponde al problema.";
  }

  // El elemento a resaltar: el que indique el problema para ese error o el que detectó el verificador.
  function senal(problema, resultado) {
    var e = problema.errores && problema.errores[resultado.error];
    return (e && e.senal) || resultado.senal;
  }

  function variante(problema) {
    return problema.variante_guiada || variantePorDefecto(problema);
  }

  function pistaCalculo(problema) {
    return problema.pista_calculo || PISTAS_CALCULO[problema.tipo];
  }

  // El siguiente ejemplo por nivel; null si es el último.
  function siguiente(problema, problemas) {
    var ordenados = problemas.slice().sort(function (a, b) { return a.nivel - b.nivel; });
    var i = ordenados.indexOf(problema);
    return i >= 0 && i < ordenados.length - 1 ? ordenados[i + 1] : null;
  }

  P.reglas = {
    explicacion: explicacion,
    senal: senal,
    variante: variante,
    pistaCalculo: pistaCalculo,
    siguiente: siguiente
  };
})();
