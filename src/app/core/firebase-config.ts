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
