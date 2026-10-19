// Cursadas del CESACO (Salud Comunitaria).
const CESACO = [
  {
    dia: 'Lunes',
    turno: 'Mañana',
    n: 19,
    texto:
      '*LUNES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMacedonio 11 - Comunicación\nMacedonio 11 - Estadística\nMacedonio 11 - Sistematización\nManso 8 - Seminario 2\n\n*Enfermería:*\nCarrica 1 - Adulto 2 (C)\nKirchner 9 - Materno 2 (A)\nMarechal 1 - Microbiología (A)\nMarechal 2 - Materno 1 (B)\nMarechal 3 - Salud mental (C)\nMarechal 4 - Salud comunitaria (B)\nMarechal 6 - Gestión (A)\n\n*Nutrición:*\nHernández 20 - Salud mental (D, Barcala)\nHernández 21 - FyQ Culinaria (A, Colombo)\nManso 2 - Anatomía (A, Ghirardi)\nManso 3 - Salud mental (B, Yanco)\nMarechal 7 - Bromatología 1 (B)\nMarechal 7 - TFI\nMarechal 9 - Desarrollo comunitario\nMarechal 10 - Gestión orgs salud',
  },
  {
    dia: 'Lunes',
    turno: 'Tarde',
    n: 8,
    texto:
      '*LUNES - TURNO TARDE*\n\n*Trabajo Social:*\nMacedonio 2 - Intro Cs. Sociales\n\n*Enfermería:*\nMacedonio 5 - Materno 2 (D)\nUgarte 1 - Materno 1 (D)\nUgarte 2 - Microbiología (E)\nUgarte 3 - Microbiología (F)\nUgarte 4 - Salud comunitaria (E)\nUgarte 7 - Gestión (B)\nSin aula - TFI',
  },
  {
    dia: 'Lunes',
    turno: 'Noche',
    n: 8,
    texto:
      '*LUNES - TURNO NOCHE*\n\n*Trabajo Social:*\nManso 1 - TS 2\nRemedios 1 - Seminario 4\nRemedios 4 - Seminario 3 (Padrón)\n\n*Nutrición:*\nHernández 1 - Fisiopato adulto\nHernández 1 - Núcleo\nMarechal 1 - Biofísica (C)\nMarechal 2 - Biofísica (E)\nMarechal 3 - FyQ Culinaria (C)',
  },
  {
    dia: 'Martes',
    turno: 'Mañana',
    n: 18,
    texto:
      '*MARTES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMacedonio 2 - Metodología 1\nMacedonio 3 - Epidemiología\nManso 8 - Legislación 2\n\n*Enfermería:*\nCarrica 3 - Adulto 2 (B)\nMarechal 1 - Salud mental (A)\nMarechal 2 - Materno 1 (B)\nMarechal 2 - Salud mental (B)\nMarechal 3 - Nutrición (C)\nMarechal 4 - Salud comunitaria (A)\nMarechal 5 - Salud comunitaria (C)\nMarechal 6 - Gestión (A)\n\n*Nutrición:*\nHernández 21 - Bromatología 1 (A)\nMarechal 7 - Educación alimentaria (B)\nMarechal 9 - Economía regional\nUgarte 8 - GASA\n\n*Trabajo Social / Nutrición:*\nHernández 20 - Sem. Sit. Prob. y… (Chianetta)\nManso 2 - Sem. Sit. Prob. y… (Davila)\nManso 3 - Sem. Sit. Prob. y… (Vilas)',
  },
  {
    dia: 'Martes',
    turno: 'Tarde',
    n: 7,
    texto:
      '*MARTES - TURNO TARDE*\n\n*Trabajo Social:*\nMacedonio 5 - TS 1\n\n*Enfermería:*\nUgarte 1 - Nutrición (D)\nUgarte 2 - Salud mental (E)\nUgarte 3 - Materno 1 (F)\nUgarte 4 - Salud comunitaria (D)\nUgarte 8 - Adulto 2 (E)\nUgarte 8 - Gestión (B)',
  },
  {
    dia: 'Martes',
    turno: 'Noche',
    n: 17,
    texto:
      '*MARTES - TURNO NOCHE*\n\n*Trabajo Social:*\nMacedonio 1 - Estadística\nMacedonio 2 - TS 1\nManso 3 - Metodología 1\nRemedios 1 - Comunicación\nRemedios 1 - Sistematización\nRemedios 4 - Epidemiología\n\n*Nutrición:*\nHernández 1 - Nutrición comunitaria\nMarechal 1 - Anatomía (C)\nMarechal 2 - Anatomía (E)\nMarechal 3 - Anatomía (F)\nMarechal 4 - Educación alimentaria (C)\nMarechal 4 - FyQ Culinaria (F)\nMarechal 7 - Desarrollo comunitario\nUgarte 9 - Gestión orgs salud\n\n*Ciclo Ed. Física:*\nCarrica - Todas\nCarrica - Todas\nCarrica - Todas',
  },
  {
    dia: 'Miércoles',
    turno: 'Mañana',
    n: 20,
    texto:
      '*MIÉRCOLES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMarechal 9 - Seminario 3\nUgarte 8 - TS 1\nUgarte 9 - TS 2\n\n*Enfermería:*\nCarrica 2 - Adulto 2 (A)\nCarrica 3 - Materno 2 (B)\nMarechal 1 - Materno 1 (A)\nMarechal 2 - Nutrición (B)\nMarechal 3 - Materno 1 (C)\nMarechal 3 - Salud colectiva (C)\nMarechal 5 - Salud comunitaria (C)\nMarechal 6 - Gestión (A)\nSin aula - Taller integrador (A)\n\n*Nutrición:*\nHernández 20 - Anatomía (D, Ghirardi)\nHernández 21 - Ética / Microbiología (A)\nManso 2 - Nutrición 1 (A, Pelatelli)\nManso 3 - Biofísica (B, Amiano)\nManso 8 - Fisiopato adulto\nMarechal 7 - Nutrición 3 (B)\nMarechal 7 - TFI\nUgarte 8 - Núcleo',
  },
  {
    dia: 'Miércoles',
    turno: 'Tarde',
    n: 10,
    texto:
      '*MIÉRCOLES - TURNO TARDE*\n\n*Trabajo Social:*\nMacedonio 4 - Estado y Política\n\n*Enfermería:*\nUgarte 1 - Microbiología (D)\nUgarte 2 - Materno 1 (E)\nUgarte 3 - Materno 1 (F)\nUgarte 3 - Nutrición (F)\nUgarte 4 - Adulto 2 (D)\nUgarte 7 - Gestión (B)\nUgarte 8 - Adulto 2 (E)\nUgarte 8 - Educación y salud (E)\nSin aula - TFI',
  },
  {
    dia: 'Miércoles',
    turno: 'Noche',
    n: 13,
    texto:
      '*MIÉRCOLES - TURNO NOCHE*\n\n*Trabajo Social:*\nMacedonio 5 - Evaluación\nMarechal 10 - TFI\nRemedios 1 - Seminario 3 (Carbone)\n\n*Nutrición:*\nHernández 1 - Epidemiología 1 (E)\nMarechal 3 - Nutrición 3 (C)\nMarechal 5 - Epidemiología 1 (C)\nMarechal 6 - FyQ Culinaria (E)\nMarechal 6 - GASA\n\n*Trabajo Social / Nutrición:*\nMarechal 1 - Sem. Sit. Prob. y… (Davila)\nMarechal 2 - Sem. Sit. Prob. y… (Pereyra)\n\n*Ciclo Ed. Física:*\nCarrica - Todas\nCarrica - Todas\nCarrica - Todas',
  },
  {
    dia: 'Jueves',
    turno: 'Mañana',
    n: 18,
    texto:
      '*JUEVES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMacedonio 2 - Estado y Política\nMacedonio 5 - Seminario 4\nMacedonio 11 - TFI\n\n*Enfermería:*\nCarrica 3 - Adulto 2 (B)\nCarrica 3 - Educación y salud (B)\nMacedonio 1 - Materno 2 (C)\nMarechal 1 - Nutrición (A)\nMarechal 2 - Microbiología (B)\nMarechal 3 - Microbiología (C)\nMarechal 4 - Salud comunitaria (A)\nMarechal 6 - Investigación (C)\n\n*Nutrición:*\nHernández 20 - Biofísica (D, Amiano)\nHernández 21 - Fisiopato niño\nManso 2 - Biofísica (A, Amiano)\nManso 3 - Anatomía (Gagliano)\nManso 8 - Epidemiología 1\nMarechal 7 - FyQ Culinaria (B, Monerais)\nMarechal 9 - Nutrición 3 (A)',
  },
  {
    dia: 'Jueves',
    turno: 'Tarde',
    n: 8,
    texto:
      '*JUEVES - TURNO TARDE*\n\n*Enfermería:*\nKirchner 6 - Materno 2 (E)\nKirchner 7 - Investigación (D)\nKirchner 8 - Investigación (B)\nUgarte 1 - Salud colectiva (D)\nUgarte 2 - Nutrición (E)\nUgarte 3 - Salud mental (F)\nUgarte 4 - Salud comunitaria (D)\n\n*Trabajo Social / Nutrición:*\nMacedonio 2 - Sem. Sit. Prob. y… (Miguel)',
  },
  {
    dia: 'Jueves',
    turno: 'Noche',
    n: 10,
    texto:
      '*JUEVES - TURNO NOCHE*\n\n*Trabajo Social:*\nHernández 19 - Teoría Social 1\nMacedonio 1 - Estado y Política\nManso 8 - Antropología\nRemedios 1 - Legislación 2\n\n*Nutrición:*\nHernández 1 - Fisiopato niño\nMarechal 1 - Nutrición 1 (C)\nMarechal 2 - Nutrición 1 (E)\nMarechal 3 - Bromatología 1 (C)\nMarechal 6 - Economía regional\nMarechal 7 - Metodología',
  },
  {
    dia: 'Viernes',
    turno: 'Mañana',
    n: 21,
    texto:
      '*VIERNES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMacedonio 10 - Evaluación\nMacedonio 11 - Antropología\nMacedonio 11 - Teoría Social 1\nMarechal 7 - Historia latinoamericana\n\n*Enfermería:*\nCarrica 1 - Adulto 2 (C)\nCarrica 1 - Educación y salud (C)\nCarrica 2 - Adulto 2 (A)\nFernández 1 - Educación y salud (A)\nFernández 2 - Investigación (A)\nMarechal 1 - Salud colectiva (A)\nMarechal 2 - Salud colectiva (B)\nMarechal 3 - Materno 1 (C)\nMarechal 4 - Salud comunitaria (B)\nSin aula - Taller integrador (A)\n\n*Nutrición:*\nHernández 20 - Nutrición 1 (D, Yedvab)\nHernández 21 - Educación alimentaria (A)\nManso 2 - Salud mental (A, Rubel)\nManso 3 - Nutrición 1 (B, Lenze)\nManso 8 - Técnica dieto 2\nMarechal 9 - Ética / Microbiología (B)\nUgarte 8 - Núcleo',
  },
  {
    dia: 'Viernes',
    turno: 'Tarde',
    n: 8,
    texto:
      '*VIERNES - TURNO TARDE*\n\n*Enfermería:*\nUgarte 1 - Materno 1 (D)\nUgarte 1 - Salud mental (D)\nUgarte 2 - Materno 1 (E)\nUgarte 2 - Salud colectiva (E)\nUgarte 3 - Salud colectiva (F)\nUgarte 4 - Adulto 2 (D)\nUgarte 4 - Educación y salud (D)\nUgarte 4 - Salud comunitaria (E)',
  },
  {
    dia: 'Viernes',
    turno: 'Noche',
    n: 9,
    texto:
      '*VIERNES - TURNO NOCHE*\n\n*Trabajo Social:*\nMacedonio 1 - Promoción\nMacedonio 2 - Historia latinoamericana\nMacedonio 5 - Abordajes\nManso 8 - Seminario 2\n\n*Nutrición:*\nHernández 1 - Núcleo\nHernández 1 - Técnica dieto 2\nMarechal 1 - Salud mental (C)\nMarechal 2 - Salud mental (E)\nMarechal 3 - Ética / Microbiología (C)',
  },
  {
    dia: 'Sábado',
    turno: 'Mañana',
    n: 2,
    texto: '*SÁBADO - TURNO MAÑANA*\n\n*Trabajo Social:*\nManso 1 - Abordajes\nManso 8 - Promoción',
  },
  {
    dia: 'Sábado',
    turno: 'Día completo',
    n: 3,
    texto:
      '*SÁBADO - DÍA COMPLETO*\n\n*Ciclo Trabajo Social:*\nSin aula - 3 materias (8 a 14 hs)\nSin aula - 3 materias (8 a 17 hs)\nSin aula - 3 materias (8 a 17 hs)',
  },
  {
    dia: 'Solo prácticas',
    turno: 'Mañana',
    n: 1,
    texto: '*SOLO PRÁCTICAS - TURNO MAÑANA*\n\n*Enfermería:*\nSolo prácticas - Cuidado crítico (A)',
  },
  {
    dia: 'Solo prácticas',
    turno: 'Tarde',
    n: 1,
    texto: '*SOLO PRÁCTICAS - TURNO TARDE*\n\n*Enfermería:*\nSolo prácticas - Cuidado crítico (B)',
  },
];
// Cursadas del CEDEPYT (Desarrollo Productivo y Tecnológico), generadas con
// tools/elecciones/desde-xlsx.py a partir de la planilla del Departamento.
const CEDEPYT = [
  {
    dia: 'Lunes',
    turno: 'Mañana',
    n: 18,
    texto:
      '*LUNES - TURNO MAÑANA*\n\n*Turismo:*\nHernández 19 - Procesos históricos mundiales (1° A-I, Capanegra)\nHernández 19 - Procesos históricos mundiales (1° Q-Z, Stratta)\nManzi 2 - Servicios Turísticos II (2° A-I, Di Marino)\nManzi 2 - Taller Formul. y Eval. de Proyectos (3° A-L, Román)\nUgarte 1 - Espacios turísticos de América (2° J-P, Sileo)\nUgarte 1 - Indicadores turísticos (2° Q-Z, Miguenz)\nUgarte 4 - Patrimonio Histórico-Cultural Argentino (3° M-Z, Staffolani)\nUgarte 4 - Planeamiento del desarrollo Turístico (4°, Nuñez)\nUgarte 5 - Sem. Opt. Turismo y Calidad de Servicios (4°/5°, Meijide)\nUgarte 7 - Sem. Opt. Turismo Comunitario (4°/5°, Carbó)\n\n*Sistemas (cohortes 2024 en adelante):*\nJauretche Lab. 10 - Bases de Datos 1 Com.4 (3°, Ribeiro, 9-13hs)\nJauretche Labs. 8 y 9 - Programación Com.1 (1°, Golfieri, 8-14hs)\n\n*Sistemas (cohortes 2023 y anteriores):*\nJauretche Lab. 10 - Bases de Datos 1 8618-1 (3°, Ribeiro, 9-13hs)\nUgarte 8 - Introd. a los Sistemas Operativos 8612-1 (2°, Azcurra/Tomczak, 8-14hs)\n\n*Ciencia y Tecnología de los Alimentos:*\nKirchner 4 - Anatomía y Fisiología (1°, 2026, Ugarte, Prom. Directa)\n\n*Logística y Transporte:*\nKirchner 5 - Distribución 1 (Galanetto)\nKirchner 7 - Seguridad y gestión del ambiente (Olivarez)\nKirchner 7 - Seminario de actualización de problemas logísticos (Barrios/Ramirez)',
  },
  {
    dia: 'Lunes',
    turno: 'Tarde',
    n: 3,
    texto:
      '*LUNES - TURNO TARDE*\n\n*Sistemas (cohortes 2024 en adelante):*\nJauretche Labs. 8 y 9 - Programación Com.4 (1°, Golfieri, 14-18hs)\n\n*Gestión Ambiental Urbana:*\nMacedonio 10 - Formulación y Gestión de proyectos Urbano-Ambientales (Coh. 2023, Brie)\n\n*Ciencia y Tecnología de los Alimentos:*\nMarechal 5 - Práctica Pre-Profesional Bromatología (3°, 2024, Alderete)',
  },
  {
    dia: 'Lunes',
    turno: 'Noche',
    n: 37,
    texto:
      '*LUNES - TURNO NOCHE*\n\n*Economía Política:*\nHernández 6 - Hist. Económica y Social Gral. (2°, Amarilla)\nKirchner 7 - Cuentas Nac. y Estruct. Econ. Arg. (3°, Aschieri)\nKirchner 8 - Int. a la Economía Política (1°, Rodriguez)\nKirchner 8 / Virtual - Org. de la Prod. Industrial y Agropec. (4°, Seain)\nVirtual - Taller Formulac. de Proyecto de TFI (5°, González)\n\n*Tecnologías Ferroviarias:*\nMacedonio 4 - Mecánica y tecnología de materiales (2°, Coh. 2024, Pizzorno)\nUgarte 4 - Introducción a la Química (1°, Coh. 2025, Markowski)\nUgarte 5 - Gestión de la calidad, ensayos y mediciones (3°, Coh. 2023, Brizuela)\nUgarte 5 - Taller integrador PPP y TF - anual (4°, Coh. 2022 — Electromec., Chaparro, 50% presencial)\nUgarte 5 - Taller integrador PPP y TF - anual (4°, Coh. 2023 — Infraestruct., Chaparro, 50% presencial)\n\n*Turismo:*\nHernández 6 - Espacios turíst. África/Asia/Oceanía (1° A-L, Massafra)\nHernández 6 - Organización y gestión de la empresa turística (1° M-Z, Aceval)\nKirchner 8 - Patrimonio Histórico-Cultural Argentino (3°, Staffolani)\nKirchner 9 - Sem. Opt. Criptomonedas y comercio electrónico (4°/5°, Fernández)\nKirchner 9 - Sem. Opt. Turismo y Calidad de Servicios (4°/5°, Meijide)\nManzi 2 - Historia del turismo (2°, Capanegra)\nManzi 2 - Sem. Opt. Turismo y medioambiente (4°/5°, Miguenz)\n\n*Sistemas (cohortes 2024 en adelante):*\nJauretche Labs. 8 y 9 - Programación Com.6 (1°, Golfieri/Tomczak)\nJauretche Labs. 8 y 9 - Sem. de Lenguajes - Python (2°, Vranic/Cerbelli)\nMarechal 6 - Análisis Matemático 1 Com.4 (3°, Rojas)\nUgarte 7 - Matemática Discreta Com.4 (2°, Robles/Martínez)\n\n*Sistemas (cohortes 2023 y anteriores):*\nJauretche 12 - Ingeniería de Software 2 (3°, Lescano)\nJauretche Lab. 10 - Optativa: Tecnologías Cloud (4°, San Román)\nMarechal 6 - Desarrollo de Software en Sist. Distribuidos 8627-2 (4°, Amaro/Aguirre)\nVirtual - Introducción al Pensamiento Científico (1°, Arscone)\n\n*Gestión Ambiental Urbana:*\nKirchner 5 - Formulación y Gestión de proyectos Urbano-Ambientales (Coh. 2023, Brie)\nKirchner 5 - Taller de Investigación Urbana (Coh. 2025, Quiroga)\nKirchner 7 - Ciudad y Territorio (Coh. 2026, Corizzo)\n\n*Ciencia y Tecnología de los Alimentos:*\nJauretche 12 - Anatomía y Fisiología (1°, 2026, Ugarte, Prom. Directa)\nJauretche 12 - Industria alimenticia y medio ambiente (4°, 2023, Montesano, Examen Final)\nScalabrini 1 - Estadística y Bioestadística (2°, 2025, Alderete, Examen Final)\nPlanta Piloto Cárnicos - Historia, legislación y ética profesional (3°, 2024, García)\n\n*Logística y Transporte:*\nHernández 21 - Geografía económica argentina y regional (Herera Bravo/Schiavone)\nUgarte 1 - Seguridad y gestión del ambiente (Olivarez)\nUgarte 8 - Estrategias de desarrollo (Bugallo)\nUgarte 8 - Seminario de actualización de problemas logísticos (Ramirez/Barrios)\nUgarte 9 - Costos y presupuestos (Dos Santos)',
  },
  {
    dia: 'Martes',
    turno: 'Mañana',
    n: 13,
    texto:
      '*MARTES - TURNO MAÑANA*\n\n*Turismo:*\nHernández 19 - Espacios turíst. África/Asia/Oceanía (1° J-P, Sileo)\nHernández 19 - Introducción a la matemática (1° A-I, López)\nKirchner 3 - Servicios Turísticos II (2° J-P, Di Marino)\nManzi 2 - Taller Formul. y Eval. de Proyectos (3° M-Z, Román)\nUgarte 4 - Historia del turismo (2° A-I, Capanegra)\nUgarte 5 - Espacios turísticos de América (2° Q-Z, Egea)\nUgarte 5 - Turismo Social y Derecho al Turismo (4°, Parada)\n\n*Sistemas (cohortes 2024 en adelante):*\nJauretche Labs. 8 y 9 - Programación Com.2 (1°, Golfieri, 8-14hs)\nUgarte 1 - Arquitectura de Computadoras Com.1 (1°, García, 8-14hs)\nUgarte 7 - Matemática Discreta Com.1 (2°, Plaul, 8-14hs)\n\n*Ciencia y Tecnología de los Alimentos:*\nJauretche 12 - Química Inorgánica (1°, 2026, Caruso, Prom. Directa)\nKirchner 4 - Bromatología I (1°, 2025, Fava, Examen Final)\n\n*Logística y Transporte:*\nJauretche 13 - Matemática II / Matemática I (Siemens)',
  },
  {
    dia: 'Martes',
    turno: 'Tarde',
    n: 5,
    texto:
      '*MARTES - TURNO TARDE*\n\n*Sistemas (cohortes 2024 en adelante):*\nJauretche Labs. 8 y 9 - Programación Com.5 (1°, Pérez, 14-18hs)\nMarechal 3 - Matemática Discreta Com.3 (2°, Millán/Masci, 14-18hs)\n\n*Gestión Ambiental Urbana:*\nMacedonio 10 - Procesos Urbanos III (Coh. 2023, Cordara)\n\n*Ciencia y Tecnología de los Alimentos:*\nMarechal 1 - Física I (1°, 2026, contracurs., Isola, Prom. Directa)\nMarechal 2 - Biología (1°, 2026, contracurs., Ugarte/Scollo, Examen Final)',
  },
  {
    dia: 'Martes',
    turno: 'Noche',
    n: 40,
    texto:
      '*MARTES - TURNO NOCHE*\n\n*Economía Política:*\nMacedonio 4 - Economía Neoclásica (2°, Bergstein)\nMacedonio 4 - Tópicos Avanz. de Eco. Clásica (3°, Barón)\nMacedonio 7 - Sociología (1°, Waiman)\nVirtual - Org. de la Prod. Industrial y Agropec. (4°, Seain)\nVirtual - SEM: Prob. Actuales de la Eco. Política (5°, Cernadas)\nVirtual - Teoría y Política Monetaria (4°, Martinez)\n\n*Tecnologías Ferroviarias:*\nJauretche Lab. Física - Física I (1°, Coh. 2025, Antoniuk)\nJauretche Lumca 13 - Matemática I (1°, Coh. 2025, Tornay)\nMacedonio 8 - Legislación Ferroviaria (2°, Coh. 2024, Novoa)\nMacedonio 8 - Práctica Supervisada (3°, Coh. 2023, Chaparro)\nMacedonio 9 - Estructura Ferroviaria (4°, Coh. 2023 — Infraestruct., Tombesi, 50% presencial)\nMacedonio 9 - Material Rodante (4°, Coh. 2022 — Electromec., Petroni, 50% presencial)\n\n*Turismo:*\nKirchner 7 - Taller Formul. y Eval. de Proyectos (3°, Román)\nKirchner 8 - Servicios Turísticos II (2°, Aceval)\nManzi 2 - Turismo Social y Derecho al Turismo (4°, Parada)\n\n*Sistemas (cohortes 2024 en adelante):*\nHernández 6 - Organización de Computadoras (1°, García/Wolf)\nHernández 19 - Introd. a los Sistemas Operativos Com.4 (2°, Amaro/Cusato)\nHernández 20 - Arquitectura de Computadoras Com.5 (1°, Bianco/Borea)\nJauretche Lab. 10 - Sem. de Lenguajes - Low Code (2°, San Román)\nJauretche Labs. 8 y 9 - Algoritmos y Estructuras de Datos (2°, Vescio)\nJauretche Labs. 8 y 9 - Bases de Datos 1 Com.3 (3°, Ribeiro/Silvestre)\n\n*Sistemas (cohortes 2023 y anteriores):*\nHernández 6 - Fundamentos de Teoría de la Computación (4°, Pérez/Cañete)\nHernández 19 - Introd. a los Sistemas Operativos 8612-5 (2°, Amaro/Cusato)\nJauretche Lab. 10 - Sem. de Lenguajes - Low Code (2°, San Román)\nJauretche Lab. 10 - Seminario de Trabajo Final (5°, Loidi/Parodi/Siciliano)\nJauretche Labs. 8 y 9 - Algoritmos y Estructuras de Datos (2°, Vescio)\nJauretche Labs. 8 y 9 - Bases de Datos 1 8618-5 (3°, Ribeiro/Silvestre)\nJauretche Labs. 8 y 9 - Proyecto de Software (3°, Santos/Santos/Martínez)\n\n*Gestión Ambiental Urbana:*\nMacedonio 6 - Procesos Urbanos III (Coh. 2023, Cordara)\nMacedonio 7 - Taller de Práctica Pre-Profesional (Coh. 2024, Brie)\nMacedonio 11 - Matemática y Estadística aplic. a estud. ambientales (Coh. 2026, Millan)\n\n*Ciencia y Tecnología de los Alimentos:*\nKirchner 9 - Química Inorgánica (1°, 2026, Caruso, Prom. Directa)\nMacedonio 10 - Integración de la industria alimentaria (4°, 2023, García, Prom. Directa)\nMacedonio 10 (50% impar) - Bromatología I (2°, 2025, Fava, Examen Final)\nPlanta Piloto Cárnicos - Industria y tecnología de los Alimentos III (3°, 2024, Landriel)\n\n*Logística y Transporte:*\nHernández 20 - Nuevas tecnologías (Jorge Golfieri)\nScalabrini 2 - Problemática del transporte de pasajeros (Lobosco)\nUgarte 2/3 - Matemática II / Matemática I (Dos Santos/Roscardi)\nUgarte 4 - Distribución I (Ramirez)\nVirtual - Comercio exterior (Andres Traverso)',
  },
  {
    dia: 'Miércoles',
    turno: 'Mañana',
    n: 19,
    texto:
      '*MIÉRCOLES - TURNO MAÑANA*\n\n*Turismo:*\nHernández 19 - Espacios turíst. África/Asia/Oceanía (1° A-I, Sileo)\nHernández 19 - Introducción a la matemática (1° J-P, López)\nMacedonio 2 - Indicadores turísticos (2° A-I, La Rosa)\nManzi 2 - Emprendedurismo (4°, Carbó)\nManzi 2 - Historia del turismo (2° J-P, Capanegra)\nUgarte 1 - Marco Normativo de la Act. Turística (3° A-L, Villán)\nUgarte 1 - Organización y gestión de la empresa turística (1° Q-Z, Di Marino)\nUgarte 4 - Marketing turístico (2° Q-Z, Peré)\n\n*Sistemas (cohortes 2024 en adelante):*\nUgarte 2 - Arquitectura de Computadoras Com.2 (1°, García, 8-14hs)\nUgarte 3 - Matemática Discreta Com.2 (2°, Plaul/Masci, 8-14hs)\nUgarte 4 - Análisis Matemático 1 Com.1 (3°, Millán, 9-13hs)\nUgarte 5 - Taller de Inglés I Com.1 (1°, Didari, 8-12hs)\n\n*Sistemas (cohortes 2023 y anteriores):*\nJauretche Labs. 8 y 9 - Orientación a Objetos 2 8616-1 (3°, Vranic/Ruina, 9-13hs)\nUgarte 7 - Desarrollo de Software en Sist. Distribuidos 8627-1 (4°, Azcurra/Tomczak, 8-14hs)\n\n*Ciencia y Tecnología de los Alimentos:*\nJauretche 12 - Física II (1°, 2026, Isola, Prom. Directa)\nPlanta Piloto Cárnicos - Microbiología de Alimentos I (2°, 2025, Landriel, Examen Final)\n\n*Logística y Transporte:*\nKirchner 4 - Logística III (Galanetto)\nKirchner 5 - Transporte II (Bacchiddu)\nVirtual - Geografía económica argentina y regional (Herrera Bravo)',
  },
  {
    dia: 'Miércoles',
    turno: 'Tarde',
    n: 5,
    texto:
      '*MIÉRCOLES - TURNO TARDE*\n\n*Sistemas (cohortes 2024 en adelante):*\nMacedonio 11 - Taller de Inglés I Com.2 (1°, Didari, 14-18hs)\nMarechal 6 - Arquitectura de Computadoras Com.4 (1°, Saldivar/Tomczak, 14-18hs)\n\n*Gestión Ambiental Urbana:*\nPresencial (LUIG) - Taller de Trabajo Final Integrador (Coh. 2022, Brie/Medrano)\n\n*Ciencia y Tecnología de los Alimentos:*\nMarechal 1 - Química General (1°, 2026, contracurs., Beaufort, Examen Final)\nMarechal 5 - Fisicoquímica y Biofísica (2°, 2025, Antoniuk y Vidal, Examen Final)',
  },
  {
    dia: 'Miércoles',
    turno: 'Noche',
    n: 39,
    texto:
      '*MIÉRCOLES - TURNO NOCHE*\n\n*Economía Política:*\nDorrego 4 - Int. a la Matemática (1°, Diatlenko)\nSin aula - Estadística I (2°, Millon)\nSin aula - Teorías Recientes de Eco. Política (3°, Levinton)\nVirtual - Finanzas Públicas (4°, Portela)\n\n*Tecnologías Ferroviarias:*\nJauretche Lab. Física - Física II (2°, Coh. 2024, Antoniuk)\nJauretche Lumca 13 - Electrónica y electromecánica (2°, Coh. 2024, Roth)\nUgarte 5 - Sem. Opt.: Materiales ferroviarios (3°, Coh. 2023, Pizzorno)\nUgarte 7 - Tecnología Ferroviaria I (1°, Coh. 2025, Waddell)\nVirtual - Instal., operac. y mant. en líneas electrif. (4°, Coh. 2022 — Electromec., Fernández)\n\n*Turismo:*\nHernández 6 - Introducción a la matemática (1° M-Z, Petroni)\nHernández 6 - Procesos históricos mundiales (1° A-L, Scivoli)\nHernández 21 - Marco Normativo de la Act. Turística (3°, Castillo)\nManzi 2 - Emprendedurismo (4°, Carbó)\nManzi 2 - Gobernabilidad del Turismo (5°, Suarez)\nManzi 2 - Indicadores turísticos (2°, Gerakios)\n\n*Sistemas (cohortes 2024 en adelante):*\nJauretche Lab. 10 - Sem. de Lenguajes - PHP (2°, Leoni/Silvestre)\nJauretche Labs. 8 y 9 - Expresión de Problemas y Algoritmos Com.2 (1°, Siciliano/Bustos/Borsani)\nJauretche Labs. 8 y 9 - Programación Com.7 (1°, Rios/Cusato)\nMarechal 7 - Elementos de Matemática Com.1 (1°, Rojas)\nUgarte 2 - Análisis Matemático 1 Com.2 (3°, Robles/Martínez)\nUgarte 9 - Redes y Comunicaciones (3°, Fernández/Aguirre)\n\n*Sistemas (cohortes 2023 y anteriores):*\nJauretche Lab. 10 - Optativa: Desarrollo Seguro de Software (4°, Oettel)\nScalabrini Lab. 1 - Probabilidad y Estadística (2°, Di Dio)\nUgarte 1 - Matemática 2 (1°, Millán)\nUgarte 2 - Sistemas y Organizaciones 8617-2 (3°, Lescano/Wolf)\nUgarte 9 - Nuevos Escenarios (5°, Arscone/Molina)\n\n*Gestión Ambiental Urbana:*\nMacedonio 10 - Procesos Urbanos I (Coh. 2025, Corizzo)\nManso 3 - Gestión Administrativa Municipal Ambiental (Coh. 2024, Ragonese)\nManso 3 - Principios de Administración y Gestión (Coh. 2026, Carabajal)\nPresencial (LUIG) - Taller de Trabajo Final Integrador (Coh. 2022, Brie/Medrano)\nVirtual - Formas de articul. socio-productivas en agroecología (Sem. Opt., Parodi)\n\n*Ciencia y Tecnología de los Alimentos:*\nJauretche 12 - Física II (1°, 2026, Isola, Prom. Directa)\nKirchner 9 - Economía y gestión empresaria (4°, Menendez/Pardo, Prom. Directa)\nMacedonio 11 - Equipos e instalaciones II (3°, 2024, Braga)\nLab. Oscar Varsavsky - Industria y tecnología de los Alimentos V (4°, Scollo, Examen Final)\nPlanta Piloto Cárnicos - Microbiología de Alimentos I (2°, 2025, Landriel, Examen Final)\n\n*Logística y Transporte:*\nScalabrini 1 - Regulación del transporte terrestre y la aeronavegación (Coutado)\nScalabrini 2 - Transporte II (Ramirez)\nVirtual - Logística III (Dajud)',
  },
  {
    dia: 'Jueves',
    turno: 'Mañana',
    n: 21,
    texto:
      '*JUEVES - TURNO MAÑANA*\n\n*Turismo:*\nHernández 19 - Organización y Gestión de la empresa turística (1° A-I, Di Marino)\nHernández 19 - Procesos históricos mundiales (1° J-P, Stratta)\nMacedonio 2 - Marketing turístico (2° J-P, Saldivia Larrosa)\nManzi 2 - Práctica Pre Profesional (3° A-L, Aceval)\nManzi 2 - Práctica Pre Profesional (3° M-Z, Aceval)\nManzi 2 - Servicios Turísticos II (2° Q-Z, Donato)\nManzi 2 - Taller de TFI (5°, Mata Botana)\nUgarte 1 - Espacios turíst. África/Asia/Oceanía (1° Q-Z, Egea)\nUgarte 4 - Espacios turísticos de América (2° A-I, Sileo)\n\n*Sistemas (cohortes 2024 en adelante):*\nJauretche Lab. 10 - Prácticas Pre-Profesionales 1 Com.1 (3°, Siciliano, 9-13hs)\nJauretche Labs. 8 y 9 - Programación Com.3 (1°, Saldivar, 8-14hs)\nUgarte 7 - Introd. a los Sistemas Operativos Com.2 (2°, Pytel/Zalazar, 8-14hs)\n\n*Sistemas (cohortes 2023 y anteriores):*\nJauretche Lab. 10 - Optativa: Aprendizaje de Máquina y Minería de Datos (5°, Pérez, 9-13hs)\nUgarte 7 - Sistemas y Organizaciones 8617-1 (3°, Charczuk/Defelippe, 8-14hs)\n\n*Ciencia y Tecnología de los Alimentos:*\nJauretche 13 - Matemática II (1°, 2026, Tornay, Examen Final)\nKirchner 3 - Química Biológica (2°, 2025, Maraulo, Examen Final)\n\n*Logística y Transporte:*\nJauretche 1 - Estadística aplicada a la logística (Coutado)\nKirchner 5 - Logística y articulación territorial (Sanoner)\nKirchner 6 - Negociación y toma de decisiones (Ehrenbock)\nKirchner 7 - Taller de trabajo final integrador (Cousirat/Siemens)\nSin aula - Matemática I (Millán, 14hs)',
  },
  {
    dia: 'Jueves',
    turno: 'Tarde',
    n: 5,
    texto:
      '*JUEVES - TURNO TARDE*\n\n*Sistemas (cohortes 2024 en adelante):*\nMarechal 5 - Introd. a los Sistemas Operativos Com.3 (2°, Pérez/Cañete, 14-18hs)\nMarechal 6 - Taller de Inglés I Com.3 (1°, Dominguez, 14-18hs)\n\n*Sistemas (cohortes 2023 y anteriores):*\nMarechal 2 - Arquitectura de Computadoras 8602-3 (1°, García, 14-18hs)\n\n*Gestión Ambiental Urbana:*\nMacedonio 10 - Redes II: Servicios y Saneamiento urbano (Coh. 2023, Ragonese)\n\n*Ciencia y Tecnología de los Alimentos:*\nMarechal 3 - Matemática I (1°, 2026, contracurs., Millán, Examen Final)',
  },
  {
    dia: 'Jueves',
    turno: 'Noche',
    n: 37,
    texto:
      '*JUEVES - TURNO NOCHE*\n\n*Economía Política:*\nKirchner 8 - Matemática para Economistas II (3°, Talice)\nMacedonio 8 - Taller de Prod. de Textos (1°, Szerdi)\nMacedonio 10 / Virtual - Teoría y Política Monetaria (4°, Martinez)\nVirtual - Economía Internacional (5°, Ortiz)\n\n*Tecnologías Ferroviarias:*\nJauretche Lumca 13 - Instal., operac. y mant. en líneas electrif. (4°, Coh. 2022 — Electromec., Fernández)\nJauretche Lumca 13 - Matemática I (1°, Coh. 2025, Tornay)\nJauretche Lumca 13 - Matemática I (1°, Contracurs., Millán, 14-18hs)\nMacedonio 9 - Tecnología Ferroviaria III (2°, Coh. 2024, Bonnefón)\nMacedonio 11 - Matemática II (1°, Coh. 2025, Millán)\nUgarte 8 - Infraestructura Ferroviaria III (4°, Coh. 2023 — Infraestruct., Tombesi, 50% presencial)\nUgarte 8 - Tecnología Ferroviaria VI (3°, Coh. 2023, Chaparro)\n\n*Turismo:*\nHernández 6 - Espacios turíst. África/Asia/Oceanía (1° M-Z, Egea)\nHernández 6 - Introducción a la matemática (1° A-L, Petroni)\nHernández 21 - Cooperación Internacional (4°, González)\nHernández 21 - Espacios turísticos de América (2°, Massafra)\nManzi 2 - Práctica Pre Profesional (3°, Di Marino)\nManzi 2 - Taller de TFI (5°, Mata Botana)\n\n*Sistemas (cohortes 2024 en adelante):*\nHernández 20 - Elementos de Matemática Com.2 (1°, Petroni)\nJauretche Lab. 10 - Prácticas Pre-Profesionales 1 Com.2 (3°, Siciliano/Wolf)\nUgarte 1 - Taller de Inglés 2 (2°, Dominguez)\nUgarte 9 - Arquitectura de Computadoras Com.6 (1°, Bianco/Borea)\n\n*Sistemas (cohortes 2023 y anteriores):*\nJauretche Lab. 10 - Optativa: Programación ERP con Odoo (4°, Vescio)\nJauretche Labs. 8 y 9 - Orientación a Objetos 2 8616-2 (3°, Scordamaglia/Vranic/Ruina)\nUgarte 9 - Arquitectura de Computadoras 8602-7 (1°, Bianco/Borea)\n\n*Gestión Ambiental Urbana:*\nMacedonio 2 - Fundamentos de Ecología (Coh. 2025, Ladetto)\nMacedonio 2 - Sociología Ambiental (Coh. 2026, Pereira)\nMacedonio 10 - Procesos Urbanos II (Coh. 2024, Olivarez)\nMacedonio 10 - Redes II: Servicios y Saneamiento urbano (Coh. 2023, Ragonese)\nVirtual - Seminario Optativo III (Sem. Opt., Del Prete)\n\n*Ciencia y Tecnología de los Alimentos:*\nJauretche 12 - Matemática II (1°, 2026, Peltzer, Examen Final)\nKirchner 6 - Química Biológica (2°, 2025, Maraulo, Examen Final)\nPlanta Piloto Cárnicos (50% impar) - Bromatología III (3°, 2024, Fava)\nPlanta Piloto Cárnicos (50% par) - Formulación de proyectos industriales (4°, Braga, Examen Final)\n\n*Logística y Transporte:*\nHernández 21 - Taller de trabajo final integrador (Cousirat)\nKirchner 7 - Logística y articulación territorial (Bacchiddu)\nUgarte 2 - Estadística aplicada a la logística (Ehrenbock)\nUgarte 2 - Negociación y toma de decisiones (Sanoner)',
  },
  {
    dia: 'Viernes',
    turno: 'Mañana',
    n: 14,
    texto:
      '*VIERNES - TURNO MAÑANA*\n\n*Turismo:*\nHernández 19 - Introducción a la matemática (1° Q-Z, López)\nHernández 19 - Organización y gestión de la empresa turística (1° J-P, Donato)\nManzi 2 - Gobernabilidad del Turismo (5°, Suarez)\nUgarte 1 - Indicadores turísticos (2° J-P, La Rosa)\nUgarte 1 - Marketing turístico (2° A-I, Miguenz)\nUgarte 4 - Historia del turismo (2° Q-Z, Rey)\nUgarte 4 - Marco Normativo de la Act. Turística (3° M-Z, Novoa Haidar)\nUgarte 4 - Patrimonio Histórico-Cultural Argentino (3° A-L, Staffolani)\n\n*Sistemas (cohortes 2023 y anteriores):*\nUgarte 8 - Optativa: Prueba de Software (4°, Diez, 9-13hs)\n\n*Ciencia y Tecnología de los Alimentos:*\nJauretche 1 - Industria y tecnología de los alimentos I (2°, 2025, Montesano/Antoniuk)\nJauretche 12 - Química Inorgánica (1°, 2026, Caruso, Prom. Directa)\n\n*Logística y Transporte:*\nKirchner 5 - Transporte III - Transporte multimodal (Bacchiddu)\nUgarte 5 - Comercio exterior (Andres Traverso)\nUgarte 7 - Legislación y práctica aduanera I (Grosberg)',
  },
  {
    dia: 'Viernes',
    turno: 'Tarde',
    n: 3,
    texto:
      '*VIERNES - TURNO TARDE*\n\n*Gestión Ambiental Urbana:*\nVirtual - Procesos Urbanos III (Coh. 2023, Cordara)\nVirtual - Taller de Trabajo Final Integrador (Coh. 2022, Brie/Medrano)\n\n*Ciencia y Tecnología de los Alimentos:*\nMarechal 5 - Química General (1°, 2026, contracurs., Beaufort, Examen Final)',
  },
  {
    dia: 'Viernes',
    turno: 'Noche',
    n: 31,
    texto:
      '*VIERNES - TURNO NOCHE*\n\n*Economía Política:*\nMacedonio 4 - Economía Neoclásica (2°, Bergstein)\nMarechal 4 - Matemática para Economistas III (4°, Requelme)\nMarechal 5 - Planificación Estratégica (3°, Sotelo)\nVirtual - Formulación y Evaluación de Proyectos (5°, Mattos)\n\n*Tecnologías Ferroviarias:*\nHernández 20 - El transporte ferroviario (1°, Coh. 2025, Bonnefón)\nJauretche Lumca 13 - Ferrourbanística (4°, Coh. 2023 — Infraestruct., Tombesi, 50% presencial)\nMacedonio 8 - Mecánica de los fluidos (3°, Coh. 2023, Pizzorno)\nMacedonio 11 - Seguridad laboral y ambiental (2°, Coh. 2024, Aguerre)\n\n*Turismo:*\nHernández 6 - Procesos históricos mundiales (1° M-Z, Cajal)\nManzi 2 - PPP orientada al ámbito público (5°, Guaita)\nManzi 2 - Planeamiento del desarrollo Turístico (4°, Suarez)\nUgarte 1 - Marketing turístico (2°, Staffolani)\nUgarte 1 - Organización y Gestión de la empresa turística (1° A-L, Donato)\n\n*Sistemas (cohortes 2024 en adelante):*\nJauretche Labs. 8 y 9 - Bases de Datos 1 Com.2 (3°, Vescio/Bustos/Borsani)\nJauretche Labs. 8 y 9 - Expresión de Problemas y Algoritmos Com.1 (1°, Mansilla/Ruina)\nMacedonio 11 - Análisis Matemático 1 Com.3 (3°, Millán)\n\n*Gestión Ambiental Urbana:*\nMacedonio 9 - Educación Ambiental (Coh. 2025, Corizzo)\nMarechal 6 - Redes I: Movilidad urbana (Coh. 2024, Llopis)\nUgarte 2 - Técnicas en Cartografía y Fotointerpretación (Coh. 2026, a designar)\nPresencial (LabAmb) - Ecotoxicología y Bioensayos (Sem. Opt., Ladetto)\nVirtual - Procesos Urbanos III (Coh. 2023, Cordara)\nVirtual - Taller de Trabajo Final Integrador (Coh. 2022, Brie/Medrano)\n\n*Ciencia y Tecnología de los Alimentos:*\nJauretche 12 - Química Inorgánica (1°, 2026, Caruso, Prom. Directa)\nJauretche 13 - Industria y tecnología de los alimentos I (2°, 2025, Montesano)\nKirchner 6 - Educación y Fiscalización (4°, Palópoli, Prom. Directa)\nKirchner 6 - Toxicología (3°, 2024, Markowski)\n\n*Logística y Transporte:*\nHernández 20 - El transporte Ferroviario (Bonefon)\nKirchner 9 - Control del sector público (Hector Perez)\nKirchner 9 - Servicios Públicos (Hector Perez)\nKirchner 9 - Transporte III - Transporte Multimodal (Diego Baez)\nUgarte 2 - Legislación y práctica aduanera I (Grosberg)',
  },
  {
    dia: 'Sábado',
    turno: 'Mañana',
    n: 5,
    texto:
      '*SÁBADO - TURNO MAÑANA*\n\n*Turismo:*\nKirchner 5 - Cooperación Internacional (4°, Guaita)\nKirchner 5 - PPP orientada al ámbito público (5°, Guaita)\n\n*Gestión Ambiental Urbana:*\nVirtual - Gestión Ambiental y Empresa (Coh. 2023, Visciglio, 9 a 13hs)\nVirtual - Seminario Optativo IV (Sem. Opt., De Candia, 9 a 13hs)\n\n*Ciencia y Tecnología de los Alimentos:*\nKirchner 6 - Fisicoquímica y Biofísica (2°, 2025, Antoniuk y Vidal, Examen Final)',
  },
];

