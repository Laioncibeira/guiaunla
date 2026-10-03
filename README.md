# Guía UNLa

App pública para estudiantes de la Universidad Nacional de Lanús. Se abre en el celular, se
instala desde el navegador y funciona sin señal. En pantalla grande es la misma app con la
navegación a la izquierda.

Contesta las preguntas del día a día que hoy están desparramadas: qué correlativas necesita cada
materia, qué se destraba cuando la aprobás, qué se cursa hoy y en qué aula, cuándo abre la
inscripción, dónde queda cada edificio.

**En línea:** https://guiaunla.web.app

## Qué tiene

| Pantalla | Qué resuelve |
|---|---|
| Inicio | Novedades del centro de estudiantes, el contador de la Ley de Financiamiento Universitario, un formulario para dejar propuestas y el banner de elecciones. |
| Tu carrera | Elegís tu carrera (24, de los cuatro departamentos: buscador o departamento → carrera) y desde ahí vas a las cinco puertas: correlatividades, plan, horarios, calendario y campus. |
| Correlatividades | El plan entero como un mapa tocable, con buscador, filtros y simulación de "qué me abre aprobar esto". Es el corazón de la app. |
| Plan de estudios | La lista completa por año o cuatrimestre, con lo que necesita y habilita cada materia. |
| Horarios | Qué se cursa hoy, en qué turno y en qué aula, según la grilla del Departamento. |
| Campus | Esquema del predio con los 32 edificios y cómo llegar a cada uno. |
| Fechas | El calendario académico 2026, con un botón para agendar cada fecha. |
| `/admin` | Panel de la agrupación: contactos recibidos (con exportación a Excel), novedades y visitas. No aparece en la barra. |

No pide cuenta ni datos personales. La carrera elegida y las materias que marcás como aprobadas se
guardan sólo en tu teléfono. El formulario de contacto es lo único que viaja a un servidor, y
sólo cuando lo enviás. Las fuentes tipográficas salen del propio sitio: abrir la app no le avisa
a nadie más.

## Cómo trabajar en el proyecto

