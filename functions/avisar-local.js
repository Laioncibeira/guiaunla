/**
 * Manda a mano el aviso de una novedad ya publicada, sin Cloud Functions.
 *
 *   1. En la consola de Firebase: Configuración del proyecto → Cuentas de
 *      servicio → "Generar nueva clave privada". Guardá el JSON en
 *      tools/secretos/cuenta-servicio.json (esa carpeta no va al repo).
 *   2. La clave VAPID privada va en tools/secretos/vapid.json, así:
 *        { "privada": "<la clave privada>" }
 *      Es la pareja de VAPID_PUBLICA. Si se pierde, los teléfonos ya
 *      suscriptos no pueden recibir más avisos: guardala en un gestor de
 *      contraseñas, igual que la cuenta de servicio.
 *   3. cd functions && npm ci
 *   4. npm run avisar -- <id de la novedad>
 */
const path = require('node:path');
const fs = require('node:fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { enviarNovedad } = require('./enviar');

const secretos = path.join(__dirname, '..', 'tools', 'secretos');
const id = process.argv[2];
if (!id) {
  console.error('Uso: npm run avisar -- <id de la novedad>');
  process.exit(1);
}

/** Lee un secreto y, si falta, explica qué archivo hace falta en vez de un error críptico. */
function secreto(nombre) {
  const ruta = path.join(secretos, nombre);
  if (!fs.existsSync(ruta)) {
    console.error(`Falta ${ruta}. Mirá las instrucciones al principio de functions/avisar-local.js.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}
const cuenta = secreto('cuenta-servicio.json');
const vapid = secreto('vapid.json');

initializeApp({ credential: cert(cuenta) });
const db = getFirestore();

db.collection('novedades')
  .doc(id)
  .get()
  .then(async (doc) => {
    if (!doc.exists) throw new Error('no existe la novedad ' + id);
    const n = doc.data();
    if (n.publicada !== true) throw new Error('la novedad no está publicada');
    const r = await enviarNovedad(db, n, vapid.privada);
    await doc.ref.update({ avisada: true });
    console.log('listo:', r);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