function esc(s) {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
}
function wa(s) {
  return esc(s).replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
}

async function copiar(texto, btn, label) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(texto);
    ok = true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.className = 'fallback';
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    try {
      ok = document.execCommand('copy');
    } catch (e2) {}
    ta.remove();
  }
  btn.textContent = ok ? '¡Copiado!' : 'No se pudo';
  btn.classList.toggle('done', ok);
  setTimeout(() => {
    btn.textContent = label;
    btn.classList.remove('done');
  }, 1800);
}

/** Días, tarjetas por turno y botones de copiar de un centro de estudiantes. */
function montarHorarios(clave, datos) {
  const dias = [...new Set(datos.map((d) => d.dia))];
  const $days = document.getElementById('days-' + clave),
    $day = document.getElementById('day-' + clave);
  const guardado = 'elecciones.dia.' + clave;
  let current;
  try {
    current = localStorage.getItem(guardado);
  } catch (e) {}
  if (!dias.includes(current)) current = dias[0];

  function renderDays() {
    $days.innerHTML = '';
    dias.forEach((d) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = d;
      b.id = `dia-${clave}-${d}`;
      b.setAttribute('aria-pressed', d === current);
      b.onclick = () => {
        current = d;
        try {
          localStorage.setItem(guardado, d);
        } catch (e) {}
        renderDays();
        renderDay();
      };
      $days.appendChild(b);
    });
  }
  function renderDay() {
    const items = datos.filter((x) => x.dia === current);
    const total = items.reduce((a, x) => a + x.n, 0);
    $day.innerHTML = `<div class="dayhead"><h2>${esc(current)}</h2>
      <button class="dayall" type="button" id="copy-dia-${clave}">Copiar el día completo (${total})</button></div><div class="list"></div>`;
    const list = $day.querySelector('.list');
    items.forEach((x, i) => {
      const c = document.createElement('article');
      c.className = 'card';
      c.innerHTML = `<div class="cardhead"><div><h3>${x.turno === 'Día completo' ? 'Día completo' : 'Turno ' + esc(x.turno)}</h3>
        <span class="count">${x.n} cursada${x.n === 1 ? '' : 's'}</span></div>
        <button class="copy" type="button" id="copy-${clave}-${i}">Copiar</button></div>
        <div class="preview">${wa(x.texto)}</div>`;
      c.querySelector('.copy').onclick = (e) => copiar(x.texto, e.currentTarget, 'Copiar');
      list.appendChild(c);
    });
    const lbl = `Copiar el día completo (${total})`;
    document.getElementById('copy-dia-' + clave).onclick = (e) =>
      copiar(items.map((x) => x.texto).join('\n\n\n'), e.currentTarget, lbl);
  }
  renderDays();
  renderDay();
}
montarHorarios('cesaco', CESACO);
montarHorarios('cedepyt', CEDEPYT);

