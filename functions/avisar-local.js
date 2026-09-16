/**
 * Manda a mano el aviso de una novedad ya publicada, sin Cloud Functions.
 *
 *   1. En la consola de Firebase: Configuración del proyecto → Cuentas de
 *      servicio → "Generar nueva clave privada". Guardá el JSON en
 *      tools/secretos/cuenta-servicio.json (esa carpeta no va al repo).
 *   2. cd functions && npm install
 *   3. npm run avisar -- <id de la novedad>
 */
const path = require('node:path');
const fs = require('node:fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { enviarNovedad } = require('./enviar');

const secretos = path.join(__dirname, '..', 'tools', 'secretos');
const cuenta = JSON.parse(fs.readFileSync(path.join(secretos, 'cuenta-servicio.json'), 'utf8'));
const vapid = JSON.parse(fs.readFileSync(path.join(secretos, 'vapid.json'), 'utf8'));
const id = process.argv[2];
if (!id) {
  console.error('Uso: npm run avisar -- <id de la novedad>');
  process.exit(1);
}

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
