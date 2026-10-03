# Cambios

Lo más nuevo arriba. Las versiones siguen [SemVer](https://semver.org/lang/es/): el primer número
cambia si algo deja de funcionar como antes, el segundo con funciones nuevas y el tercero con
arreglos.

## 1.0.0 — octubre de 2026

Primera versión numerada: el mantenimiento que sale de `DIAGNOSTICO.md`.

### Arreglado

- La CSP bloqueaba la hoja de estilos global: en producción se perdían el tema claro, el diseño de
  escritorio y las reglas para pantallas chicas.
- El panel `/admin` no dejaba entrar ni salir sin recargar la página.
- En el mapa de correlatividades, tocar una materia cambiaba el zoom.
- El botón "atrás" podía sacarte de la app después de tocar una materia en el mapa.
- Las acciones del panel (marcar, borrar, publicar, abrir o cerrar el formulario) fallaban sin
  avisar.
- El plan de estudios no mostraba "habilita N" en las materias sin correlativas.
- El cotejo de planes decía "todo bien" sin haber comparado nada cuando faltaba la caché.

### Nuevo

- Botón "Dejar de recibir" para los avisos al teléfono.
- Las fuentes Archivo y DM Mono salen del propio sitio: andan sin señal y no le avisan a Google de
  cada visita.
- App Check listo para prender con una clave de reCAPTCHA.
- Verificación automática en GitHub (formato, pruebas, tipos, datos, build, CSP y reglas) y
  publicación automática al fusionar en `main`.
- Pruebas de las reglas de Firestore contra el emulador y de las guardas del panel.
- `npm run verificar`, `npm run publicar`, `npm run previa`, `npm run formato`.
- El validador avisa cuando el calendario o las grillas están por quedar viejos.

### Seguridad

- Dependencias al día: `npm audit` en 0 en la app y en `functions/`.
- Las suscripciones a avisos sólo aceptan servicios de push reales.
- `functions/` pasa a Node 22 (Node 20 quedó sin soporte) y deja de usar un mail personal.

### Por dentro

- TypeScript y plantillas en modo estricto; Prettier aplicado a todo el código.
- Menos duplicados (acceso a Firestore, búsqueda sin acentos, enlace al FEI, años de cursada) y
  fuera el código que no se usaba.
- Documentada la versión de Node (`.nvmrc`, `engines`).
