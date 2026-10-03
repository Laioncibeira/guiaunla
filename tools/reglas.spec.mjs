/**
 * Pruebas de firestore.rules contra el emulador de Firestore.
 *
 * Las reglas son la verdadera seguridad de la base: la app valida antes de
 * mandar, pero cualquiera puede hablarle a Firestore sin la app. Estas
 * pruebas confirman que las reglas aceptan lo que la app manda y rechazan lo
 * demás.
 *
 * Necesitan el emulador (y Java), así que no corren con `npm test`:
 *   npm run test:reglas
 */
import fs from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const hayEmulador = !!process.env.FIRESTORE_EMULATOR_HOST;
const ADMIN = 'uid-admin';
const hoy = () => new Date().toISOString().slice(0, 10);

describe.skipIf(!hayEmulador)('firestore.rules', () => {
  /** @type {import('@firebase/rules-unit-testing').RulesTestEnvironment} */
  let entorno;
  const anonimo = () => entorno.unauthenticatedContext().firestore();
  const admin = () => entorno.authenticatedContext(ADMIN).firestore();
  const otraCuenta = () => entorno.authenticatedContext('uid-cualquiera').firestore();
  /** Escribe datos de partida salteando las reglas. */
  const sembrar = (fn) => entorno.withSecurityRulesDisabled((ctx) => fn(ctx.firestore()));

  beforeAll(async () => {
    setLogLevel('error');
    entorno = await initializeTestEnvironment({
      projectId: 'demo-guiaunla',
      firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
    });
  });
  afterAll(() => entorno?.cleanup());
  beforeEach(async () => {
    await entorno.clearFirestore();
    await sembrar((db) => setDoc(doc(db, 'admins', ADMIN), { email: 'admin@fei.ar' }));
  });

  describe('contactos', () => {
    const mensaje = (extra = {}) => ({
      mensaje: 'Que haya más horarios de consulta',
      contacto: '@estudiante',
      ruta: 'inicio',
      creado: serverTimestamp(),
      ...extra,
    });

    it('cualquiera deja un mensaje válido', async () => {
      await assertSucceeds(addDoc(collection(anonimo(), 'contactos'), mensaje()));
      await assertSucceeds(addDoc(collection(anonimo(), 'contactos'), mensaje({ nombre: 'Ana' })));
    });

    it('rechaza mensajes cortos, largos, campos de más y fechas inventadas', async () => {
      const col = collection(anonimo(), 'contactos');
      await assertFails(addDoc(col, mensaje({ mensaje: 'hola' })));
      await assertFails(addDoc(col, mensaje({ mensaje: 'x'.repeat(301) })));
      await assertFails(addDoc(col, mensaje({ admin: true })));
      await assertFails(addDoc(col, mensaje({ creado: Timestamp.fromDate(new Date('2020-01-01')) })));
    });

    it('con el formulario cerrado no se puede escribir', async () => {
      await sembrar((db) => setDoc(doc(db, 'config', 'contacto'), { abierto: false }));
      await assertFails(addDoc(collection(anonimo(), 'contactos'), mensaje()));
    });

    it('sólo los admins leen, marcan y borran', async () => {
      await sembrar((db) => setDoc(doc(db, 'contactos', 'c1'), { ...mensaje(), creado: Timestamp.now() }));
      await assertFails(getDoc(doc(anonimo(), 'contactos', 'c1')));
      await assertFails(getDoc(doc(otraCuenta(), 'contactos', 'c1')));
      await assertSucceeds(getDoc(doc(admin(), 'contactos', 'c1')));
      await assertSucceeds(updateDoc(doc(admin(), 'contactos', 'c1'), { leido: true }));
      await assertFails(updateDoc(doc(admin(), 'contactos', 'c1'), { mensaje: 'otro texto' }));
      await assertSucceeds(deleteDoc(doc(admin(), 'contactos', 'c1')));
    });
  });

  describe('novedades', () => {
    const novedad = (publicada) => ({
      titulo: 'Inscripción a finales',
      cuerpo: 'Del 30 de noviembre al 1 de diciembre.',
      fecha: Timestamp.now(),
      publicada,
      creada: serverTimestamp(),
      actualizada: serverTimestamp(),
    });

    it('el público lista sólo las publicadas, y la consulta tiene que filtrarlas', async () => {
      await sembrar(async (db) => {
        await setDoc(doc(db, 'novedades', 'si'), { ...novedad(true), creada: Timestamp.now(), actualizada: Timestamp.now() });
        await setDoc(doc(db, 'novedades', 'no'), { ...novedad(false), creada: Timestamp.now(), actualizada: Timestamp.now() });
      });
      const col = collection(anonimo(), 'novedades');
      await assertSucceeds(getDocs(query(col, where('publicada', '==', true), orderBy('fecha', 'desc'), limit(50))));
      await assertFails(getDocs(col));
      await assertFails(getDoc(doc(anonimo(), 'novedades', 'no')));
      await assertSucceeds(getDocs(collection(admin(), 'novedades')));
    });

    it('sólo los admins escriben', async () => {
      await assertFails(addDoc(collection(anonimo(), 'novedades'), novedad(true)));
      await assertFails(addDoc(collection(otraCuenta(), 'novedades'), novedad(true)));
      await assertSucceeds(addDoc(collection(admin(), 'novedades'), novedad(true)));
    });
  });

  describe('suscripciones', () => {
    const buzon = (endpoint) => ({
      endpoint,
      p256dh: 'B'.repeat(87),
      auth: 'a'.repeat(22),
      carrera: 'audiovision',
      creada: serverTimestamp(),
    });

    it('acepta los servicios de push de los navegadores', async () => {
      const db = anonimo();
      for (const url of [
        'https://fcm.googleapis.com/fcm/send/abc:123',
        'https://updates.push.services.mozilla.com/wpush/v2/gAAAA',
        'https://web.push.apple.com/QGuQyavXutnMH',
        'https://wns2-par02p.notify.windows.com/w/?token=BQYAAA',
      ])
        await assertSucceeds(setDoc(doc(db, 'suscripciones', String(url.length)), buzon(url)));
    });

    it('rechaza cualquier otra dirección', async () => {
      const db = anonimo();
      for (const url of [
        'https://ejemplo.com/recibir',
        'http://fcm.googleapis.com/fcm/send/abc',
        'https://fcm.googleapis.com.ejemplo.com/x',
        'https://evil.com/?https://fcm.googleapis.com/x',
      ])
        await assertFails(setDoc(doc(db, 'suscripciones', 'x'), buzon(url)));
    });

    it('el público no puede leerlas', async () => {
      await sembrar((db) =>
        setDoc(doc(db, 'suscripciones', 's1'), { ...buzon('https://fcm.googleapis.com/x'), creada: Timestamp.now() }),
      );
      await assertFails(getDoc(doc(anonimo(), 'suscripciones', 's1')));
      await assertSucceeds(getDoc(doc(admin(), 'suscripciones', 's1')));
    });
  });

  describe('visitas', () => {
    it('suma de a uno sobre el día de hoy, nada más', async () => {
      const db = anonimo();
      const id = `${hoy()}_inicio`;
      await assertSucceeds(setDoc(doc(db, 'visitas', id), { dia: hoy(), ruta: 'inicio', n: increment(1) }, { merge: true }));
      await assertSucceeds(setDoc(doc(db, 'visitas', id), { dia: hoy(), ruta: 'inicio', n: increment(1) }, { merge: true }));
      await assertFails(setDoc(doc(db, 'visitas', id), { dia: hoy(), ruta: 'inicio', n: increment(5) }, { merge: true }));
      await assertFails(setDoc(doc(db, 'visitas', '2020-01-01_inicio'), { dia: '2020-01-01', ruta: 'inicio', n: 1 }));
      await assertFails(getDoc(doc(db, 'visitas', id)));
      await assertSucceeds(getDoc(doc(admin(), 'visitas', id)));
    });
  });

  describe('admins y el resto', () => {
    it('nadie se agrega a admins desde afuera', async () => {
      await assertFails(setDoc(doc(otraCuenta(), 'admins', 'uid-cualquiera'), { email: 'x@y.z' }));
      await assertSucceeds(getDoc(doc(admin(), 'admins', ADMIN)));
      await assertFails(getDoc(doc(otraCuenta(), 'admins', ADMIN)));
    });

    it('cualquier otra colección está cerrada', async () => {
      await assertFails(setDoc(doc(admin(), 'otra', 'x'), { a: 1 }));
      await assertFails(getDoc(doc(anonimo(), 'otra', 'x')));
    });
  });
});
