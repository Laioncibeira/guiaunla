/**
 * Manda una novedad a todos los teléfonos suscriptos y limpia los buzones
 * que ya no existen (la persona desinstaló la app, revocó el permiso o tocó
 * "Dejar de recibir avisos"). Lo usan la función de Firebase y el script
 * local por igual.
 */
const webpush = require('web-push');

/** Tiene que ser la misma que src/app/core/firebase-config.ts (una prueba lo verifica). */
const VAPID_PUBLICA =
  'BHpdZcD6hqRcjYFkBlvwIvrqYk6kdllt46aGnAQhnuk_laHg_9U6KbyhWAc8cnfsCm3xH86CUurW-vpIFCgElyI';

/** A quién pueden escribirle los servicios de push si algo anda mal: el sitio. */
const VAPID_CONTACTO = 'https://guiaunla.web.app';

/** Cuántos avisos salen a la vez: rápido, sin abrir cientos de conexiones juntas. */
const DE_A = 25;

/**
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {{ titulo: string, cuerpo: string }} novedad
 * @param {string} vapidPrivada
 */
async function enviarNovedad(db, novedad, vapidPrivada) {
  webpush.setVapidDetails(VAPID_CONTACTO, VAPID_PUBLICA, vapidPrivada);

  // El formato que entiende el service worker de Angular (ngsw).
  const carga = JSON.stringify({
    notification: {
      title: novedad.titulo,
      body: (novedad.cuerpo || '').slice(0, 160),
      icon: 'https://guiaunla.web.app/icono-maskable.svg',
      badge: 'https://guiaunla.web.app/icono.svg',
      lang: 'es-AR',
      tag: 'novedad',
      data: {
        onActionClick: { default: { operation: 'navigateLastFocusedOrOpen', url: '/novedades' } },
      },
    },
  });

  const snap = await db.collection('suscripciones').get();
  const r = { total: snap.size, ok: 0, borradas: 0, fallidas: 0 };

  const avisar = async (doc) => {
    const s = doc.data();
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        carga,
        { TTL: 60 * 60 * 24 },
      );
      r.ok++;
    } catch (e) {
      // 404 y 410: el buzón ya no existe. Se borra para no insistir.
      if (e.statusCode === 404 || e.statusCode === 410) {
        await doc.ref.delete();
        r.borradas++;
      } else {
        r.fallidas++;
        console.warn('no se pudo avisar a', doc.id, e.statusCode, e.body || e.message);
      }
    }
  };

  for (let i = 0; i < snap.docs.length; i += DE_A)
    await Promise.all(snap.docs.slice(i, i + DE_A).map(avisar));
  return r;
}

module.exports = { enviarNovedad, VAPID_PUBLICA };
