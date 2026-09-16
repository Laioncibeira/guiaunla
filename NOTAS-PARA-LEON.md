# Notas para Leon

Lo más nuevo arriba. Lo de abajo son las notas de las noches anteriores, que siguen valiendo.

## Segunda etapa (16 de septiembre): reloj, contacto, panel, 24 carreras

Está todo publicado en https://guiaunla.web.app. Lo que pediste, punto por punto:

- **Reloj del desfinanciamiento** en el Inicio, con tu texto y "Leer más..." sin link.
- **Formulario de contacto** debajo del reloj, con tu título, el textarea de 300 caracteres y el
  campo Contacto. Se guarda en Firestore y se exporta a Excel desde el panel. Quedó un espacio
  reservado para las firmas: **mandame las firmas en PNG** y las optimizo.
- **Banner de elecciones** debajo del contacto. Hasta el 17 muestra las fechas; después queda como
  bloque "Revolucionemos el CEDHA". **Mandame el logo en PNG** para ponerlo ahí.
- **Novedades** en el Inicio (las últimas tres, con "Ver todas"). Se escriben desde el panel.
- **Panel de administración** en https://guiaunla.web.app/admin: contactos (marcar leído, borrar,
  abrir/cerrar el formulario, exportar CSV), novedades (crear, editar, publicar, borrar) y visitas
  por pantalla y por día de los últimos 30 días. No aparece en la barra.
- **Tu carrera**: las 24 carreras de los cuatro departamentos (licenciaturas, tecnicaturas, la
  ingeniería y el traductorado; sin ciclos ni diplomaturas). Buscador arriba y los cuatro cuadrados
  de departamentos. Elegir la carrera vuelve a la pantalla desde la que se tocó "Cambiar".
- **Versión de escritorio**: desde 900 px la barra pasa a la izquierda y el mapa usa todo el alto.
- **Arreglos**: tocar una materia en el mapa anda con el dedo; la simulación dice "habilita
  directamente N" y explica lo que queda "a medias"; el filtro Aprobadas se fue y los otros se
  apagan de a uno; Diseño Industrial → Horarios dice "todavía no tenemos la grilla"; "atrás"
  vuelve a la pantalla anterior de verdad en todas las pantallas.

### Lo que necesito de vos (10 minutos en la consola de Firebase)

Sin esto el formulario ya funciona, pero **nadie puede entrar al panel**.

1. Entrá a https://console.firebase.google.com/project/guiaunla-51aa7/authentication y tocá
   **Comenzar**. En *Método de acceso* habilitá **Correo electrónico/contraseña** (sólo la
   primera opción, no "vínculo de correo").
2. En *Configuración* (pestaña de Authentication) → *Acciones del usuario*, **desactivá
   "Habilitar creación (registro)"**. Así nadie puede crearse una cuenta desde afuera.
3. En *Usuarios* → **Agregar usuario**: creá las dos o tres cuentas de la agrupación con mail y
   contraseña. Copiá el **UID** de cada una (la columna "Identificador de usuario").
4. Entrá a https://console.firebase.google.com/project/guiaunla-51aa7/firestore y creá la
   colección **`admins`**. Un documento por persona: el **ID del documento es el UID** que
   copiaste, y adentro un campo `email` (string) con su mail. Sin eso la cuenta entra pero ve
   "cuenta no habilitada".
5. Probá entrar en https://guiaunla.web.app/admin. Hay dos contactos de prueba míos: borralos
   desde ahí.

Para dar de baja a alguien: borrá su documento de `admins` (deja de ver el panel al instante) y,
si querés, la cuenta en Authentication.

### Cómo se usa el panel

- **Cerrar el formulario** (por ejemplo, después de las elecciones): pestaña Contactos →
  interruptor "Formulario abierto/cerrado". La app muestra "cerrado" a quien entre.
- **Exportar a Excel**: botón "Exportar a Excel (CSV)". Sale con separador `;` y acentos bien
  para el Excel en español; abrí el archivo con doble clic.
- **Novedades**: título, cuerpo y fecha; se publican con el interruptor. Las que no están
  publicadas no las ve nadie. La app las guarda para leerlas sin señal.
- **Visitas**: cuenta una vez por pantalla y por sesión, sin cookies ni datos de nadie. Es para
  saber qué se usa, no para auditar.

### Decisiones que tomé sin consultarte

**Los datos de las carreras siguen en el repo, no en una base de datos.** Un plan cambia una vez
cada varios años y hay que cotejarlo contra la web al cargarlo; una base de datos sólo sumaría
una forma de romperlo sin que nadie lo revise. Firestore quedó sólo para lo que sí cambia todos
los días: contactos, novedades y visitas.

**Cada carrera se baja cuando se mira.** Con 24 planes el bundle hubiera crecido a lo tonto; ahora
el índice (nombre, departamento, cantidades) entra en la app y el plan de cada una llega en un
archivo aparte, que el service worker guarda para el modo sin señal.

**La barra sigue con Horarios, Fechas y Campus además de Tu carrera.** Dijiste "todo por fuera de
inicio", y así es: el Inicio ya no tiene accesos. Pero "qué tengo hoy" es la acción más frecuente
y no merece dos toques, así que los atajos quedan abajo. Si preferís la barra con tres cosas, es
un cambio de una línea en `src/app/shared/ui.ts`.

**Tecnologías Ferroviarias y Trabajo Social quedaron marcadas "sin cotejar".** La primera se
publica como una lista sin códigos ni correlatividades (los números son nuestros); la segunda,
como un PDF. Las otras 22 pasaron el cotejo automático código por código.

**Tres avisos del validador que no son errores.** Turismo no publica el 5° cuatrimestre en la
web; Planificación Logística tiene una correlativa "42 a / 42 b" que la tabla no resuelve. Están
anotados en los JSON.

