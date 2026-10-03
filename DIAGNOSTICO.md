# Diagnóstico del proyecto Guía UNLa

Revisión hecha el 3 de octubre de 2026 sobre la rama `main` (último commit: `ba4ebd4`, 16 de
septiembre). Está escrito para alguien que está aprendiendo a programar: cada término técnico se
explica la primera vez que aparece, y cada problema dice **dónde está**, **por qué importa** y
**cómo se arregla**.

> **Actualización (versión 1.0.0, 3 de octubre de 2026).** El diagnóstico de abajo es la foto de
> antes del mantenimiento y se deja como estaba, para aprender de él. Casi todo ya se resolvió;
> el estado de cada tarea está en la tabla que sigue, el detalle en `CHANGELOG.md` y lo que queda
> por hacer a mano en `NOTAS-PARA-LEON.md`.

| # | Tarea de la sección 5 | Estado |
|---|---|---|
| 1 | CSP y hoja de estilos | ✅ Hecho, con un control en la CI (`tools/revisar-csp.mjs`) |
| 2 | Ingreso y salida del panel | ✅ Hecho, con pruebas (`sesion.spec.ts`) |
| 3 | Límites a las escrituras públicas | 🟡 Reglas de suscripciones endurecidas y App Check listo; **prenderlo y las alertas de uso los hace quien administra** |
| 4 | Dependencias con avisos de seguridad | ✅ `npm audit` en 0 (app y `functions/`) |
| 5 | Versión de Node documentada | ✅ `.nvmrc`, `engines` y README |
| 6 | CI activa y cotejo que no pase en vacío | ✅ `.github/workflows/verificar.yml`, `cotejar-fuente.mjs --estricto` |
| 7 | Zoom del mapa | ✅ |
| 8 | `functions/` | ✅ Node 22, dependencias al día, lockfile; `npm run publicar` usa `--only` |
| 9 | Respaldo de secretos y apiKey | 🟡 Documentado; **respaldar y restringir la clave los hace quien administra** |
| 10 | Datos de 2027 | 🟡 El validador avisa a tiempo; **los datos los publica la universidad** |
| 11 | Errores en el panel | ✅ |
| 12 | Duplicados | ✅ Los de lógica. Quedan estilos parecidos entre pantallas: unificarlos cambia el diseño y conviene hacerlo mirándolo |
| 13 | Código sin uso | ✅ (`camino`, `alcance` y `habilitadas` se quedan: son para una función futura) |
| 14 | Modo estricto | ✅ `strict` y `strictTemplates`, más chequeo de tipos de las pruebas |
| 15 | Prettier | ✅ |
| 16 | `correlativasDe` | ✅ |
| 17 | Service worker | ✅ Se mantiene la descarga completa (sirve para el modo sin señal) y el README ya lo dice |
| 18 | Fuentes en el sitio | ✅ |
| 19 | `tools/` | ✅ El boceto de 2,7 MB se queda: es el mockup que se usa para mirar el diseño |
| 20 | Dejar de recibir avisos | ✅ |
| 21 | Pruebas de las reglas | ✅ `npm run test:reglas` (12 pruebas, también en la CI) |
| 22 | Pruebas de componentes | ⏳ Pendiente: hay pruebas de las guardas del panel, no de las pantallas |
| 23 | Botón "atrás" | ✅ |
| 24 | `@angular/forms` | ✅ |
| 25 | Versión y CHANGELOG | ✅ 1.0.0 |

### Cómo se hizo la revisión

No es sólo lectura: además de leer las ~9.000 líneas de código (sin contar los datos), se corrió
todo lo que se pudo correr.

| Qué se hizo | Resultado |
|---|---|
| `npm ci` (instalar dependencias) | Instala, con avisos de versión de Node (ver 4.1.5). |
| `npm test` | 165 pruebas en 6 archivos: **todas pasan**. |
| `npm run build` con Node 22.22.0 | **No arranca**: Angular 22 pide Node ≥ 22.22.3. |
| `npm run build` con Node 24.15.0 | **Compila bien**, pre-genera 55 páginas. |
| `node tools/validar-datos.mjs` | Pasa, con 4 avisos conocidos. |
| `node tools/cotejar-fuente.mjs` sin caché | Se saltea las 24 carreras y dice "todo bien" (ver 4.1.4). |
| `npm outdated` y `npm audit` | 10 avisos de seguridad en dependencias (ver 4.3). |
| `npx prettier --check` | 35 archivos sin el formato que el propio proyecto define. |
| Navegador automático (Playwright + Chromium) sobre el build | Se reprodujeron dos errores visibles (ver 4.1.1 y 4.1.3). |
| Una prueba temporal del inicio de sesión del panel | Se reprodujo un tercer error (ver 4.1.2). La prueba se borró después. |

### Resumen en 30 segundos

- **El proyecto está bien hecho.** La lógica importante (correlatividades, simulación, dibujo del
  mapa) está separada, comentada y con muchas pruebas. Las reglas de seguridad de la base de datos
  están pensadas con cuidado.
- **Hay tres errores que afectan a usuarios reales:** la política de seguridad del sitio (CSP)
  bloquea la hoja de estilos global en producción; el panel `/admin` no deja entrar ni salir sin
  recargar la página; y en el mapa de correlatividades, tocar una materia pierde el zoom.
- **El mayor riesgo de seguridad** es que cualquiera puede escribir en la base de datos sin límite
  (formulario, visitas, suscripciones). Las protecciones actuales sólo frenan a quien usa la app,
  no a un script.
- **Mantenimiento urgente:** actualizar dependencias con vulnerabilidades, documentar qué versión
  de Node hace falta, activar la verificación automática (CI) y preparar los datos de 2027.

---

## 1. Qué hace el proyecto y qué tecnologías usa

### Qué hace

Guía UNLa es una **aplicación web** para estudiantes de la Universidad Nacional de Lanús. Se abre
en el navegador del celular, se puede "instalar" como si fuera una app y funciona sin señal.
Resuelve preguntas del día a día:

- **Correlatividades:** qué materias necesitás aprobar antes de cursar otra, y qué se te "destraba"
  cuando aprobás una. Se muestra como un mapa que se puede tocar, o como lista.
- **Plan de estudios** de 24 carreras de 4 departamentos.
- **Horarios y aulas** (hoy, sólo 3 carreras tienen la grilla cargada).
- **Campus:** un dibujo del predio con los 32 edificios.
- **Fechas:** el calendario académico, con botón para agendar.
- **Inicio:** novedades del centro de estudiantes, un contador de días, un formulario de contacto
  y la opción de recibir avisos en el teléfono.
- **Panel `/admin`:** para la agrupación: leer los mensajes del formulario, escribir novedades y
  ver cuántas visitas tiene cada pantalla.

Una idea clave para entender la arquitectura: **casi toda la app es un sitio estático** (archivos
que no cambian hasta la próxima publicación) y **sólo lo que cambia todos los días** (mensajes,
novedades, visitas, suscripciones a avisos) vive en una base de datos en la nube.

### Tecnologías y para qué sirve cada una

