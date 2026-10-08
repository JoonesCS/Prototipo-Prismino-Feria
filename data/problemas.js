// Problemas del prototipo de feria.
// Se carga con un <script> clásico (sin type="module") para que funcione también con file://.
// Formato: ver «Estructura del prototipo de feria», §4. Claves sin tildes ni eñes.
//
// Campos que lee problema.html:
//   tarjetas        números y «?» que el estudiante coloca en el modelo
//   barras          cada barra como lista de segmentos; «?» marca la incógnita
//   solucion        lo que compara el verificador (depende del tipo) y la expresión final
//   errores         por código de error: senal (qué se resalta) y explicacion
//   variante_guiada barras_prearmadas (ids de barras, partes o «total») y pista
//   pista_calculo   pista del flujo corto cuando la estructura es correcta pero el cálculo no
//   pasos           modo «resuelto»: texto de cada paso y qué elementos se muestran (acumulativo)
window.PROBLEMAS = [
  {
    "id": "pt-01",
    "nivel": 1,
    "titulo": "Las figuritas de Ana",
    "tipo": "parte-todo",
    "modo": "interactivo",
    "enunciado": "Ana tiene 45 figuritas y 18 son de fútbol. ¿Cuántas no son de fútbol?",
    "tarjetas": ["45", "18", "?"],
    "barras": [
      { "id": "ana", "etiqueta": "Ana", "segmentos": [18, "?"] }
    ],
    "solucion": {
      "total": 45, "partes": [18, "?"], "incognita": "parte", "respuesta": 27,
      "expresion": "45 − 18 = 27"
    },
    "errores": {
      "total_como_parte": {
        "explicacion": "Las 45 son todas las figuritas de Ana: van en la llave que abarca toda la barra, no en una parte."
      },
      "parte_como_total": {
        "explicacion": "La llave abarca todas las figuritas de Ana. Las 18 de fútbol son solo una parte de la barra."
      },
      "incognita_mal_ubicada": {
        "explicacion": "Ya sabes cuántas tiene en total. Te preguntan por las que no son de fútbol: son la otra parte de la barra."
      }
    },
    "variante_guiada": {
      "barras_prearmadas": ["ana", "total"],
      "pista": "Ya dibujamos todas las figuritas de Ana. Divide la barra: ¿qué parte son las de fútbol y cuál la que te preguntan?"
    },
    "pista_calculo": "Mira tu dibujo: las dos partes juntas miden lo mismo que las 45. ¿Cuánto falta a 18 para llegar a 45?",
    "pasos": [
      { "texto": "Ana tiene 45 figuritas en total: una barra entera, con una llave que la abarca.", "mostrar": ["ana", "total"] },
      { "texto": "18 son de fútbol: son una parte de la barra.", "mostrar": ["parte-1"] },
      { "texto": "Las que no son de fútbol son la otra parte. Ahí va la pregunta.", "mostrar": ["parte-2"] },
      { "texto": "La parte que falta es el total menos la parte conocida: 45 − 18 = 27.", "mostrar": ["respuesta"] }
    ]
  },
  {
    "id": "comp-02",
    "nivel": 2,
    "titulo": "Pedro tiene menos canicas",
    "tipo": "comparacion",
    "modo": "interactivo",
    "enunciado": "Luis tiene 32 canicas. Pedro tiene 14 menos. ¿Cuántas tiene Pedro?",
    "tarjetas": ["32", "14", "?"],
    "barras": [
      { "id": "luis", "etiqueta": "Luis", "segmentos": [32] },
      { "id": "pedro", "etiqueta": "Pedro", "segmentos": ["?"] }
    ],
    "solucion": {
      "mayor": "luis", "diferencia": 14, "incognita": "pedro", "respuesta": 18,
      "expresion": "32 − 14 = 18"
    },
    "errores": {
      "barra_invertida": {
        "senal": "pedro",
        "explicacion": "Pedro tiene 14 MENOS que Luis: la barra de Pedro debe ser la más corta."
      },
      "incognita_mal_ubicada": {
        "explicacion": "La pregunta es cuántas canicas tiene Pedro: el «?» va en la barra de Pedro."
      },
      "dato_mal_ubicado": {
        "explicacion": "El 32 es lo que tiene Luis. El 14 es lo que le falta a Pedro para llegar a Luis: el tramo de diferencia."
      }
    },
    "variante_guiada": {
      "barras_prearmadas": ["luis"],
      "pista": "Ya dibujamos a Luis. Pedro tiene 14 menos: ¿su barra es más larga o más corta?"
    },
    "pista_calculo": "Mira el tramo de 14 en tu dibujo: Pedro es lo que queda de la barra de Luis sin ese tramo.",
    "pasos": [
      { "texto": "Luis tiene 32 canicas: dibujamos su barra.", "mostrar": ["luis"] },
      { "texto": "Pedro tiene 14 menos: su barra es más corta que la de Luis.", "mostrar": ["pedro"] },
      { "texto": "El tramo que le falta a Pedro para llegar a Luis son las 14 canicas de diferencia.", "mostrar": ["diferencia"] },
      { "texto": "Pedro es la barra de Luis sin ese tramo: 32 − 14 = 18.", "mostrar": ["respuesta"] }
    ]
  },
  {
    "id": "comp-01",
    "nivel": 3,
    "titulo": "Las canicas de Luis y Pedro",
    "tipo": "comparacion",
    "modo": "interactivo",
    "enunciado": "Luis tiene 32 canicas, 14 más que Pedro. ¿Cuántas tiene Pedro?",
    "tarjetas": ["32", "14", "?"],
    "barras": [
      { "id": "luis", "etiqueta": "Luis", "segmentos": [32] },
      { "id": "pedro", "etiqueta": "Pedro", "segmentos": ["?"] }
    ],
    "solucion": {
      "mayor": "luis", "diferencia": 14, "incognita": "pedro", "respuesta": 18,
      "expresion": "32 − 14 = 18"
    },
    "errores": {
      "barra_invertida": {
        "senal": "pedro",
        "explicacion": "Luis tiene 14 MÁS que Pedro: la barra de Luis debe ser la más larga."
      },
      "incognita_mal_ubicada": {
        "explicacion": "La pregunta es cuántas canicas tiene Pedro: el «?» va en la barra de Pedro."
      },
      "dato_mal_ubicado": {
        "explicacion": "El 32 es lo que tiene Luis. El 14 es lo que Luis tiene de más: el tramo que sobra en su barra."
      }
    },
    "variante_guiada": {
      "barras_prearmadas": ["luis"],
      "pista": "Ya dibujamos a Luis. ¿Pedro tiene más o menos que él?"
    },
    "pista_calculo": "Mira el tramo de 14 en tu dibujo: Pedro es lo que queda de la barra de Luis sin ese tramo.",
    "pasos": [
      { "texto": "Luis tiene 32 canicas: dibujamos su barra.", "mostrar": ["luis"] },
      { "texto": "Luis tiene 14 más que Pedro. Entonces Pedro tiene menos: su barra es la más corta.", "mostrar": ["pedro"] },
      { "texto": "El tramo que sobra en la barra de Luis son las 14 canicas de diferencia.", "mostrar": ["diferencia"] },
      { "texto": "«14 más» no significa sumar: Pedro es la barra de Luis sin el tramo. 32 − 14 = 18.", "mostrar": ["respuesta"] }
    ]
  },
  {
    "id": "pt-02",
    "nivel": 4,
    "titulo": "Las figuritas que regaló Ana",
    "tipo": "parte-todo",
    "modo": "interactivo",
    "borrador": true, // enunciado propuesto, pendiente de revisión (decisión abierta §9)
    "enunciado": "Ana tenía algunas figuritas. Regaló 12 y le quedaron 33. ¿Cuántas tenía al principio?",
    "tarjetas": ["12", "33", "?"],
    "barras": [
      { "id": "ana", "etiqueta": "Ana", "segmentos": [12, 33] }
    ],
    "solucion": {
      "total": "?", "partes": [12, 33], "incognita": "total", "respuesta": 45,
      "expresion": "12 + 33 = 45"
    },
    "errores": {
      "parte_como_total": {
        "explicacion": "Lo que regaló y lo que le quedó son partes. Lo que tenía al principio son las dos partes juntas: el total."
      },
      "total_como_parte": {
        "explicacion": "Lo que tenía al principio es el total: el «?» va en la llave que abarca toda la barra."
      }
    },
    "variante_guiada": {
      "barras_prearmadas": ["ana"],
      "pista": "Ya dibujamos la barra entera. Divídela en lo que regaló y lo que le quedó. ¿Dónde va lo que tenía al principio?"
    },
    "pista_calculo": "Mira tu dibujo: la llave abarca las dos partes. Junta lo que regaló y lo que le quedó.",
    "pasos": [
      { "texto": "Ana regaló 12 figuritas: es una parte de la barra.", "mostrar": ["ana", "parte-1"] },
      { "texto": "Le quedaron 33: es la otra parte.", "mostrar": ["parte-2"] },
      { "texto": "Lo que tenía al principio son las dos partes juntas: el total. Ahí va la pregunta.", "mostrar": ["total"] },
      { "texto": "Juntamos las dos partes: 12 + 33 = 45.", "mostrar": ["respuesta"] }
    ]
  },
  {
    "id": "uni-01",
    "nivel": 5,
    "titulo": "El dinero de Marta y Juan",
    "tipo": "unidades",
    "modo": "interactivo",
    "enunciado": "Marta y Juan tienen B/.60 y Marta tiene el doble. ¿Cuánto tiene cada uno?",
    "tarjetas": ["60", "?", "?"],
    "barras": [
      { "id": "juan", "etiqueta": "Juan", "segmentos": ["?"] },
      { "id": "marta", "etiqueta": "Marta", "segmentos": ["?"] }
    ],
    "solucion": {
      "unidades": { "juan": 1, "marta": 2 }, "total": 60,
      "respuesta": { "juan": 20, "marta": 40 },
      "expresion": "3 unidades = 60 → 1 unidad = 20 · Juan: B/.20 · Marta: 2 × 20 = B/.40"
    },
    "errores": {
      "razon_incorrecta": {
        "senal": "marta",
        "explicacion": "Marta tiene el doble que Juan: si Juan tiene 1 unidad, Marta tiene 2 unidades del mismo tamaño."
      },
      "total_mal_ubicado": {
        "explicacion": "B/.60 es lo que tienen entre los dos: va en la llave que abarca las dos barras."
      }
    },
    "variante_guiada": {
      "barras_prearmadas": ["juan"],
      "pista": "Juan ya tiene 1 unidad. Marta tiene el doble: ¿cuántas unidades iguales le tocan?"
    },
    "pista_calculo": "Mira tu dibujo: todas las unidades juntas valen B/.60. ¿Cuánto vale una sola?",
    "pasos": [
      { "texto": "No sabemos cuánto tiene Juan: lo dibujamos como 1 unidad.", "mostrar": ["juan"] },
      { "texto": "Marta tiene el doble: 2 unidades iguales a la de Juan.", "mostrar": ["marta"] },
      { "texto": "Entre los dos tienen B/.60: las 3 unidades valen 60.", "mostrar": ["total"] },
      { "texto": "1 unidad vale 60 ÷ 3 = 20. Juan tiene B/.20 y Marta, 2 × 20 = B/.40.", "mostrar": ["respuesta"] }
    ]
  }
];
