/** Igual que partirNombre de la app: el SVG no corta texto solo. */
export function partirNombre(nombre, porLinea = 20, lineas = 2) {
  const palabras = nombre.split(' ');
  const salida = [];
  let actual = '';
  for (const p of palabras) {
    const t = actual ? actual + ' ' + p : p;
    if (t.length <= porLinea) { actual = t; continue; }
    if (actual) salida.push(actual);
    actual = p;
    if (salida.length === lineas - 1) break;
  }
  if (salida.length < lineas && actual) salida.push(actual);
  const usado = salida.join(' ').length;
  if (usado < nombre.length - 1) {
    const resto = nombre.slice(salida.slice(0, -1).join(' ').length).trim();
    salida[salida.length - 1] = resto.length > porLinea ? resto.slice(0, porLinea - 1).trimEnd() + '…' : resto;
  }
  return salida;
}