| Tecnología | Qué es, en una línea | Para qué la usa este proyecto | Dónde mirar |
|---|---|---|---|
| **HTML, CSS, JavaScript** | Los tres lenguajes que entiende un navegador: estructura, aspecto y comportamiento. | Todo lo que se ve. | Todo `src/` |
| **TypeScript** | JavaScript con *tipos*: le decís al compilador qué forma tiene cada dato y te avisa si te equivocás antes de ejecutar. | Todo el código de la app. | `src/**/*.ts` |
| **Angular 22** | Un *framework* (marco de trabajo) de Google para armar aplicaciones web con *componentes*. | Pantallas, navegación entre pantallas, estado. | `src/app/` |
| **Signals** (de Angular) | Variables "reactivas": cuando cambian, la pantalla se actualiza sola. | Todo el estado de la app (carrera elegida, materias seleccionadas, etc.). | `signal(`, `computed(`, `effect(` |
| **Angular SSR / pre-render** | Generar el HTML de cada pantalla al compilar, en vez de en el navegador. | 55 páginas salen listas: cargan rápido y Google las indexa. | `src/app/app.routes.server.ts` |
| **Service Worker / PWA** | Un script que el navegador guarda y que intercepta los pedidos de red. *PWA* = app web instalable. | Funcionar sin señal e instalarse en el teléfono. | `ngsw-config.json`, `public/manifest.webmanifest` |
| **SCSS** | CSS con algunas comodidades extra (variables, anidado). | Estilos globales y colores del tema claro y oscuro. | `src/styles.scss` |
| **SVG** | Gráficos vectoriales escritos como texto. Escalan sin pixelarse. | El mapa de correlatividades, el campus y los íconos. | `src/app/paginas/grafo.ts`, `otras.ts` |
| **JSON** | Formato de texto para guardar datos. | Planes, horarios, calendario y campus. | `src/data/` |
| **Firebase Hosting** | Servicio de Google que publica archivos estáticos en internet. | Publicar la app en `guiaunla.web.app`. | `firebase.json` |
| **Cloud Firestore** | Base de datos en la nube, de documentos (parecidos a JSON). | Mensajes, novedades, visitas, suscripciones. | `src/app/core/*.ts`, `firestore.rules` |
| **Reglas de Firestore** | Un lenguaje para decir quién puede leer o escribir cada dato. | Es la verdadera seguridad de la base. | `firestore.rules` |
| **Firebase Authentication** | Servicio de inicio de sesión. | Cuentas del panel `/admin` (mail y contraseña). | `src/app/paginas/admin/sesion.ts` |
| **Cloud Functions** | Código que corre en servidores de Google cuando pasa algo. | Mandar avisos al publicar una novedad. **No está desplegada** (pide plan pago). | `functions/` |
| **Web Push + VAPID** | El estándar para mandar notificaciones a un navegador. VAPID es el par de claves que identifica a quien manda. | "Quiero recibir novedades". | `src/app/core/avisos.ts`, `functions/enviar.js` |
| **Node.js** | JavaScript fuera del navegador. | Compilar, correr pruebas y los scripts de datos. | `tools/*.mjs` |
| **npm** | El gestor de paquetes de Node: baja e instala librerías. | Todas las dependencias. | `package.json`, `package-lock.json` |
| **Vitest + jsdom** | Herramienta para escribir y correr pruebas automáticas; jsdom simula un navegador. | 165 pruebas de la lógica. | `src/**/*.spec.ts` |
| **Prettier / EditorConfig** | Formatean el código para que todo tenga el mismo estilo. | Estilo uniforme (aunque hoy no se aplica, ver 4.4). | `.prettierrc`, `.editorconfig` |
| **RxJS** | Librería para manejar flujos de eventos. Angular la usa por dentro. | Casi nada: sólo dos `map` para leer datos de la ruta. | `grafo.ts`, `carreras.ts` |
| **Google Fonts** | Tipografías servidas por Google. | Las fuentes Archivo y DM Mono. | `src/index.html` |
| **GitHub Actions (preparado)** | Verificación automática en cada cambio (*CI*). | Está escrito pero **no activado**. | `tools/ci/ci.yml` |

---

## 2. Cómo está organizado

### El árbol, con comentarios

```text
guiaunla/
├── README.md                 Qué es la app y cómo trabajar en ella
├── NOTAS-PARA-LEON.md        Bitácora de decisiones y pendientes (lo más nuevo arriba)
├── package.json              Dependencias y comandos (npm start, npm test, ...)
├── package-lock.json         Versiones exactas instaladas (no se edita a mano)
├── angular.json              Cómo compila Angular: entrada, estilos, service worker, presupuestos
├── tsconfig*.json            Opciones de TypeScript (app y pruebas)
├── firebase.json             Hosting: carpeta a publicar, redirecciones y cabeceras de seguridad
├── .firebaserc               Qué proyecto de Firebase usar (guiaunla-51aa7)
├── firestore.rules           Quién puede leer y escribir cada colección
├── firestore.indexes.json    Índice que necesita la consulta de novedades
├── ngsw-config.json          Qué guarda el service worker para el modo sin señal
│
├── src/                      EL CÓDIGO DE LA APP
│   ├── index.html            La única página HTML base; Angular la completa
│   ├── main.ts               Arranca la app en el navegador
│   ├── main.server.ts        Arranca la app al pre-generar páginas
│   ├── styles.scss           Colores, tipografía y reglas globales
│   ├── app/
│   │   ├── app.ts            Componente raíz: la pantalla + la barra de navegación
│   │   ├── app.config.ts     "Enchufes" globales: router, hidratación, service worker
│   │   ├── app.routes.ts     Qué URL muestra qué pantalla
│   │   ├── app.routes.server.ts  Qué rutas se pre-generan
│   │   ├── core/             LÓGICA Y SERVICIOS (sin pantallas)
│   │   │   ├── datos.ts           Tipos de datos y carga de los JSON
│   │   │   ├── correlatividades.ts  Qué necesita / qué habilita cada materia (funciones puras)
│   │   │   ├── explorar.ts        Simulación "si apruebo esto, ¿qué se me abre?" (funciones puras)
│   │   │   ├── grafo.ts           Calcula dónde va cada tarjeta del mapa (funciones puras)
│   │   │   ├── planes.ts          Carga cada plan una sola vez y lo recuerda
│   │   │   ├── firebase.ts        La única puerta a Firebase
│   │   │   ├── firebase-config.ts Identificación pública del proyecto
│   │   │   ├── contacto.ts, novedades.ts, visitas.ts, avisos.ts   Servicios que usan Firestore
│   │   │   └── *.spec.ts          Pruebas automáticas
│   │   ├── paginas/          LAS PANTALLAS
│   │   │   ├── inicio.ts, carrera.ts, carreras.ts, grafo.ts, horarios.ts, novedades.ts
│   │   │   ├── otras.ts           Fechas, Campus y "página no encontrada"
│   │   │   ├── formato.ts         Fechas en castellano, archivo .ics para agendar
│   │   │   └── admin/             El panel: ingreso, contactos, novedades, visitas, sesión, CSV
│   │   └── shared/           PIEZAS REUSABLES
│   │       ├── ui.ts              Barra de navegación, botón "atrás", carrera elegida, aprobadas
│   │       ├── contacto.ts        Formulario de contacto
│   │       ├── fei.ts             Logos, firmas y banner de la agrupación
│   │       └── instalar.ts, tutorial.ts, reloj-ley.ts
│   └── data/                 LOS DATOS (JSON)
│       ├── carreras/              Un archivo por carrera + indice.json (resumen de las 24)
│       ├── horarios/              Grillas de 3 carreras
│       ├── calendario/2026.json   27 fechas
│       ├── campus/edificios.json  32 edificios y accesos
│       └── departamentos.json     Qué carreras tiene cada departamento
│
├── public/                   Archivos que se copian tal cual: íconos, logos, manifest
├── functions/                Código para mandar avisos al teléfono (Cloud Function + script manual)
└── tools/                    SCRIPTS DE APOYO (no van a la app)
    ├── extraer-plan.mjs      Baja los planes de unla.edu.ar y los convierte a JSON
    ├── cotejar-fuente.mjs    Compara cada JSON contra la tabla original
    ├── validar-datos.mjs     Revisa que los datos sean consistentes
    ├── extraer-aulas.mjs     Convierte la planilla de horarios a JSON
    ├── servir-dist.mjs       Sirve el build como lo haría Firebase
    ├── ci/                   La verificación automática, todavía sin activar
    ├── identidad/            Logos originales en PNG
    └── mockup/               Bocetos de diseño (incluye un HTML de 2,7 MB)
```

