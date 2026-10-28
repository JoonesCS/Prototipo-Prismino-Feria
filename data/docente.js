// Datos de ejemplo del panel docente (maqueta). Estudiantes y cifras inventados.
// Se carga con un <script> clásico (sin type="module") para que funcione también con file://.
//
// Lo que el panel muestra sale de lo que Prismino verifica: la estructura del modelo de barras,
// el cálculo, la ayuda usada y la autorreflexión académica. Nunca datos emocionales (Ley 81),
// nunca puntos ni posiciones entre estudiantes.
//
// estados de habilidad: "domina" | "practica" | "atascado" | "pendiente"
// ayuda en el historial: "resuelto" (ejemplo resuelto) | "guiado" (barras a medio armar) | "independiente"
window.DOCENTE = {
  grupo: {
    nombre: "5.° B",
    area: "Matemáticas · Modelo de barras",
    estudiantes: 28,
    semana: "26 al 30 de octubre",
    necesitan_apoyo: 9,
    errores_estructura: 41,
    errores_calculo: 17
  },

  // Rutas del grafo de habilidades: cada una es una cadena de prerrequisitos.
  rutas: [
    { nombre: "Parte–todo y comparación", habilidades: ["sumres", "pt-parte", "pt-total", "comp-dif", "comp-menor"] },
    { nombre: "Unidades", habilidades: ["muldiv", "uni-iguales", "uni-doble"] }
  ],
  habilidades: {
    "sumres":      { nombre: "Sumar y restar hasta 1 000", grado: "3.°" },
    "pt-parte":    { nombre: "Parte–todo: parte desconocida", grado: "5.°" },
    "pt-total":    { nombre: "Parte–todo: total en la llave", grado: "5.°" },
    "comp-dif":    { nombre: "Comparación: hallar la diferencia", grado: "5.°" },
    "comp-menor":  { nombre: "Comparación: «menos que» y «más que»", grado: "5.°" },
    "muldiv":      { nombre: "Dividir en partes iguales", grado: "4.°" },
    "uni-iguales": { nombre: "Unidades: reparto en partes iguales", grado: "5.°" },
    "uni-doble":   { nombre: "Unidades: uno tiene el doble", grado: "5.°" }
  },

  // «Para la clase de mañana»: habilidades ordenadas por cuántos estudiantes atascan.
  clase: [
    {
      habilidad: "comp-menor",
      estudiantes: 6,
      error: "Barra invertida: dibujan más larga la cantidad que tiene «menos».",
      sugerencia: "Con dos tiras de papel, que el grupo represente a Luis y a Pedro antes de leer ningún número.",
      pregunta: "Si Pedro tiene 14 menos que Luis, ¿quién necesita la tira más larga? ¿Cómo lo sabes sin hacer cuentas?"
    },
    {
      habilidad: "uni-doble",
      estudiantes: 3,
      error: "Cuentan 2 unidades en vez de 3: el vacío viene de dividir en partes iguales (4.°).",
      sugerencia: "Repartir 12 fichas entre dos, uno con el doble, y contar cuántos montones iguales salen.",
      pregunta: "Si Marta tiene el doble que Juan, ¿cuántos «pedazos de Juan» caben en todo el dinero?"
    },
    {
      habilidad: "pt-total",
      estudiantes: 2,
      error: "Ponen el total como una de las partes.",
      sugerencia: "Una cuerda que rodea a todo el grupo es el total; cada fila de pupitres es una parte.",
      pregunta: "¿Qué número abarca a todos los demás? ¿Dónde lo pondrías en el dibujo?"
    }
  ],

  estudiantes: [
    {
      id: "valeria",
      nombre: "Valeria Ríos",
      ultima: "hoy, 10:42",
      problemas_semana: 12,
      prioridad: "apoyo",
      foco: "comp-menor",
      resumen: "Arma bien parte–todo. Cuando el problema dice «menos que», dibuja más larga la barra de quien tiene menos: el error está en comprender la comparación, no en calcular.",
      errores: { estructura: 5, calculo: 1 },
      dominio: {
        "sumres": "domina", "pt-parte": "domina", "pt-total": "domina", "comp-dif": "practica", "comp-menor": "atascado",
        "muldiv": "domina", "uni-iguales": "pendiente", "uni-doble": "pendiente"
      },
      historial: [
        { fecha: "Hoy", problema: "Pedro tiene menos canicas", ayuda: "guiado", estructura: "Barra invertida", calculo: null },
        { fecha: "Hoy", problema: "Pedro tiene menos canicas", ayuda: "independiente", estructura: "Barra invertida", calculo: null },
        { fecha: "Ayer", problema: "Las canicas de Luis y Pedro", ayuda: "guiado", estructura: "ok", calculo: "ok" },
        { fecha: "Ayer", problema: "Las canicas de Luis y Pedro", ayuda: "independiente", estructura: "«?» mal ubicado", calculo: null },
        { fecha: "Lun.", problema: "Las figuritas que regaló Ana", ayuda: "independiente", estructura: "ok", calculo: "ok" }
      ],
      reflexiones: [
        { fecha: "Hoy", texto: "Pensé que «menos» era quitarle a la barra de arriba." },
        { fecha: "Ayer", texto: "No sabía en cuál barra iba la pregunta." }
      ],
      sugerencia: "Leer en voz alta solo la frase de comparación y preguntar quién tiene más, antes de mirar los números. Ya domina parte–todo: úsala como apoyo con su propio dibujo."
    },
    {
      id: "mateo",
      nombre: "Mateo Castillo",
      ultima: "ayer, 15:10",
      problemas_semana: 9,
      prioridad: "apoyo",
      foco: "uni-doble",
      resumen: "Identifica bien quién tiene más, pero divide el total entre 2 cuando son 3 unidades: cuenta personas, no partes iguales.",
      origen: "muldiv",
      errores: { estructura: 3, calculo: 4 },
      dominio: {
        "sumres": "domina", "pt-parte": "domina", "pt-total": "domina", "comp-dif": "domina", "comp-menor": "practica",
        "muldiv": "practica", "uni-iguales": "practica", "uni-doble": "atascado"
      },
      historial: [
        { fecha: "Ayer", problema: "El dinero de Marta y Juan", ayuda: "guiado", estructura: "ok", calculo: "60 ÷ 2 en vez de 60 ÷ 3" },
        { fecha: "Ayer", problema: "El dinero de Marta y Juan", ayuda: "independiente", estructura: "Razón incorrecta", calculo: null },
        { fecha: "Mar.", problema: "El dinero de Marta y Juan", ayuda: "resuelto", estructura: "ok", calculo: "ok" },
        { fecha: "Lun.", problema: "Pedro tiene menos canicas", ayuda: "independiente", estructura: "ok", calculo: "ok" }
      ],
      reflexiones: [
        { fecha: "Ayer", texto: "Eran dos personas, entonces lo partí en dos." }
      ],
      sugerencia: "Antes de seguir con unidades, volver a repartir objetos en montones iguales (4.°). Pedirle que cuente los rectángulos del dibujo, no las personas."
    },
    {
      id: "camila",
      nombre: "Camila Herrera",
      ultima: "hoy, 09:05",
      problemas_semana: 7,
      prioridad: "apoyo",
      foco: "pt-total",
      resumen: "Coloca el total como si fuera una parte de la barra. Resta bien cuando el dibujo está armado: el atasco está en qué abarca la llave.",
      errores: { estructura: 4, calculo: 0 },
      dominio: {
        "sumres": "domina", "pt-parte": "practica", "pt-total": "atascado", "comp-dif": "pendiente", "comp-menor": "pendiente",
        "muldiv": "domina", "uni-iguales": "pendiente", "uni-doble": "pendiente"
      },
      historial: [
        { fecha: "Hoy", problema: "Las figuritas de Ana", ayuda: "guiado", estructura: "ok", calculo: "ok" },
        { fecha: "Hoy", problema: "Las figuritas de Ana", ayuda: "independiente", estructura: "Total como parte", calculo: null },
        { fecha: "Mié.", problema: "Las figuritas que regaló Ana", ayuda: "independiente", estructura: "Total como parte", calculo: null }
      ],
      reflexiones: [
        { fecha: "Hoy", texto: "Puse el 45 al lado del 18 porque los dos son figuritas." }
      ],
      sugerencia: "Mostrar la llave como «todo lo que hay» con un objeto físico que la rodee. Con la versión guiada ya acierta: falta retirar la ayuda poco a poco."
    },
    {
      id: "diego",
      nombre: "Diego Pinzón",
      ultima: "hoy, 11:20",
      problemas_semana: 14,
      prioridad: "practica",
      foco: "sumres",
      resumen: "Sus modelos de barras están bien armados en los tres tipos. Los errores son de cálculo: restas con llevada. Comprende el problema; falla la cuenta.",
      origen: "sumres",
      errores: { estructura: 0, calculo: 5 },
      dominio: {
        "sumres": "practica", "pt-parte": "domina", "pt-total": "domina", "comp-dif": "domina", "comp-menor": "domina",
        "muldiv": "domina", "uni-iguales": "domina", "uni-doble": "practica"
      },
      historial: [
        { fecha: "Hoy", problema: "Las figuritas de Ana", ayuda: "independiente", estructura: "ok", calculo: "45 − 18 = 33" },
        { fecha: "Hoy", problema: "Pedro tiene menos canicas", ayuda: "independiente", estructura: "ok", calculo: "32 − 14 = 22" },
        { fecha: "Ayer", problema: "El dinero de Marta y Juan", ayuda: "independiente", estructura: "ok", calculo: "ok" }
      ],
      reflexiones: [
        { fecha: "Hoy", texto: "Me olvidé de prestar en la resta." }
      ],
      sugerencia: "No necesita más modelo de barras: necesita práctica breve de resta con llevada (3.°). Puede explicar su dibujo a un compañero atascado en comparación."
    },
    {
      id: "sofia",
      nombre: "Sofía Batista",
      ultima: "hoy, 08:40",
      problemas_semana: 11,
      prioridad: "avanza",
      foco: null,
      resumen: "Resuelve los tres tipos de forma independiente, sin versión guiada. Lista para problemas de unidades con fracciones.",
      errores: { estructura: 1, calculo: 0 },
      dominio: {
        "sumres": "domina", "pt-parte": "domina", "pt-total": "domina", "comp-dif": "domina", "comp-menor": "domina",
        "muldiv": "domina", "uni-iguales": "domina", "uni-doble": "domina"
      },
      historial: [
        { fecha: "Hoy", problema: "El dinero de Marta y Juan", ayuda: "independiente", estructura: "ok", calculo: "ok" },
        { fecha: "Ayer", problema: "Pedro tiene menos canicas", ayuda: "independiente", estructura: "ok", calculo: "ok" },
        { fecha: "Lun.", problema: "Las canicas de Luis y Pedro", ayuda: "independiente", estructura: "Barra invertida", calculo: null }
      ],
      reflexiones: [],
      sugerencia: "Pedirle que invente un problema de comparación para el grupo y que lo modele en la pizarra."
    }
  ]
};
