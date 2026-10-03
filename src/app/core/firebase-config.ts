/**
 * Identificación pública del proyecto de Firebase.
 *
 * Nada de esto es un secreto: la apiKey sólo dice a qué proyecto va cada
 * llamada y aplica cuotas; no autoriza nada. Lo que protege los datos son las
 * reglas de Firestore (firestore.rules) y las cuentas de los admins.
 */
export const FIREBASE = {
  apiKey: 'AIzaSyCngbRSUoaQxBeW91I9R7ONkI8tnyL0f5w',
  authDomain: 'guiaunla-51aa7.firebaseapp.com',
  projectId: 'guiaunla-51aa7',
  appId: '1:470729497457:web:f4263d455ad66ff796f4d0',
} as const;

/**
 * Clave pública para los avisos al teléfono (Web Push). La privada la tiene
 * sólo quien manda los avisos. `functions/enviar.js` usa la misma: una prueba
 * verifica que coincidan.
 */
export const VAPID_PUBLICA =
  'BHpdZcD6hqRcjYFkBlvwIvrqYk6kdllt46aGnAQhnuk_laHg_9U6KbyhWAc8cnfsCm3xH86CUurW-vpIFCgElyI';

/**
 * Clave de sitio de reCAPTCHA v3 para Firebase App Check. También es pública.
 *
 * Con App Check, Firestore sólo acepta escrituras que vengan de esta app y no
 * de un script que copie la apiKey. Vacía, App Check queda apagado. Para
 * prenderlo: registrar el sitio en https://www.google.com/recaptcha/admin
 * (reCAPTCHA v3, dominio guiaunla.web.app), pegar acá la clave de sitio y
 * cargar la clave secreta en la consola de Firebase → App Check.
 */
export const APP_CHECK_CLAVE = '';