### Cómo viaja un dato: del sitio de la UNLa a tu pantalla

Seguir un dato de punta a punta es la mejor forma de entender un proyecto:

1. `tools/extraer-plan.mjs` descarga la página de la carrera en unla.edu.ar, lee la tabla y escribe
   `src/data/carreras/<carrera>.json`, más un resumen en `indice.json`.
2. `tools/cotejar-fuente.mjs` lee la misma tabla "por otro camino" y compara. Si coinciden, marca el
   plan como `cotejado: true`. `tools/validar-datos.mjs` revisa que no haya correlativas que
   apunten a materias inexistentes, ciclos, etc.
3. Al compilar, `src/app/core/datos.ts` hace `import(...)` de cada JSON. El compilador convierte cada
   plan en un archivo aparte (*chunk*) que sólo se descarga cuando alguien mira esa carrera.
4. Cuando entrás a `/carrera/audiovision/correlatividades`, el *resolver* de la ruta
   (`core/planes.ts`) espera a que ese archivo llegue y se lo pasa a la pantalla (`paginas/grafo.ts`).
5. La pantalla le pide a `core/grafo.ts` las posiciones de las tarjetas y a `core/explorar.ts` qué
   está habilitado, y dibuja un SVG.
6. Las materias que marcás como aprobadas se guardan en `localStorage` (el almacenamiento del
   navegador, en tu teléfono). No viajan a ningún servidor.

### Una decisión de diseño que conviene copiar

La carpeta `core/` tiene **funciones puras**: reciben datos, devuelven datos, no tocan la pantalla
ni la red. Por eso se pueden probar sin navegador (son la mayoría de las 165 pruebas) y por eso el
mapa de correlatividades es confiable. Las pantallas (`paginas/`) sólo conectan esas funciones con
lo que se ve.

---

## 3. Cómo se ejecuta en local y cómo se publica

### Lo que necesitás instalado

