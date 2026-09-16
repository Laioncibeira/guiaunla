/**
 * Manda una novedad a todos los teléfonos suscriptos y limpia los buzones
 * que ya no existen (la persona desinstaló la app o revocó el permiso).
 * Lo usan la función de Firebase y el script local por igual.
 */
const webpush = require('web-push');

const VAPID_PUBLICA = 'BHpdZcD6hqRcjYFkBlvwIvrqYk6kdllt46aGnAQhnuk_laHg_9U6KbyhWAc8cnfsCm3xH86CUurW-vpIFCgElyI';

/**
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {{ titulo: string, cuerpo: string }} novedad
 * @param {string} vapidPrivada
 */
async function enviarNovedad(db, novedad, vapidPrivada) {
  webpush.setVapidDetails('mailto:cibeira.leon@gmail.com', VAPID_PUBLICA, vapidPrivada);

  // El formato que entiende el service worker de Angular (ngsw).
  const carga = JSON.stringify({
    notification: {
      title: novedad.titulo,
      body: (novedad.cuerpo || '').slice(0, 160),
      icon: 'https://guiaunla.web.app/icono-maskable.svg',
      badge: 'https://guiaunla.web.app/icono.svg',
      lang: 'es-AR',
      tag: 'novedad',
      data: { onActionClick: { default: { operation: 'navigateLastFocusedOrOpen', url: '/novedades' } } },
    },
  });

  const snap = await db.collection('suscripciones').get();
  let ok = 0;
  let borradas = 0;
  let fallidas = 0;
  for (const doc of snap.docs) {
    const s = doc.data();
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, carga, { TTL: 60 * 60 * 24 });
      ok++;
    } catch (e) {
      // 404 y 410: el buzón ya no existe. Se borra para no insistir.
      if (e.statusCode === 404 || e.statusCode === 410) {
        await doc.ref.delete();
        borradas++;
      } else {
        fallidas++;
        console.warn('no se pudo avisar a', doc.id, e.statusCode, e.body || e.message);
      }
    }
  }
  return { total: snap.size, ok, borradas, fallidas };
}

module.exports = { enviarNovedad, VAPID_PUBLICA };
