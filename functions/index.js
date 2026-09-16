/**
 * Función de Firebase: cuando una novedad pasa a publicada, avisa a todos
 * los teléfonos suscriptos. Corre sola; no hay que tocar nada desde el panel.
 *
 * Necesita el plan Blaze del proyecto y el secreto VAPID_PRIVADA:
 *   firebase functions:secrets:set VAPID_PRIVADA
 *   firebase deploy --only functions
 */
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { enviarNovedad } = require('./enviar');

initializeApp();
const VAPID_PRIVADA = defineSecret('VAPID_PRIVADA');

exports.avisarNovedad = onDocumentWritten(
  { document: 'novedades/{id}', region: 'southamerica-east1', secrets: [VAPID_PRIVADA] },
  async (evento) => {
    const antes = evento.data?.before?.data();
    const despues = evento.data?.after?.data();
    // Sólo cuando se publica: no al editar una ya publicada ni al despublicar.
    if (!despues || despues.publicada !== true || antes?.publicada === true) return;
    if (despues.avisada === true) return;
    const r = await enviarNovedad(getFirestore(), despues, VAPID_PRIVADA.value());
    await evento.data.after.ref.update({ avisada: true });
    console.log('novedad avisada', evento.params.id, r);
  },
);