// ---- Mapa ----
const B = [
  // n, nombre, x,y,w,h, etiqueta corta en el mapa, voto, usado en cursadas
  [1, 'Edificio José Hernández', 600, 53, 400, 50, 'Hernández', 'CEDEPYT', 1],
  [24, 'Aula Magna Ana Jaramillo', 600, 105, 400, 42, 'Aula Magna', 0, 0],
  [8, 'Edificio Hernández Arregui', 1045, 53, 45, 29, '', 0, 0],
  [30, 'Gimnasio Universitario Gatica', 1100, 53, 62, 29, '', 0, 0],
  [32, 'Quincho Roberto Fontanarrosa', 1172, 53, 53, 29, '', 0, 0],
  [26, 'Escuela Judicial Manuel Dorrego', 1285, 137, 100, 31, 'Dorrego', 0, 1],
  [23, 'Buffet', 663, 177, 107, 28, 'Buffet', 0, 0],
  [28, 'Estudio de Grabación Enrique Discépolo', 788, 177, 107, 28, '', 0, 0],
  [13, 'Edificio Lola Mora', 948, 177, 50, 28, '', 0, 0],
  [10, 'Edificio Juana Azurduy', 510, 215, 65, 28, '', 0, 0],
  [4, 'Edificio Leopoldo Marechal', 285, 220, 165, 45, 'Marechal', 0, 1],
  [17, 'Edificio Rodolfo Ortega Peña', 325, 280, 85, 28, '', 0, 0],
  [9, 'Edificio Homero Manzi', 310, 330, 95, 35, 'Manzi', 0, 1],
  [3, 'Edificio Juana Manso', 615, 300, 155, 35, 'Manso', 'CEPyPP', 1],
  [16, 'Edificio Paco Urondo', 783, 245, 39, 28, '', 0, 0],
  [21, 'Vestidores del Campo de Deportes', 933, 245, 57, 28, '', 0, 0],
  [25, 'Escuela de Gobierno Néstor Kirchner', 815, 305, 55, 45, 'Kirchner', 0, 1],
  [20, 'Campo de Deportes Delfo Cabrera', 908, 285, 100, 140, '', 0, 0],
  [5, 'Edificio Manuel Ugarte', 253, 395, 152, 40, 'Ugarte', 0, 1],
  [18, 'Edificio Irma Laciar de Carrica', 933, 445, 52, 40, 'Carrica', 0, 1],
  [2, 'Edificio Arturo Jauretche', 250, 468, 155, 40, 'Jauretche', 'CESACO', 0],
  [29, 'Radio UNLa', 503, 498, 70, 27, '', 0, 0],
  [15, 'Edificio María Remedios del Valle', 813, 528, 72, 50, 'Remedios', 0, 1],
  [11, 'Edificio Leonardo Werthein', 930, 528, 58, 50, '', 0, 0],
  [6, 'Edificio Raúl Scalabrini Ortiz', 130, 553, 180, 52, 'Scalabrini', 0, 1],
  [14, 'Edificio Macedonio Fernández', 135, 625, 165, 30, 'Macedonio', 0, 1],
  [22, 'Casa del Estudiante Claudia Falcone', 470, 595, 40, 33, '', 0, 0],
  [12, 'Edificio Lisandro de la Torre', 385, 625, 63, 30, '', 0, 0],
  [7, 'Edificio Héctor Oesterheld', 700, 665, 55, 30, '', 0, 0],
  [31, 'Jardín Maternal Azucena Villaflor', 768, 650, 50, 35, '', 0, 0],
  [27, 'Laboratorio Oscar Varsavsky', 930, 635, 58, 50, '', 0, 1],
  [19, 'Cine Universitario Tita Merello', 600, 682, 58, 33, '', 0, 0],
];
const ENTRADAS = [
  {
    x: 997,
    y: 38,
    t: 'Entrada Ferrocarril',
    d: 'Por las vías del Roca, en la punta del Hernández',
    lx: 1022,
    ly: 30,
    anchor: 'start',
  },
  {
    x: 79,
    y: 445,
    t: 'Entrada Malabia y Alsina',
    d: 'Lado oeste del predio',
    lx: 24,
    ly: 392,
    anchor: 'start',
  },
  {
    x: 486,
    y: 744,
    t: 'Entrada 29 de Septiembre',
    d: 'Sobre la Av. 29 de Septiembre',
    lx: 452,
    ly: 752,
    anchor: 'end',
  },
];
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  parent && parent.appendChild(e);
  return e;
}
const $map = document.getElementById('map'),
  $info = document.getElementById('info'),
  $blist = document.getElementById('blist');
