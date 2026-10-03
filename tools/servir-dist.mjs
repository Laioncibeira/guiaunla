/**
 * Sirve dist/guiaunla/browser como lo hace Firebase Hosting: URLs limpias,
 * carpetas con index.html y todo lo demás a index.csr.html.
 * Uso: node tools/servir-dist.mjs [puerto]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve('dist/guiaunla/browser');
const puerto = Number(process.argv[2] ?? 5055);
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain' };

http
  .createServer((req, res) => {
    let url;
    try {
      url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
      return res.writeHead(400).end();
    }
    const candidatos = [url, url + '.html', path.join(url, 'index.html'), '/index.csr.html'];
    for (const c of candidatos) {
      const f = path.join(raiz, c);
      // Sólo archivos de adentro de dist: un "../" no puede leer el resto del disco.
      const adentro = f === raiz || f.startsWith(raiz + path.sep);
      if (adentro && fs.existsSync(f) && fs.statSync(f).isFile()) {
        res.writeHead(200, { 'content-type': tipos[path.extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
        fs.createReadStream(f).pipe(res);
        return;
      }
    }
    res.writeHead(404).end();
  })
  .listen(puerto, () => console.log(`dist en http://localhost:${puerto}`));
