/**
 * Sin acentos y en minúsculas, para buscar sin que importe cómo se escriba:
 * "Diseño" y "diseno" son lo mismo. NFD separa cada letra de su tilde y
 * `\p{Mn}` borra las tildes sueltas.
 */
export const plano = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