Hace falta **Node.js 24** (o 22.22.3 en adelante): con una versión más vieja Angular no compila.
Con [nvm](https://github.com/nvm-sh/nvm), `nvm use` toma la versión de `.nvmrc`.

```bash
npm ci             # instala exactamente lo de package-lock.json
npm start          # servidor de desarrollo en http://localhost:4200
npm run ver        # lo mismo, accesible desde el celular en la misma wifi
npm test           # motor de correlatividades, layout del grafo, CSV, sesión del panel...
npm run test:reglas  # firestore.rules contra el emulador (necesita Java)
npm run formato    # deja el código con el formato de Prettier
npm run verificar  # pruebas, tipos, datos, build y CSP: lo mismo que la CI
npm run build      # genera las páginas estáticas en dist/guiaunla/browser
npm run previa     # build + emulador de Hosting con las cabeceras reales, en :5000
node tools/servir-dist.mjs   # sirve dist/ sin cabeceras, en :5055
```

En cada pull request y en cada cambio a `main`, GitHub corre lo mismo que `npm run verificar` más
el formato y las reglas (`.github/workflows/verificar.yml`).

### Actualizar los datos

Los planes, las grillas, el calendario y el campus son archivos JSON en `src/data/`. No hay base
de datos para eso: al compilar, el índice de carreras entra en la app y cada plan queda como un
archivo aparte que se baja recién cuando alguien lo mira.

```bash
npm run datos      # baja los 24 planes, los coteja contra la web y valida todo
```

`validar-datos.mjs` también avisa cuando al calendario le quedan menos de 60 días o cuando una
grilla es de un cuatrimestre que ya pasó. El calendario que usa la app es el que importa
`src/app/core/datos.ts` (`calendario/2026.json`): para el año nuevo, se agrega el archivo y se
cambia ese import.

`extraer-plan.mjs` reconoce el formato de cada tabla por su encabezado; Trabajo Social sale de un
PDF y Tecnologías Ferroviarias de una lista sin tabla. `cotejar-fuente.mjs` compara cada JSON
contra la tabla original leída por otro camino: cuando coinciden código por código marca el plan
como `cotejado: true`; las dos carreras sin tabla quedan `cotejado: false` con la explicación en
`nota`. `validar-datos.mjs` revisa la consistencia y que el índice esté al día.

Para agregar una carrera: sumala a `CARRERAS` en `tools/extraer-plan.mjs` (URL, departamento,
tipo, nombres, título), corré `npm run datos` y agregá el slug a `src/data/departamentos.json`.
Las rutas, el pre-render y el selector se arman solos desde el índice.

Para cargar la grilla de horarios de una carrera: `node tools/extraer-aulas.mjs <grilla.txt> --escribir`
con el texto de la planilla del Departamento genera `src/data/horarios/<slug>.json`; después
`npm run datos` deja el índice al día.

### Publicar

**Automático:** cada cambio que entra a `main` se publica solo (`.github/workflows/publicar.yml`),
siempre que el repo tenga el secreto `FIREBASE_SERVICE_ACCOUNT_GUIAUNLA_51AA7`. Se crea una vez con
`npx firebase-tools@15 init hosting:github` (elegí este repo y decí que no a todo lo demás).

**A mano**, desde tu computadora, después de `npx firebase-tools@15 login` con la cuenta de Google
dueña del proyecto:

```bash
npm run publicar   # verifica todo y publica Hosting y las reglas de Firestore
```

No uses `firebase deploy` a secas: también intentaría publicar las Cloud Functions, que necesitan
el plan Blaze.

## Cómo está armado

- **Angular 22** standalone con signals, sin zone.js.
- **Páginas pre-generadas**: al compilar se escribe un HTML por ruta: 24 planes, 24 mapas y las
  fijas, 55 en total. Cargan al instante y Google las indexa. El panel `/admin` no se pre-genera.
- **Datos bajo demanda**: `src/app/core/planes.ts` carga el plan y la grilla de una carrera con
  `import()` la primera vez que se piden y los guarda en memoria. El bundle inicial no crece con
  cada carrera nueva.
- **Se instala como app**: manifest en modo `standalone` y service worker. En la primera visita el
  service worker baja y guarda toda la app, con los 24 planes, las fuentes y las imágenes
  (~1,6 MB sin comprimir): después abre sin señal cualquier carrera. Las páginas HTML se guardan
  al visitarlas.
- **Firebase** (Firestore + Auth) sólo para lo que no puede ser un archivo: contactos, novedades,
  visitas y la sesión del panel. El SDK se carga con `import()` desde `src/app/core/firebase.ts`
  y nunca entra en el bundle inicial ni en el pre-render. Las reglas están en `firestore.rules` y
  se prueban con el emulador (`tools/reglas.spec.mjs`). App Check queda listo para prenderse con
  una clave de reCAPTCHA (`APP_CHECK_CLAVE` en `src/app/core/firebase-config.ts`).
- **Seguridad del sitio**: `firebase.json` manda una CSP que sólo permite scripts del propio sitio.
  `tools/revisar-csp.mjs` falla si el build trae algún script escrito dentro del HTML.
- **Un layout, dos anchos**: se diseñó a 390 px; desde 900 px la barra pasa a un riel a la
  izquierda y el contenido a una columna de 760 px.

El dominio vive en `src/app/core/` y son funciones puras: `correlatividades.ts` responde qué
necesita y qué habilita cada materia, `explorar.ts` simula qué se abre al aprobar, `grafo.ts`
calcula dónde va cada ficha. No tocan el DOM y se prueban sin navegador.

## De dónde salen los datos

- Planes de estudio: las páginas de cada carrera en [unla.edu.ar](https://www.unla.edu.ar/ingreso/carreras).
- Grillas de horarios: las planillas que publica cada Departamento al abrir el cuatrimestre.
- Calendario académico 2026: el PDF oficial de la universidad.
- Campus: el plano de orientación oficial. El esquema de la app es un dibujo propio, orientativo y
  sin escala, hecho a partir de esas referencias.

Si algo no coincide con tu plan, es un error nuestro: avisá y lo corregimos.

## Quiénes

Hecha por estudiantes, desde el [Frente de Estudiantes de
Izquierda](https://frentedeestudiantesdeizquierda-fei.web.app/).