### Lo que falta y necesita algo tuyo

1. Los pasos de Firebase de arriba.
2. Las **firmas** y el **logo de Revolucionemos el CEDHA**, en PNG.
3. Confirmar los textos del bloque de contacto y de "Leer más..." viéndolos armados.
4. Las grillas de horarios de las carreras nuevas, cuando las publiquen los Departamentos.

---

## Notas de la noche del 8 de septiembre

Lo que decidí solo mientras dormías, con el porqué. Todo es reversible.

### Lo que quedó hecho

- Los planes de las cuatro carreras, extraídos de la web y **cotejados uno por uno** contra la
  tabla original. Audiovisión 58 materias, Diseño y Comunicación Visual 39, Diseño Industrial 32,
  Traductorado 39. Cero correlativas huérfanas.
- El mapa de correlatividades andando: se toca una materia, se destaca su camino, se busca por
  nombre o código, se puede marcar lo aprobado y recalcula qué podés cursar.
- Calendario académico 2026 con botón para agendar, esquema del campus con los 32 edificios,
  y las pantallas de Inicio y Carreras.
- 42 pruebas automáticas, build con 13 páginas pre-generadas, y la app instalable en el teléfono.
- El mockup en Claude Design, para que lo mires y lo cambies.

### Decisiones que tomé sin consultarte

**El grafo en el celular muestra sólo el código, no el nombre.** Probé con los nombres y a ancho de
pantalla quedaba ilegible: letras de 4 px. Con fichas de código entran las 58 materias de
Audiovisión de un vistazo y se leen bien. El nombre aparece al tocar y en el buscador. Si preferís
los nombres, hay que aceptar que se vea una parte del plan por vez y se navegue con zoom.

**Diseño Industrial se muestra como un plan común.** La web publica tres tablas, una por
orientación (maquinaria, textil, metales). Comparten códigos, correlativas y carga horaria: lo
único que cambia es el nombre de los talleres. Cargué el plan común y dejé las tres orientaciones
anotadas en la ficha de la carrera. Si querés las tres por separado, se puede, pero triplica el
mantenimiento por un cambio de nombre.

**Los dos seminarios del Traductorado no tienen código en la web.** Les puse S01 y S02, marcados
como `sinCodigoOficial`. Si el Departamento nos pasa los códigos reales, se cambian ahí.

**Horarios quedó como pantalla vacía honesta.** No inventé datos de ejemplo: dice que los publica
el Departamento, y ofrece ir al mapa o a las fechas mientras tanto. Cuando llegue la planilla,
falta escribir el importador y la grilla.

**El campus es un dibujo propio.** Saqué las posiciones del plano oficial, pero no copié su imagen:
está redibujado en SVG para que se pueda tocar y funcione en los dos temas. Dice explícitamente que
es orientativo y sin escala.

**Tipografía Archivo.** Es de Omnibus-Type, una fundición de Buenos Aires, y tiene carácter sin
llamar la atención. Los códigos van en DM Mono para que se alineen. Si no te convence, se cambian
en un solo lugar (`src/styles.scss`).

### Verla en tu teléfono ahora mismo, sin Firebase

```bash
npm install
npm run ver
```

Eso la sirve en la red local. En la terminal aparece una dirección tipo
`http://192.168.x.x:4200`: abrila desde el celular estando en la misma wifi.

### Lo que falta y necesita algo tuyo

1. **Firebase.** No pude publicar: la CLI no está instalada y el login es con tu cuenta de Google.
   Cuando puedas:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase projects:create guiaunla
   firebase deploy --only hosting
   ```
   Si el id `guiaunla` está tomado, creá el proyecto con otro id y después
   `firebase hosting:sites:create guiaunla`, que es lo que define el subdominio.

2. **La planilla de horarios y aulas del Departamento.** Es el único dato que no está en ninguna
   página pública.

3. **Mirá el mockup y cambiá lo que no te guste.** Los colores y tamaños del código salen de ahí,
   están todos en `src/styles.scss` y se cambian en un lugar.

4. **Revisá dos o tres materias contra tu propio plan.** El cotejo automático garantiza que no
   perdimos filas, pero no que la universidad tenga la tabla bien publicada.

### Lo que aclaró Leon sobre la grilla de aulas (9 de septiembre)

- **MUD es el Museo Universitario del Diseño**, y queda **fuera del predio**, junto con los
  talleres. Está cargado como lugar externo en `src/data/campus/edificios.json`: en Horarios sale
  como "MUD · fuera del predio" y no enlaza al mapa del campus, porque no está ahí.
- **Diseño y Comunicación Visual cambió de plan.** La web de la universidad ya publica el plan
  vigente, que es el que tiene la app. La grilla del Departamento todavía nombra materias del plan
  anterior, a veces con los dos nombres separados por barra ("Taller de diseño II / Diseño II").
  Por eso las clases que no cierran con el plan se marcan **"fuera del plan vigente"** y no
  "optativa": en esa carrera suelen ser del plan viejo, y en Audiovisión y Traductorado son
  optativas y seminarios. Cada JSON de horarios lo explica en su campo `nota`.

### Cosas que dejé anotadas para más adelante

- El campus virtual es Moodle. Moodle exporta un calendario personal en formato `.ics` con una URL
  privada que el alumno copia sin dar su contraseña. Sería la forma limpia de traer entregas y
  fechas de cátedra en la v2, sin pedir credenciales de nadie.
- El motor de correlatividades ya sabe calcular el camino entre dos materias y todo lo que se
  destraba en cadena (`camino` y `alcance` en `src/app/core/correlatividades.ts`). No lo usa
  ninguna pantalla todavía; sirve para "¿qué me conviene cursar primero?" cuando lo quieras.
