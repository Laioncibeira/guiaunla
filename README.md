# Guía UNLa · Humanidades y Artes

App pública para estudiantes del Departamento de Humanidades y Artes de la Universidad Nacional
de Lanús. Se abre en el celular, se instala desde el navegador y funciona sin señal.

Contesta las preguntas del día a día que hoy están desparramadas: qué correlativas necesita cada
materia, qué se destraba cuando la aprobás, cuándo abre la inscripción, dónde queda cada edificio.

**En línea:** https://guiaunla.web.app

## Qué tiene

| Pantalla | Qué resuelve |
|---|---|
| Inicio | Las próximas fechas del calendario académico y los accesos a todo lo demás. |
| Carreras | Las cuatro carreras del departamento y su plan de estudios completo. |
| Correlatividades | El plan entero como un mapa tocable, con buscador. Es el corazón de la app. |
| Horarios | Días, aulas y comisiones. Espera la planilla del Departamento. |
| Campus | Esquema del predio con los 32 edificios y cómo llegar a cada uno. |
| Fechas | El calendario académico 2026, con un botón para agendar cada fecha. |

No pide cuenta ni datos personales. Las materias que marcás como aprobadas se guardan sólo en tu
teléfono; no viajan a ningún servidor.

## Cómo trabajar en el proyecto

```bash
npm install
npm start          # servidor de desarrollo en http://localhost:4200
npm test           # motor de correlatividades y layout del grafo
npm run build      # genera las páginas estáticas en dist/guiaunla/browser
```

### Actualizar los datos

Los planes, el calendario y el campus son archivos JSON en `src/data/`. Nada se pide por red en
tiempo de ejecución: al compilar quedan dentro de la app.

```bash
node tools/extraer-plan.mjs            # baja los planes de unla.edu.ar y arma los JSON
node tools/cotejar-fuente.mjs          # verifica que el JSON coincida con la tabla publicada
node tools/validar-datos.mjs           # correlativas, ciclos, fechas y edificios
```

`cotejar-fuente` compara el JSON contra la tabla original leída por otro camino que el extractor.
Cuando coinciden código por código, marca el plan como `cotejado: true`. Las tres cosas corren en
CI, así que un plan roto no llega a producción.

Para agregar una carrera: sumala a `CARRERAS` en `tools/extraer-plan.mjs`, corré el extractor y
agregá el slug a `src/data/departamentos.json`. Las rutas y el pre-render se arman solos.

### Publicar

```bash
npm run build
npx firebase deploy --only hosting
```

Hace falta tener la CLI de Firebase instalada (`npm install -g firebase-tools`) y haber hecho
`firebase login` con la cuenta de Google dueña del proyecto.

## Cómo está armado

- **Angular 22** standalone con signals, sin zone.js.
- **Páginas pre-generadas**: al compilar se escribe un HTML por ruta, uno por carrera y uno por
  mapa de correlatividades. Cargan al instante y Google las indexa.
- **Se instala como app**: manifest en modo `standalone` y service worker que guarda todo, así
  abre sin señal, que en el campus pasa seguido.
- **Un solo layout, el del teléfono**: se diseñó a 390 px y en pantalla grande es la misma columna
  centrada.

El dominio vive en `src/app/core/` y son funciones puras: `correlatividades.ts` responde qué
necesita y qué habilita cada materia, `grafo.ts` calcula dónde va cada ficha. No tocan el DOM y se
prueban sin navegador.

## De dónde salen los datos

- Planes de estudio: las páginas de cada carrera en [unla.edu.ar](https://www.unla.edu.ar/ingreso/carreras).
- Calendario académico 2026: el PDF oficial de la universidad.
- Campus: el plano de orientación oficial. El esquema de la app es un dibujo propio, orientativo y
  sin escala, hecho a partir de esas referencias.

Si algo no coincide con tu plan, es un error nuestro: avisá y lo corregimos.

## Quiénes

Hecha por estudiantes, desde el [Frente de Estudiantes de
Izquierda](https://frente-de-estudiantes-de-izquierda-fei.web.app/).
