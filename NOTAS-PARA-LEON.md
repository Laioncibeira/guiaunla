# Notas de la noche del 8 de septiembre

Lo que decidí solo mientras dormías, con el porqué. Todo es reversible.

## Lo que quedó hecho

- Los planes de las cuatro carreras, extraídos de la web y **cotejados uno por uno** contra la
  tabla original. Audiovisión 58 materias, Diseño y Comunicación Visual 39, Diseño Industrial 32,
  Traductorado 39. Cero correlativas huérfanas.
- El mapa de correlatividades andando: se toca una materia, se destaca su camino, se busca por
  nombre o código, se puede marcar lo aprobado y recalcula qué podés cursar.
- Calendario académico 2026 con botón para agendar, esquema del campus con los 32 edificios,
  y las pantallas de Inicio y Carreras.
- 42 pruebas automáticas, build con 13 páginas pre-generadas, y la app instalable en el teléfono.
- El mockup en Claude Design, para que lo mires y lo cambies.

## Decisiones que tomé sin consultarte

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

## Lo que falta y necesita algo tuyo

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

## Cosas que dejé anotadas para más adelante

- El campus virtual es Moodle. Moodle exporta un calendario personal en formato `.ics` con una URL
  privada que el alumno copia sin dar su contraseña. Sería la forma limpia de traer entregas y
  fechas de cátedra en la v2, sin pedir credenciales de nadie.
- El motor de correlatividades ya sabe calcular el camino entre dos materias y todo lo que se
  destraba en cadena (`camino` y `alcance` en `src/app/core/correlatividades.ts`). No lo usa
  ninguna pantalla todavía; sirve para "¿qué me conviene cursar primero?" cuando lo quieras.
