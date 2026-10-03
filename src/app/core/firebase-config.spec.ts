import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VAPID_PUBLICA } from './firebase-config';

describe('configuración de Firebase', () => {
  it('la clave VAPID pública de la app es la misma que usa quien manda los avisos', () => {
    // Si no coinciden, el navegador rechaza los avisos sin decir nada.
    const enviar = readFileSync(
      join(__dirname, '..', '..', '..', 'functions', 'enviar.js'),
      'utf8',
    );
    const clave = enviar.match(/const VAPID_PUBLICA =\s*'([^']+)'/)?.[1];
    expect(clave).toBe(VAPID_PUBLICA);
  });
});