const nodes = {};
function select(n) {
  Object.values(nodes).forEach((g) => g.classList.remove('sel'));
  const b = B.find((x) => x[0] === n);
  if (!b) return;
  nodes[n].classList.add('sel');
  $info.innerHTML =
    `<strong>${n}. ${esc(b[1])}</strong>` +
    (b[7]
      ? ` · <span style="color:var(--vote-strong);font-weight:700">Se vota ${b[7]}</span>`
      : '');
}
function drawMap() {
  el('rect', { x: 0, y: 0, width: 1440, height: 790, rx: 10, fill: 'var(--ground)' }, $map);
  el(
    'text',
    { x: 720, y: 24, 'text-anchor': 'middle', 'font-size': 18, class: 'street' },
    $map,
    'vías del ferrocarril Roca',
  );
  el(
    'line',
    {
      x1: 20,
      y1: 42,
      x2: 1420,
      y2: 42,
      stroke: 'var(--line)',
      'stroke-width': 3,
      'stroke-dasharray': '14 8',
    },
    $map,
  );
  el(
    'text',
    { x: 760, y: 778, 'text-anchor': 'middle', 'font-size': 18, class: 'street' },
    $map,
    'Av. 29 de Septiembre',
  );
  B.forEach((b) => {
    const [n, name, x, y, w, h, short, vote, used] = b;
    const g = el(
      'g',
      {
        class: 'bld' + (vote ? ' vote' : used ? ' used' : ''),
        tabindex: 0,
        role: 'button',
        'aria-label': name + (vote ? ', se vota ' + vote : ''),
      },
      $map,
    );
    el('title', {}, g, n + '. ' + name);
    el('rect', { x, y, width: w, height: h, rx: 6 }, g);
    let label = String(n),
      fs = 18;
    if (short) {
      label = n + ' · ' + short;
      fs = Math.min(18, (w - 8) / (label.length * 0.6));
      if (fs < 12) {
        label = short;
        fs = Math.min(16, (w - 6) / (label.length * 0.6));
      }
      if (fs < 10) {
        label = String(n);
        fs = 18;
      }
    }
    if (n === 1) {
      label = '1 · Hernández · Se vota CEDEPYT';
      fs = 19;
    }
    el(
      'text',
      {
        x: x + w / 2,
        y: y + h / 2 + fs * 0.36,
        'text-anchor': 'middle',
        'font-size': fs.toFixed(1),
      },
      g,
      label,
    );
    g.addEventListener('click', () => select(n));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(n);
      }
    });
    nodes[n] = g;
  });
  // carteles de votación
  const tags = {
    1: { x: 800, y: 152, anchor: 'middle' },
    3: { x: 692, y: 342, anchor: 'middle' },
    2: { x: 327, y: 515, anchor: 'middle' },
  };
  // el cartel del Hernández va dentro del mismo edificio (ancho), los otros debajo
  B.filter((b) => b[7] && b[0] !== 1).forEach((b) => {
    const [n, , x, y, w, h] = b;
    const txt = 'Se vota ' + b[7];
    const fs = 17,
      tw = txt.length * fs * 0.56 + 22,
      cx = x + w / 2;
    let ty = n === 1 ? y + h + 4 + 44 : y + h + 6;
    if (n === 1) {
      ty = y - 4 - 30;
    } // arriba del Hernández no hay lugar, va a la derecha
    const g = el('g', { class: 'votetag' }, $map);
    if (n === 1) {
      el('rect', { x: x + w - tw - 8, y: y + 10, width: tw, height: 30, rx: 15 }, g);
      el(
        'text',
        { x: x + w - 8 - tw / 2, y: y + 31, 'text-anchor': 'middle', 'font-size': fs },
        g,
        txt,
      );
    } else {
      el('rect', { x: cx - tw / 2, y: ty, width: tw, height: 30, rx: 15 }, g);
      el('text', { x: cx, y: ty + 21, 'text-anchor': 'middle', 'font-size': fs }, g, txt);
    }
  });
  ENTRADAS.forEach((e) => {
    const g = el('g', { class: 'entry' }, $map);
    el('title', {}, g, e.t + '. ' + e.d);
    el('circle', { class: 'ring', cx: e.x, cy: e.y, r: 16 }, g);
    el('circle', { class: 'dot', cx: e.x, cy: e.y, r: 16 }, g);
    el(
      'path',
      {
        d: `M${e.x - 6} ${e.y}h12M${e.x + 1} ${e.y - 6}l6 6-6 6`,
        stroke: 'var(--surface)',
        'stroke-width': 3,
        fill: 'none',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        transform: `rotate(${e.y < 100 ? 90 : e.x < 200 ? 0 : -90} ${e.x} ${e.y})`,
      },
      g,
    );
    const fs = 19,
      tw = e.t.length * fs * 0.55 + 20;
    const rx = e.anchor === 'start' ? e.lx - 8 : e.lx - tw + 8;
    el('rect', { x: rx, y: e.ly - fs - 4, width: tw, height: fs + 14, rx: 8 }, g);
    el(
      'text',
      {
        class: 'lbl',
        x: e.anchor === 'start' ? e.lx + 2 : e.lx - 2,
        y: e.ly + 2,
        'text-anchor': e.anchor,
        'font-size': fs,
      },
      g,
      e.t,
    );
  });
  [...B]
    .sort((a, b) => a[0] - b[0])
    .forEach((b) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="num">${b[0]}</span><button type="button">${esc(b[1])}${b[7] ? ` <span class="v">· Se vota ${b[7]}</span>` : ''}</button>`;
      li.querySelector('button').onclick = () => {
        select(b[0]);
        document.querySelector('.mapbox').scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      $blist.appendChild(li);
    });
}
drawMap();
const VISTAS = ['cesaco', 'cedepyt', 'mapa'];
function showView(v) {
  try {
    localStorage.setItem('elecciones.vista', v);
  } catch (e) {}
  for (const x of VISTAS) {
    document.getElementById('v-' + x).hidden = v !== x;
    document.getElementById('tab-' + x).setAttribute('aria-selected', v === x);
  }
  if (v === 'mapa') {
    const m = document.querySelector('.mapbox');
    m.scrollLeft = (m.scrollWidth - m.clientWidth) * 0.45;
  }
}
for (const x of VISTAS) document.getElementById('tab-' + x).onclick = () => showView(x);
let vista;
try {
  vista = localStorage.getItem('elecciones.vista');
} catch (e) {}
const pedida = location.hash.slice(1);
if (VISTAS.includes(pedida)) vista = pedida;
showView(VISTAS.includes(vista) ? vista : 'cesaco');
// Un link con #cesaco, #cedepyt o #mapa abre esa pestaña, aunque la página ya esté abierta.
window.addEventListener('hashchange', () => {
  const v = location.hash.slice(1);
  if (VISTAS.includes(v)) showView(v);
});