- **Git**, para bajar el código.
- **Node.js 24.15 o más nuevo** (o 22.22.3 o más nuevo dentro de la línea 22). ⚠️ El README no lo
  dice, y con una versión apenas más vieja el build se niega a arrancar con este mensaje:
  `The Angular CLI requires a minimum Node.js version of v22.22.3 or v24.15.0`. Si usás
  [nvm](https://github.com/nvm-sh/nvm): `nvm install 24 && nvm use 24`.
- **npm** (viene con Node).
- Para publicar, además: la **CLI de Firebase** y acceso a la cuenta de Google dueña del proyecto.

### Correrla en tu computadora

```bash
git clone <url-del-repo> && cd guiaunla
npm ci            # instala exactamente las versiones de package-lock.json
npm start         # servidor de desarrollo en http://localhost:4200 (se recarga al guardar)
npm run ver       # lo mismo, pero accesible desde el celular en la misma wifi
npm test          # corre las 165 pruebas (menos de un segundo)
npm run build     # genera la versión de producción en dist/guiaunla/browser
node tools/servir-dist.mjs   # sirve esa carpeta en http://localhost:5055
```

`npm ci` vs `npm install`: `ci` respeta al pie de la letra el `package-lock.json` (lo que querés
para reproducir un entorno); `install` puede actualizar versiones dentro de los rangos permitidos.

Dos detalles para no confundirse:

- En `npm start` el **service worker está apagado** (sólo se activa en producción). Para probar el
  modo sin señal, usá `npm run build` + `servir-dist.mjs`.
- `servir-dist.mjs` **no** manda las cabeceras de seguridad de `firebase.json`. Para ver la app
  exactamente como en producción, usá el emulador de Firebase: `npx firebase emulators:start --only hosting`.

### Actualizar los datos

```bash
npm run datos     # baja los 24 planes de unla.edu.ar, los coteja y valida todo
```

Necesita internet. El HTML bajado se guarda en `tools/cache/` (no se sube al repo) para no
saturar el sitio de la universidad, que corta con error 429 si se le pide rápido.

### Publicar

```bash
npm run build
npx firebase deploy --only hosting      # la app
npx firebase deploy --only firestore    # sólo si cambiaron firestore.rules o los índices
```

⚠️ Usá siempre `--only`. `firebase.json` también declara las Cloud Functions, que necesitan el
plan pago (Blaze); un `firebase deploy` a secas intentaría desplegarlas y fallaría.

```text
tu computadora                       Firebase (Google)                  el teléfono
──────────────                       ─────────────────                  ───────────
src/ ──npm run build──> dist/ ──deploy──> Hosting (guiaunla.web.app) ──> navegador + service worker
                                          Firestore  <──────────────────── formulario, visitas, novedades
                                          Auth       <──────────────────── panel /admin
```

### Mandar los avisos al teléfono (hoy es manual)

Como el proyecto está en el plan gratuito, la función automática no corre. Cada vez que se publica
una novedad hay que correr, desde una computadora con los dos archivos secretos en
`tools/secretos/` (`cuenta-servicio.json` y `vapid.json`, que **no** están en el repo):

```bash
cd functions && npm install        # una sola vez
npm run avisar -- <id de la novedad>
```

---

## 4. Problemas encontrados

Cómo leer esta sección:

- 🔴 **Alto**: afecta a usuarios hoy o es un riesgo serio. 🟠 **Medio**: hay que resolverlo pronto.
  🟡 **Bajo**: mejora de calidad.
- ✅ **Reproducido**: se comprobó corriendo algo. 📖 **Por lectura**: surge de leer el código.

### 4.1 Errores (bugs)

#### 4.1.1 🔴 La política de seguridad (CSP) bloquea la hoja de estilos global ✅

**Dónde:** `firebase.json` (cabecera `Content-Security-Policy`) + cómo Angular arma el HTML.

**Qué pasa:** Angular, para que la página aparezca más rápido, mete el CSS más importante dentro del
HTML y carga el resto así:

```html
<link rel="stylesheet" href="styles-XXXX.css" media="print" onload="this.media='all'">
```

O sea: "cargá la hoja como si fuera para imprimir, y cuando termine pasala a `all`". Ese
`onload="..."` es JavaScript escrito dentro del HTML (*inline*). La CSP del sitio dice
`script-src 'self'`, que significa "sólo ejecuto JavaScript que venga en archivos de este sitio".
Entonces el navegador **bloquea** el `onload` y la hoja **se queda para imprimir para siempre**.

**Consecuencia:** se ve sólo el CSS crítico. Se pierden, entre otras cosas, el **tema claro** (quien
tiene el teléfono en modo claro ve la app en oscuro), las reglas de **escritorio** (`min-width: 900px`),
los ajustes para pantallas chicas y las reglas de "reducir movimiento". Además se bloquean dos
scripts inline de Angular (*event replay*, que recuerda los toques hechos mientras la página carga).

**Cómo se comprobó:** se sirvió el build con la misma cabecera de `firebase.json` en Chromium. Sin
CSP, la hoja queda en `media="all"` y la página se ve clara; con CSP queda en `media="print"` y se ve
oscura. La consola muestra tres errores `Refused to execute inline script/event handler`. (El sitio
publicado no se pudo abrir desde el entorno de revisión; vale la pena confirmarlo abriendo la
consola del navegador en guiaunla.web.app.)

**Cómo se arregla (dos partes):**

1. En `angular.json`, configuración `production`, desactivar el truco de CSS crítico:
   `"optimization": { "scripts": true, "fonts": true, "styles": { "minify": true, "inlineCritical": false } }`.
   La hoja global pesa 2,6 kB: cargarla normal no se nota.
2. Para los dos scripts de Angular: agregar sus *hashes* (huellas `sha256-...`, que la propia consola
   del navegador muestra en el error) a `script-src`, o probar la opción `"security": { "autoCsp": true }`
   de Angular. Ojo: los hashes cambian al actualizar Angular, así que conviene un control en CI.

Después, probar con `npx firebase emulators:start --only hosting`, que sí aplica las cabeceras.

#### 4.1.2 🔴 El panel `/admin` no deja entrar ni salir sin recargar ✅

**Dónde:** `src/app/paginas/admin/sesion.ts`, método `listo()` y las guardas `conSesion` / `sinSesion`.

**Qué pasa:** `listo()` crea **una sola** promesa con la *primera* respuesta de Firebase ("¿hay
sesión?") y la reutiliza para siempre (`this.primeraRespuesta ??= ...`). Una *guarda* (`canActivate`)
es una función que decide si una ruta se puede abrir; estas dos preguntan a `listo()`.

- Al **entrar**: la primera respuesta fue "no hay sesión". Después de un login correcto,
  `ingreso.ts` navega a `/admin`, la guarda vuelve a preguntar a `listo()`, recibe la respuesta
  vieja ("no hay sesión") y te devuelve al formulario de ingreso. Sin mensaje de error.
- Al **salir**: pasa lo inverso. Si abriste el panel ya logueado, después de "Cerrar sesión" la
  guarda sigue creyendo que hay sesión y ves "Tu cuenta todavía no está habilitada".

Recargar la página lo "arregla", porque se crea una promesa nueva.

**Cómo se comprobó:** con una prueba temporal que simula Firebase: después de un `entrar()` exitoso,
la señal `usuario()` sí tiene al usuario, pero `await listo()` sigue devolviendo `null`.

**Cómo se arregla:** que las guardas esperen la primera respuesta y después lean el estado *actual*.
Firebase Auth trae `auth.authStateReady()` para eso: `await auth.authStateReady(); return auth.currentUser ? ...`.
Conviene sumar una prueba como la que se usó acá (está descripta arriba) para que no vuelva.

#### 4.1.3 🟠 En el mapa, tocar una materia cambia el zoom ✅

**Dónde:** `src/app/paginas/grafo.ts`, el primer `effect(...)` del constructor (línea ~602).

**Qué pasa:** un `effect` en Angular se vuelve a ejecutar cada vez que cambia alguna señal que lee.
Este lee `this.query()` (los parámetros de la URL) para abrir la materia de un link compartido
(`?materia=01`). Pero al tocar una materia, la pantalla **escribe** `?materia=...` en la URL
(`sincronizarUrl`). Resultado: el efecto se dispara de nuevo y re-encuadra el mapa.

- Con una materia seleccionada: hace zoom sobre ella aunque estuvieras mirando todo el plan.
- Al seleccionar la segunda: la URL se limpia y el mapa **vuelve al encuadre inicial** (arriba a la izquierda).

**Cómo se comprobó:** en Chromium, "Ver todo" deja el `viewBox` en `0 0 1052 984`; un toque lo
cambia a `0 78 683 647`; otro "Ver todo" y un segundo toque lo devuelven a `0 184 683 584`.

**Cómo se arregla:** leer el parámetro de la URL sólo al llegar a la pantalla (por ejemplo, con
`untracked(() => this.query())` o con `this.ruta.snapshot`), y dejar el efecto reactivo sólo para
cuando cambia el plan o el tamaño del lienzo.

#### 4.1.4 🟠 El cotejo de los planes "pasa" sin cotejar nada ✅

**Dónde:** `tools/cotejar-fuente.mjs` y el paso de `tools/ci/ci.yml` que lo usa.

**Qué pasa:** el cotejo necesita el HTML guardado en `tools/cache/`, que no está en el repo. Sin esa
carpeta imprime `sin HTML cacheado` para cada carrera y **termina con éxito** (código de salida 0).
En una verificación automática (CI) esa carpeta nunca existe, así que el paso "Los datos de los
planes siguen siendo consistentes" daría verde sin haber comparado ninguna carrera. Es una falsa
sensación de seguridad.

**Cómo se arregla:** que el script falle si no pudo cotejar ninguna carrera (o con una opción
`--estricto` para CI), y dejar en CI sólo `validar-datos.mjs`, que no necesita internet.

#### 4.1.5 🟠 No está documentada la versión de Node ✅

**Dónde:** `README.md`, `package.json` (no tiene `engines`), falta un archivo `.nvmrc`.

Angular 22 exige Node ≥ 22.22.3 o ≥ 24.15. Con Node 22.22.0 `npm run build` se niega a arrancar. A
alguien que recién empieza le puede costar horas entender por qué. Además, CI usa Node 24 y
`functions/` declara Node 20: tres versiones distintas en el mismo proyecto.

#### 4.1.6 🟡 El botón "atrás" puede sacarte de la app 📖

**Dónde:** `src/app/shared/ui.ts`, clase `Historial`.

Cuenta las navegaciones internas pero el contador **sólo sube**. Si entrás por un link compartido,
vas a otra pantalla y volvés con el "atrás" del navegador, el contador queda en 2; el botón "atrás"
de la app cree que hay historial propio y hace `location.back()`, que te lleva al sitio de donde
viniste (o a una pestaña vacía) en vez de a la pantalla de respaldo.

#### 4.1.7 🟡 Acciones del panel sin manejo de errores 📖

**Dónde:** `src/app/paginas/admin/contactos.ts` y `admin/novedades.ts`.

`cambiarAbierto`, `marcar`, `borrar` y `alternar` no tienen `try/catch`. Si Firestore rechaza la
escritura (sin señal, permisos), no se avisa nada. En `cambiarAbierto` es peor: el interruptor ya
cambió en pantalla (actualización "optimista") y queda mostrando un estado que no se guardó.

#### 4.1.8 🟡 Trabajo repetido en el plan de estudios 📖

**Dónde:** `src/app/paginas/carreras.ts`, método `correlativasDe`.

Se llama una vez por materia en cada dibujo, y cada llamada ejecuta `vincular(c)`, que recorre el
plan entero. Con 58 materias, el plan se recorre 58 veces por dibujo cuando alcanzaría con una. No
se nota hoy, pero es un ejemplo clásico de algo que conviene calcular una vez con `computed`. (De paso: si una materia no
pide correlativas pero sí habilita otras, el texto "habilita N" no aparece.)

#### 4.1.9 🟡 El service worker descarga todo, no sólo lo que se visita 📖

**Dónde:** `ngsw-config.json`, grupo `app` con `"/*.js"` en modo `prefetch`.

El README dice que "las demás carreras se guardan al visitarlas", pero el patrón `/*.js` incluye
**todos** los chunks: los 24 planes, las 3 grillas y el SDK de Firebase. En la primera visita el
teléfono baja ~1,6 MB de JavaScript (sin comprimir). Es una decisión válida para el modo sin señal,
pero hay que elegirla a conciencia y que el README diga lo que realmente pasa.

### 4.2 Riesgos de seguridad

#### 4.2.1 🔴 Cualquiera puede escribir en la base sin límite

**Dónde:** `firestore.rules` (colecciones `contactos`, `visitas`, `suscripciones`).

Las reglas validan muy bien la **forma** de cada dato (largo, campos permitidos, fecha del
servidor). Pero no limitan **cuántas veces**. Las defensas del formulario (campo trampa, mínimo de 3
segundos, 60 segundos entre envíos guardados en `localStorage`) sólo funcionan dentro de la app:
un script puede hablar directo con Firestore usando la `apiKey` pública y saltearlas todas.

Qué podría pasar:

- **Spam** en los mensajes de contacto.
- **Visitas infladas**: el contador del panel deja de significar algo.
- **Cuota agotada**: el plan gratuito permite 20.000 escrituras por día. Si alguien las gasta, el
  formulario y el contador dejan de funcionar hasta el día siguiente.
- **Suscripciones falsas**: la regla acepta cualquier `endpoint` que empiece con `https://`. El
  script de avisos le haría un pedido a cada una de esas direcciones desde la computadora de quien
  lo corre, y tardaría cada vez más (las manda de a una).

**Cómo se mitiga:**

1. Activar **Firebase App Check** (con reCAPTCHA) y exigirlo en Firestore: así sólo la app
   verdadera puede escribir.
2. En la regla de `suscripciones`, aceptar sólo los dominios de los servicios de push conocidos
   (`fcm.googleapis.com`, `updates.push.services.mozilla.com`, `web.push.apple.com`, `*.notify.windows.com`).
3. Configurar alertas de uso en la consola de Firebase para enterarse si algo se dispara.

#### 4.2.2 🟠 Dependencias con vulnerabilidades conocidas

Ver la tabla de 4.3. La buena noticia: casi todas afectan a herramientas que corren en tu
computadora al compilar, o a partes que esta app no usa en producción. Igual hay que actualizar.

#### 4.2.3 🟡 Secretos fuera del repo, pero sin respaldo documentado

Está bien que `tools/secretos/` no se suba (está en `.gitignore`, y se revisó el historial: no hay
claves privadas commiteadas). Pero:

- La clave **VAPID privada** (`vapid.json`) vive sólo en una computadora. Si se pierde, no se pueden
  mandar más avisos a los teléfonos ya suscriptos: habría que generar claves nuevas y que todos se
  vuelvan a suscribir. `NOTAS-PARA-LEON.md` explica cómo conseguir `cuenta-servicio.json` pero no
  menciona `vapid.json`.
- `cuenta-servicio.json` da acceso de administrador total a la base. Hay que tratarlo como una
  contraseña maestra.

Recomendación: guardar ambos en un gestor de contraseñas de la agrupación.

#### 4.2.4 🟡 Endurecimientos chicos

- **La `apiKey` de Firebase** es pública por diseño (el comentario de `firebase-config.ts` lo explica
  bien), pero conviene **restringirla por dominio** en la consola de Google Cloud para que sólo
  funcione desde `guiaunla.web.app`.
- **Mail personal en el código:** `functions/enviar.js` usa un mail personal como contacto VAPID y
  queda público en el repo. Mejor uno genérico de la agrupación.
- **Google Fonts:** cada visita le avisa a Google la IP del visitante, lo que choca un poco con el
  "no pide datos" del README; y las fuentes no quedan guardadas para el modo sin señal. Alojarlas
  en `public/` resuelve las dos cosas.
- **`tools/mockup/serve.mjs`** no controla que la ruta pedida quede dentro de la carpeta (un pedido
  con `../` podría leer otros archivos). Es una herramienta local, pero es un buen ejemplo para
  aprender qué es un *path traversal*; `tools/servir-dist.mjs` sí lo controla.

### 4.3 Dependencias desactualizadas

Los números con `^` en `package.json` son *rangos*: `^22.0.0` significa "cualquier 22.x.x". El
`package-lock.json` fija la versión exacta que se instala.

| Paquete | Instalado | Disponible | Comentario |
|---|---|---|---|
| `@angular/*` (core, router, etc.) | 22.1.5 | 22.2.1 | Actualización menor. Corrige avisos de seguridad de SSR (no aplican a un sitio estático, pero conviene). |
| `@angular/build`, `@angular/cli` | 22.1.7 | 22.2.1 | Arrastra `piscina` con un aviso **crítico** (sólo en tu compu, al compilar). |
| `firebase` | 12.19.0 | 12.19.0 | Al día. El aviso de `@grpc/grpc-js` es de la versión para Node, no la del navegador. `npm audit` propone "arreglarlo" bajando a Firebase 9: **no lo hagas**. |
| `typescript` | 6.0.3 | 7.0.2 | Hay que esperar a que Angular soporte TS 7. |
| `vitest` | 4.1.11 | 5.0.3 | Versión mayor nueva: actualizar con calma. |
| `jsdom` | 28.1.0 | 29.1.1 | Versión mayor nueva. |
| `@types/node` | 20.x | 26.x | Debería coincidir con la versión de Node que uses (22 o 24). |
| `prettier` | 3.9.6 | 3.9.9 | Parche. |
| `fast-uri`, `ip-address` (indirectas) | — | — | Avisos moderados; se arreglan con `npm audit fix`. |
| **functions/** `firebase-functions` | ^6.3.0 | 7.4.0 | Una versión mayor atrás. |
| **functions/** `firebase-admin` | ^13.0.0 | 14.5.0 | Una versión mayor atrás. |
| **functions/** runtime `nodejs20` | Node 20 | Node 22/24 | **Node 20 dejó de tener soporte en abril de 2026.** Google retira los runtimes viejos de Cloud Functions. |
| **functions/** sin `package-lock.json` | — | — | Cada `npm install` puede bajar versiones distintas. |
| `@angular/forms` | 22.1.5 | — | **No se usa** en ningún archivo: se puede sacar. |

`npm audit` (3/10/2026): 10 avisos (2 moderados, 6 altos, 2 críticos). `npm audit fix` **sin**
`--force` resuelve la mayoría actualizando Angular dentro de la versión 22.

### 4.4 Código duplicado

Duplicar no es "un pecado", pero cada copia es un lugar más donde un arreglo se puede olvidar.

| Qué se repite | Dónde | Propuesta |
|---|---|---|
| Quitar acentos y pasar a minúsculas (`normalize('NFD')...`) | `core/datos.ts` (`plano`), dos veces dentro de `buscar()` en `core/correlatividades.ts`, `core/visitas-clave.ts`, y en `tools/` tres veces más | Usar `plano()` en toda la app; en `tools/`, una sola copia exportada. |
| Año de una materia | `anioDe` en `core/datos.ts` y `anioDeMateria` + `ubicacion` en `paginas/grafo.ts` | Usar `anioDe` y `cuatrimestreDe`. |
| "Qué habilita cada materia" | `vincular()` en `core/correlatividades.ts` y `dependientes` dentro de `calcularLayout()` en `core/grafo.ts` | Que el layout reciba los `Vinculos`. |
| Abrir Firestore: `const [db, fs] = await Promise.all([this.nube.firestore(), import('firebase/firestore')])` | 16 veces | Un método en `Nube` que devuelva ambos. |
| Convertir la fecha de Firestore a `Date` (`toDate ? ... : ...`) | `core/novedades.ts`, `admin/novedades.ts`, `admin/contactos.ts` | Una función `aFecha()`. |
| "Si entrás por link, la carrera queda elegida" | `effect` igual en `paginas/carreras.ts` y `paginas/grafo.ts` | Hacerlo en el resolver de la ruta. |
| Cabecera con el logo del FEI, y la URL del FEI escrita a mano | `inicio.ts`, `horarios.ts`, `otras.ts` (la URL aparece 5 veces) | Un componente de cabecera y una constante `URL_FEI`. |
| Clave pública VAPID | `core/firebase-config.ts` y `functions/enviar.js` | Inevitable (son dos programas), pero que una prueba verifique que coinciden. |
| Límites del formulario (5–300 caracteres, etc.) | `core/contacto.ts` y `firestore.rules` | Inevitable; documentar que se cambian juntos y probar las reglas con el emulador. |
| Estilos (`header`, `.sub`, `.vacio`, `.boton`) | Casi todos los componentes | Clases globales en `styles.scss`. |
| `partirNombre` y el algoritmo del layout | `tools/nombres-mockup.mjs` y `tools/layout-grafo.mjs` copian `core/grafo.ts` (y ya se desincronizaron: otras medidas) | Que el mockup importe la versión de la app o borrar las copias. |
| Dos servidores estáticos | `tools/servir-dist.mjs` y `tools/mockup/serve.mjs` | Quedarse con `servir-dist.mjs`. |
| Dos interfaces llamadas `Nodo` con significados distintos | `core/explorar.ts` (árbol) y `core/grafo.ts` (tarjeta del mapa) | Renombrar una (por ejemplo `NodoArbol`). |

### 4.5 Código sin usar ("código muerto")

| Qué | Dónde |
|---|---|
| Componente `Icono` | `src/app/shared/ui.ts` |
| `usarCarrera()` | `src/app/shared/ui.ts` |
| `Aprobadas.limpiar()` | `src/app/shared/ui.ts` |
| `materiasDe()`, `nombreNivelCorto()` | `src/app/core/datos.ts` |
| `rutaSlug()` (y su comentario no corresponde) | `src/app/paginas/otras.ts` |
| Clase CSS `.pastilla` | `src/app/paginas/inicio.ts` |
| `camino()`, `alcance()`, `habilitadas()` | `src/app/core/correlatividades.ts`: sólo las usan las pruebas. Están a propósito, para una función futura (ver NOTAS). |
| Configuración "ng test" con Karma (puerto 9876) | `.vscode/launch.json`: el proyecto usa Vitest. |
| Comentario que apunta a `src/app/core/grafo/layout.ts`, que no existe | `tools/layout-grafo.mjs` |

### 4.6 Cosas sin terminar

- **La verificación automática (CI) no está activa.** `tools/ci/ci.yml` está listo pero no se movió
  a `.github/workflows/` (ver `tools/ci/LEEME.md`). Hoy nada impide subir un cambio que rompa las pruebas.
- **Configuración de Firebase Auth pendiente** según NOTAS (habilitar mail/contraseña, cerrar el
  registro, crear la colección `admins`). No se pudo comprobar desde acá.
- **Avisos al teléfono:** el envío es manual; no hay botón para **dejar de recibir** avisos (sólo
  bloquearlos en el navegador); la Cloud Function está escrita pero no desplegada.
- **Horarios:** sólo 3 de 24 carreras tienen grilla, y son del 2.º cuatrimestre de 2026.
- **Calendario:** `calendario/2026.json` llega hasta el 13 de marzo de 2027. El año está fijo en
  el código (`import calendario2026 ...` en `core/datos.ts`): para 2027 hay que crear el archivo
  y cambiar el import.
- **Datos con avisos conocidos:** Tecnologías Ferroviarias y Trabajo Social "sin cotejar"; Turismo
  sin 5.º cuatrimestre; Planificación Logística con una correlativa "42 a / 42 b" sin resolver.
- **Falta el logo de la Secretaría de Género del CESACO** (hay un comentario esperándolo en
  `src/app/shared/fei.ts`).
- **Contenido con fecha:** el banner de elecciones (14 al 17 de septiembre de 2026) ya pasó a su
  modo permanente; el contador de la ley tiene la fecha fija. Revisarlos cada tanto.
- **Formato:** 35 archivos no respetan el `.prettierrc` del propio proyecto.
- **TypeScript no está en modo estricto** (`"strict": true` no figura en `tsconfig.json`). Buena
  noticia: se probó compilar con `--strict` y **no aparece ningún error**, así que activarlo es gratis.
- **`package.json` sigue en versión `0.0.0`** y no hay registro de cambios.
- **Un archivo de 2,7 MB** (`tools/mockup/guia-unla-humanidades.html`) está en el repo: es un
  resultado generado, no código fuente.

### 4.7 Lo que está bien (para aprender de esto también)

- **Separación lógica / pantalla** (`core/` puro, `paginas/` delgadas) y **165 pruebas** que corren
  en menos de un segundo.
- **Reglas de Firestore pensadas** con el principio "todo cerrado salvo lo que se abre a propósito",
  y con la fecha puesta por el servidor (el cliente no puede mentir la hora).
- **Protección contra "inyección de fórmulas"** al exportar a Excel (`admin/csv.ts`): si alguien
  escribe `=HYPERLINK(...)` en el formulario, no se ejecuta al abrir el CSV. Muchos proyectos
  profesionales se olvidan de esto.
- **Accesibilidad:** etiquetas `aria-*`, foco con teclado en el mapa, tilde además del color para
  "aprobada", lista oculta para lectores de pantalla.
- **Comentarios que explican el porqué**, no el qué. Y una bitácora de decisiones (`NOTAS-PARA-LEON.md`).
- **Carga bajo demanda:** el paquete inicial pesa 91 kB comprimidos; Firebase (141 kB comprimidos)
  sólo baja cuando hace falta.
- **Validadores de datos** que no dejan publicar un plan roto.

---

## 5. Tareas de mantenimiento, por prioridad

Dificultad estimada: 🟢 fácil · 🟡 media · 🔴 difícil. Cada tarea entra en un pull request chico.

### Prioridad 1 — Urgente (afecta a usuarios o es un riesgo)

1. **Arreglar la CSP para que cargue la hoja de estilos** (4.1.1). 🟡
   `inlineCritical: false` en `angular.json` + resolver los dos scripts de Angular. Probar con el
   emulador de Hosting y revisar la consola del sitio publicado.
2. **Arreglar el ingreso y la salida del panel** (4.1.2). 🟢
   Usar `auth.authStateReady()` + `auth.currentUser` en las guardas; agregar una prueba.
3. **Poner límites a las escrituras públicas** (4.2.1). 🟡
   App Check con reCAPTCHA, dominios permitidos en `suscripciones`, alertas de uso.
4. **Actualizar dependencias con avisos de seguridad** (4.3). 🟢
   `npm audit fix` (sin `--force`), después `npm test` y `npm run build`.
5. **Documentar la versión de Node** (4.1.5). 🟢
   `"engines": { "node": "^22.22.3 || >=24.15.0" }` en `package.json`, un `.nvmrc` con `24` y una
   línea en el README.

### Prioridad 2 — Importante (este mes)

6. **Activar la verificación automática (CI)** y que el cotejo no pase en vacío (4.1.4, 4.6). 🟢
   Mover `ci.yml` a `.github/workflows/`, agregar `npx prettier --check .`.
7. **Arreglar el zoom del mapa al tocar una materia** (4.1.3). 🟢
8. **Decidir qué hacer con `functions/`** (4.3). 🟡
   Si se va a usar: runtime `nodejs22` (o más nuevo), actualizar `firebase-functions` y
   `firebase-admin`, agregar `package-lock.json`. Si no: sacar `functions` de `firebase.json` para
   que `firebase deploy` no falle, y dejar sólo el script manual.
9. **Respaldar los secretos y documentarlos** (4.2.3). 🟢
   `cuenta-servicio.json` y `vapid.json` en un gestor de contraseñas; agregar `vapid.json` a las
   NOTAS; restringir la `apiKey` por dominio.
10. **Preparar los datos de 2027** (4.6). 🟡
    Calendario 2027 antes de marzo, grillas del 1.er cuatrimestre. Sumar a `validar-datos.mjs` un aviso
    cuando al calendario le queden menos de 60 días.
11. **Manejo de errores en el panel** (4.1.7). 🟢

### Prioridad 3 — Mejoras (cuando haya tiempo)

12. **Quitar duplicados** (4.4): empezar por `plano()`, `anioDe`, el acceso a Firestore y la cabecera con el logo. 🟡
13. **Borrar el código muerto** (4.5). 🟢
14. **Activar `"strict": true`** en `tsconfig.json` y `"strictTemplates": true` en `angularCompilerOptions`. 🟢
15. **Aplicar Prettier a todo** en un commit que sólo haga eso (así el historial queda limpio). 🟢
16. **Calcular `correlativasDe` una sola vez** (4.1.8). 🟢
17. **Revisar qué descarga el service worker** y corregir el README (4.1.9). 🟡
18. **Alojar las fuentes en el propio sitio** (4.2.4). 🟢
19. **Ordenar `tools/`:** un solo servidor, corregir comentarios, sacar el HTML de 2,7 MB del repo. 🟢
20. **Botón "dejar de recibir avisos"** (4.6). 🟡
21. **Probar las reglas de Firestore** con el emulador y `@firebase/rules-unit-testing`. 🔴
22. **Pruebas de componentes** para las pantallas principales (hoy sólo se prueba la lógica). 🔴
23. **Arreglar el contador del botón "atrás"** (4.1.6). 🟢
24. **Sacar `@angular/forms`** de las dependencias. 🟢
25. **Versionar** (`package.json` deja el `0.0.0`) y llevar un `CHANGELOG.md`. 🟢

---

## 6. Qué conceptos aprender para entender este código

Ordenados como una ruta: cada paso se apoya en el anterior. Para cada uno, dónde verlo en este
proyecto.

### Paso 1 — La web por dentro

| Concepto | Dónde aparece | Para aprender |
|---|---|---|
| HTML semántico (`header`, `main`, `section`, `button` vs `a`) | Todas las plantillas | [MDN: HTML](https://developer.mozilla.org/es/docs/Learn/HTML) |
| CSS: *flexbox*, *grid*, *media queries*, variables (`--marca`) | `src/styles.scss`, los `styles:` de cada componente | [MDN: CSS](https://developer.mozilla.org/es/docs/Learn/CSS) |
| Modo claro/oscuro con `prefers-color-scheme` | `src/styles.scss` línea 63 | MDN |
| SVG: `viewBox`, `path`, coordenadas | `paginas/grafo.ts`, `paginas/otras.ts` (campus) | [MDN: SVG](https://developer.mozilla.org/es/docs/Web/SVG) |
| Accesibilidad (`aria-label`, `role`, foco con teclado) | `paginas/grafo.ts` | [web.dev/learn/accessibility](https://web.dev/learn/accessibility) |

### Paso 2 — JavaScript moderno

| Concepto | Dónde aparece |
|---|---|
| Funciones flecha, *destructuring* (`const [db, fs] = ...`), *spread* (`{ ...base }`) | En todos lados |
| `Map` y `Set` (en vez de objetos y arreglos para buscar rápido) | `core/correlatividades.ts` |
| `map`, `filter`, `reduce`, `some` | `core/explorar.ts`, `admin/visitas.ts` |
| Encadenamiento opcional `?.` y `??` / `??=` | `core/firebase.ts`, `core/planes.ts` |
| **Promesas y `async`/`await`** (clave para entender 4.1.2) | `core/firebase.ts`, `admin/sesion.ts` |
| Módulos (`import`/`export`) e **`import()` dinámico** (carga bajo demanda) | `core/datos.ts`, `app.routes.ts` |
| `localStorage` / `sessionStorage` y `try/catch` | `shared/ui.ts`, `core/visitas.ts` |
| Eventos de puntero (`pointerdown`, `pointermove`), *pinch-zoom* | `paginas/grafo.ts` (final del archivo) |

Recurso: [javascript.info](https://es.javascript.info/) (está en castellano).

### Paso 3 — TypeScript

| Concepto | Dónde aparece |
|---|---|
| `interface` y `type` | `core/datos.ts` (`Materia`, `Carrera`) |
| Tipos unión (`'mapa' \| 'lista'`) y tipos literales | `core/avisos.ts` (`EstadoAvisos`) |
| `readonly` y `ReadonlySet` (datos que no se modifican) | `core/correlatividades.ts` |
| Genéricos (`signal<string>`, `Promise<T>`) | `core/planes.ts` (`una<T>`) |
| *Type guards* (`(x): x is Materia => !!x`) | `core/correlatividades.ts` |
| `import type` (importar sólo el tipo, sin código) | `core/firebase.ts` |

Recurso: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

### Paso 4 — Angular

| Concepto | Dónde aparece |
|---|---|
| Componentes *standalone*: `@Component`, `template`, `styles`, `imports` | Cualquier archivo de `paginas/` |
| Sintaxis de plantillas: `@if`, `@for`, `@switch`, `{{ }}`, `[prop]`, `(evento)` | `paginas/inicio.ts` |
| **Signals:** `signal`, `computed`, `effect` (clave para entender 4.1.3) | `paginas/grafo.ts` |
| Servicios e **inyección de dependencias** (`@Injectable`, `inject()`) | `core/planes.ts`, `shared/ui.ts` |
| `input()` para pasar datos a un componente; `<ng-content>` para "huecos" | `shared/ui.ts` (`Atras`), `shared/contacto.ts` |
| Router: rutas, parámetros (`:slug`), *lazy loading*, *resolvers*, **guardas** | `app.routes.ts`, `core/planes.ts`, `admin/sesion.ts` |
| `afterNextRender` (código que sólo corre en el navegador) | `paginas/inicio.ts` |
| Pre-render (SSG) e hidratación | `app.routes.server.ts`, `app.config.ts` |

Recurso: [angular.dev/tutorials](https://angular.dev/tutorials) (el tutorial oficial usa signals).

### Paso 5 — La plataforma web avanzada

| Concepto | Dónde aparece |
|---|---|
| Service Worker y PWA (modo sin señal, instalar) | `ngsw-config.json`, `shared/instalar.ts` |
| Web Push y permisos del navegador | `core/avisos.ts` |
| Cabeceras HTTP de seguridad, en especial **CSP** (para entender 4.1.1) | `firebase.json` |
| Caché del navegador (`Cache-Control`, archivos con *hash* en el nombre) | `firebase.json` |

Recurso: [web.dev/learn/pwa](https://web.dev/learn/pwa) y [MDN: CSP](https://developer.mozilla.org/es/docs/Web/HTTP/CSP).

### Paso 6 — Firebase y el *backend*

| Concepto | Dónde aparece |
|---|---|
| Base de datos de documentos: colecciones, documentos, consultas, índices | `core/novedades.ts`, `firestore.indexes.json` |
| **Reglas de seguridad** (la seguridad vive en el servidor, nunca en el cliente) | `firestore.rules` |
| Autenticación y sesión | `admin/sesion.ts` |
| Funciones en la nube (*serverless*) y secretos | `functions/` |
| Cuotas, planes y abuso (*rate limiting*, App Check) | 4.2.1 |

Recurso: [documentación de Firebase](https://firebase.google.com/docs/firestore) (tiene versión en castellano).

### Paso 7 — Algoritmos (lo más lindo del proyecto)

El plan de estudios es un **grafo dirigido acíclico** (*DAG*): las materias son *nodos* y "es
correlativa de" son *aristas* que van en un solo sentido y nunca forman un círculo.

| Concepto | Dónde aparece |
|---|---|
| Grafos: nodos, aristas, lista de adyacencia | `vincular()` en `core/correlatividades.ts` |
| Recorrido en profundidad (DFS) con pila | `alcance()` y `calcularRama()` |
| Recorrido en anchura (BFS) con cola: camino más corto | `camino()` |
| Recursión y cómo evitar ciclos | `construirArbol()` en `core/explorar.ts` |
| Dibujo de grafos por capas (heurística de **Sugiyama** / baricentro) | `calcularLayout()` en `core/grafo.ts` |
| Complejidad (por qué 4.1.8 importa) | `paginas/carreras.ts` |

Recurso: cualquier curso introductorio de estructuras de datos; buscá "BFS DFS grafos".

### Paso 8 — Herramientas del oficio

| Concepto | Dónde aparece |
|---|---|
| Terminal y scripts de Node | `tools/*.mjs` |
| npm: dependencias, rangos (`^`, `~`), *lockfile*, `npm ci`, `npm audit` | `package.json` |
| **Pruebas unitarias**, funciones puras, *mocks* | `core/*.spec.ts` |
| Git: commits, ramas, *pull requests* | Este mismo PR |
| Integración continua (CI) | `tools/ci/ci.yml` |
| Formateadores y modo estricto | `.prettierrc`, `tsconfig.json` |
| Extraer datos de HTML (*scraping*) con expresiones regulares | `tools/extraer-plan.mjs` |

### Paso 9 — Seguridad básica

- Nunca confiar en el cliente: todo lo que la app valida, el servidor tiene que volver a validarlo
  (este proyecto lo hace con `firestore.rules`).
- Qué es un secreto y qué no (la `apiKey` de Firebase no lo es; la cuenta de servicio sí).
- Inyección de fórmulas en CSV, *path traversal*, abuso de formularios públicos.

Recurso: [OWASP Top 10](https://owasp.org/www-project-top-ten/).

---

## Glosario rápido

- **Build / compilar:** transformar el código fuente en los archivos que entiende el navegador.
- **Bundle / chunk:** el paquete de JavaScript resultante; un *chunk* es un pedazo que se baja aparte.
- **Deploy / publicar:** subir el build a un servidor para que esté en internet.
- **Dependencia:** una librería de otra persona que tu proyecto usa.
- **Lockfile:** el archivo que anota la versión exacta de cada dependencia instalada.
- **CI (integración continua):** un servidor que corre pruebas y build automáticamente en cada cambio.
- **SSG / pre-render:** generar el HTML de las páginas al compilar.
- **Hidratación:** cuando Angular "toma el control" de una página que ya vino armada en HTML.
- **PWA:** aplicación web que se instala y funciona sin conexión.
- **CSP:** cabecera que le dice al navegador de dónde puede cargar scripts, estilos e imágenes.
- **Función pura:** recibe datos y devuelve datos, sin efectos secundarios; siempre da el mismo resultado.
- **Guarda (guard):** función del router que decide si se puede entrar a una ruta.
- **Signal:** variable reactiva de Angular; la pantalla se actualiza sola cuando cambia.
