import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const raiz = process.argv[2] ?? '.';
const tipos = { '.html': 'text/html', '.svg': 'image/svg+xml', '.json': 'application/json', '.css': 'text/css', '.js': 'text/javascript' };
http.createServer((req, res) => {
  const p = path.join(raiz, decodeURIComponent(req.url.split('?')[0]));
  const f = fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, 'index.html') : p;
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'content-type': tipos[path.extname(f)] ?? 'application/octet-stream' });
  res.end(fs.readFileSync(f));
}).listen(4599, () => console.log('http://localhost:4599'));
