// Problemas del prototipo de feria.
// Se carga con un <script> clásico (sin type="module") para que funcione también con file://.
// Formato: ver «Estructura del prototipo de feria», §4. Claves sin tildes ni eñes.
// barras / solucion / errores / variante_guiada solo están completos donde el documento los define
// (comparación); parte–todo y unidades se completan al construir su verificador.
window.PROBLEMAS = [
  {
    "id": "pt-01",
    "nivel": 1,
    "titulo": "Las figuritas de Ana",
    "tipo": "parte-todo",
    "modo": "interactivo",
    "enunciado": "Ana tiene 45 figuritas y 18 son de fútbol. ¿Cuántas no son de fútbol?"
  },
  {
    "id": "comp-02",
    "nivel": 2,
    "titulo": "Pedro tiene menos canicas",
    "tipo": "comparacion",
    "modo": "interactivo",
    "enunciado": "Luis tiene 32 canicas. Pedro tiene 14 menos. ¿Cuántas tiene Pedro?",
    "barras": [
      { "id": "luis", "etiqueta": "Luis", "segmentos": [32] },
      { "id": "pedro", "etiqueta": "Pedro", "segmentos": ["?"] }
    ],
    "solucion": { "mayor": "luis", "diferencia": 14, "incognita": "pedro", "respuesta": 18 }
  },
  {
    "id": "comp-01",
    "nivel": 3,
    "titulo": "Las canicas de Luis y Pedro",
    "tipo": "comparacion",
    "modo": "interactivo",
    "enunciado": "Luis tiene 32 canicas, 14 más que Pedro. ¿Cuántas tiene Pedro?",
    "barras": [
      { "id": "luis", "etiqueta": "Luis", "segmentos": [32] },
      { "id": "pedro", "etiqueta": "Pedro", "segmentos": ["?"] }
    ],
    "solucion": { "mayor": "luis", "diferencia": 14, "incognita": "pedro", "respuesta": 18 },
    "errores": {
      "barra_invertida": {
        "senal": "pedro",
        "explicacion": "Luis tiene 14 MÁS que Pedro: la barra de Luis debe ser la más larga."
      }
    },
    "variante_guiada": {
      "barras_prearmadas": ["luis"],
      "pista": "Ya dibujamos a Luis. ¿Pedro tiene más o menos que él?"
    }
  },
  {
    "id": "pt-02",
    "nivel": 4,
    "titulo": "Las figuritas que regaló Ana",
    "tipo": "parte-todo",
    "modo": "interactivo",
    "borrador": true, // enunciado propuesto, pendiente de revisión (decisión abierta §9)
    "enunciado": "Ana tenía algunas figuritas. Regaló 12 y le quedaron 33. ¿Cuántas tenía al principio?"
  },
  {
    "id": "uni-01",
    "nivel": 5,
    "titulo": "El dinero de Marta y Juan",
    "tipo": "unidades",
    "modo": "resuelto",
    "enunciado": "Marta y Juan tienen B/.60 y Marta tiene el doble. ¿Cuánto tiene cada uno?"
  }
];
