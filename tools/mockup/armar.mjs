/**
 * Genera los artboards .dc.html del mockup de Claude Design.
 * Refleja la app publicada: mismos datos, mismos tokens, misma identidad.
 *
 * Uso:  node tools/mockup/armar.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { calcularLayout, curva, COLOR_NIVEL } from '../layout-grafo.mjs';
import { partirNombre } from '../nombres-mockup.mjs';

const SALIDA = 'tools/mockup/artboards';
fs.mkdirSync(SALIDA, { recursive: true });

const leer = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const av = leer('src/data/carreras/audiovision.json');
const carreras = [
  'audiovision',
  'diseno-y-comunicacion-visual',
  'diseno-industrial',
  'traductorado-publico-en-idioma-ingles',
].map((s) => leer(`src/data/carreras/${s}.json`));
const calendario = leer('src/data/calendario/2026.json');
const campus = leer('src/data/campus/edificios.json');

// ---------------------------------------------------------------- tokens
const FEI = {
  amarillo: '#ffa533',
  rojo: '#ff454c',
  violeta: '#9059b3',
  fondo: '#17151b',
  bordeFei: '#332e3a',
};

const T = {
  bg: '#141317',
  surface: '#1d1b21',
  surface2: '#26232b',
  border: '#35313c',
  brand: '#c77dff',
  onBrand: '#17141b',
  texto: '#f5f3f7',
  texto2: '#a79db0',
  texto3: '#8e8598',
  naranja: '#ffa552',
  verde: '#5fd39a',
  ...FEI,
};
const L = {
  bg: '#faf8fb',
  surface: '#ffffff',
  surface2: '#f2eff4',
  border: '#e2dde7',
  brand: '#7b3fb5',
  onBrand: '#ffffff',
  texto: '#191720',
  texto2: '#5d5568',
  texto3: '#6b6376',
  naranja: '#a85a12',
  verde: '#1f7a52',
  ...FEI,
};

const FUENTES =
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap">';

const base = (c) => `
    :host, body { margin: 0; }
    * { box-sizing: border-box; }
    .tel {
      width: 390px; height: 844px; overflow: hidden; position: relative;
      background: ${c.bg}; color: ${c.texto};
      font-family: Archivo, system-ui, sans-serif;
      font-size: 14px; line-height: 1.35; display: flex; flex-direction: column;
    }
    .mono { font-family: 'DM Mono', ui-monospace, monospace; }
    a { color: ${c.brand}; text-decoration: none; }
    a:hover { opacity: .85; }
    .cab { flex: none; padding: 14px 16px 10px; display: flex; align-items: center; gap: 10px; }
    .cab.linea { border-bottom: 1px solid ${c.border}; }
    .cab h1 { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
    .cab .sub { margin: 2px 0 0; font-size: 11.5px; color: ${c.texto2}; }
    .atras {
      width: 32px; height: 32px; flex: none; display: grid; place-items: center;
      border: 1px solid ${c.border}; border-radius: 9px; background: ${c.surface}; color: ${c.texto2};
    }
    .cuerpo { flex: 1; overflow: hidden; padding: 0 16px 8px; display: flex; flex-direction: column; gap: 12px; }
    .card { background: ${c.surface}; border: 1px solid ${c.border}; border-radius: 12px; padding: 13px 14px; }
    .rot { font-size: 10.5px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: ${c.texto3}; }
    .nav {
      flex: none; display: grid; grid-template-columns: repeat(5, 1fr);
      border-top: 1px solid ${c.border}; background: ${c.surface}; padding: 7px 4px 18px;
    }
    .nav div { display: flex; flex-direction: column; align-items: center; gap: 3px; color: ${c.texto3}; font-size: 9.5px; min-height: 48px; justify-content: center; }
    .nav div.on { color: ${c.brand}; }
    .nav svg { width: 21px; height: 21px; stroke: currentColor; fill: none; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    .hoja {
      flex: none; background: ${c.surface}; border-top: 1px solid ${c.border};
      border-radius: 18px 18px 0 0; padding: 10px 16px 14px; box-shadow: 0 -12px 28px rgba(0,0,0,.45);
    }
    .tirador { width: 38px; height: 4px; border-radius: 2px; background: ${c.border}; margin: 0 auto 12px; }
`;

const ICONOS = {
  inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
  carreras: '<path d="M4 5.5h16v13H4z"/><path d="M8 5.5v13M4 12h16"/>',
  horarios: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  mapa: '<path d="M9 3 3 5.5v15L9 18l6 2.5 6-2.5v-15L15 5.5 9 3z"/><path d="M9 3v15M15 5.5v15"/>',
  calendario: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
  buscar: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4 4"/>',
  flecha: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
};

const nav = (activo) =>
  `<nav class="nav">${[
    ['inicio', 'Inicio'],
    ['carreras', 'Carreras'],
    ['horarios', 'Horarios'],
    ['mapa', 'Campus'],
    ['calendario', 'Fechas'],
  ]
    .map(
      ([k, l]) =>
        `<div class="${k === activo ? 'on' : ''}"><svg viewBox="0 0 24 24">${ICONOS[k]}</svg><span>${l}</span></div>`,
    )
    .join('')}</nav>`;

const icono = (k, tam = 20) =>
  `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONOS[k]}</svg>`;

// ------------------------------------------------------------- identidad
/** La chispa de cuatro puntas del FEI. */
const estrella = (color, tam = 13) =>
  `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}" style="vertical-align:middle"><path d="M12 0.6C12.45 6.6 17.4 11.55 23.4 12C17.4 12.45 12.45 17.4 12 23.4C11.55 17.4 6.6 12.45 0.6 12C6.6 11.55 11.55 6.6 12 0.6Z" fill="${color}"/></svg>`;

const estrellas = (tam = 11) =>
  `<span style="display:inline-flex;align-items:center;gap:5px">${estrella(FEI.amarillo, tam)}${estrella(FEI.rojo, tam)}${estrella(FEI.violeta, tam)}</span>`;

/** El logo blanco, siempre sobre fondo oscuro. El archivo mide 560x278. */
const logoFei = (ancho = 120) =>
  `<img src="fei-logo.webp" alt="Frente de Estudiantes de Izquierda" style="display:block;width:${ancho}px;height:${Math.round((ancho * 278) / 560)}px">`;

const bannerElecciones = () => `
  <a style="flex:none;position:relative;display:block;overflow:hidden;padding:16px 16px 14px;border-radius:12px;background:${FEI.fondo};border:1px solid ${FEI.bordeFei};color:#f5f3f7">
    <div style="position:absolute;top:12px;right:14px;display:flex;align-items:flex-start;gap:7px">
      ${estrella(FEI.amarillo, 13)}<span style="margin-top:12px;display:flex">${estrella(FEI.rojo, 9)}</span><span style="margin-top:4px;display:flex">${estrella(FEI.violeta, 17)}</span>
    </div>
    <p style="margin:0;font-size:10.5px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;color:${FEI.amarillo}">Elecciones CEDHA 2026</p>
    <p style="margin:5px 0 0;font-size:20px;font-weight:700;letter-spacing:-.02em;line-height:1.15">14 al 17 de septiembre</p>
    <p style="margin:4px 0 0;font-size:11.5px;color:#b3a9bc">Faltan 6 días · votá en el Departamento</p>
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid ${FEI.bordeFei}">
      <span style="flex:none;padding:5px 10px;border-radius:999px;background:${FEI.violeta};color:#fff;font-size:11.5px;font-weight:700">Lista 7</span>
      ${logoFei(112)}
    </div>
  </a>`;

const firmaFei = () => `
  <a style="flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;padding:13px 16px 12px;border-radius:12px;background:${FEI.fondo};border:1px solid ${FEI.bordeFei};color:#a79db0;font-size:11.5px">
    ${estrellas(11)}
    <span>Hecha por estudiantes del</span>
    ${logoFei(132)}
  </a>`;

const avisoInstalar = (c) => `
  <div style="display:flex;align-items:center;gap:8px;margin:0 16px 14px;padding:11px 12px;border:1px solid ${c.border};border-radius:12px;background:${c.surface}">
    <div style="flex:1">
      <strong style="display:block;font-size:13.5px">Agregala a tu inicio</strong>
      <span style="display:block;font-size:11.5px;color:${c.texto2};margin-top:2px">Se abre sin barra del navegador y anda sin señal.</span>
    </div>
    <span style="flex:none;color:${c.texto3};font-size:20px;line-height:1;padding:0 6px">×</span>
  </div>`;

function artboard(nombre, cuerpo, c = T) {
  fs.writeFileSync(
    path.join(SALIDA, nombre),
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  ${FUENTES}
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>${base(c)}</style>
</helmet>
${cuerpo}
</x-dc>
</body>
</html>
`,
  );
}

// ---------------------------------------------------------------- grafo
const layout = calcularLayout(av, 4, 'tarjeta');

function svgGrafo(sel, c, opts = {}) {
  const pos = new Map(layout.nodos.map((n) => [n.codigo, n]));
  const necesita = new Set(sel ? (pos.get(sel)?.correlativas ?? []) : []);
  const habilita = new Set(sel ? layout.aristas.filter((a) => a.de === sel).map((a) => a.a) : []);
  const foco = (cod) => !sel || cod === sel || necesita.has(cod) || habilita.has(cod);

  const lineas = layout.aristas
    .map((a) => {
      const activa = sel && (a.de === sel || a.a === sel);
      const col = COLOR_NIVEL[(a.nivelDe - 1) % COLOR_NIVEL.length];
      return `<path d="${curva(pos.get(a.de), pos.get(a.a))}" fill="none" stroke="${col}" stroke-width="${activa ? 2.6 : 1.4}" opacity="${sel && !activa ? 0.04 : activa ? 1 : 0.4}"${activa ? ` marker-end="url(#punta${a.nivelDe})"` : ''}/>`;
    })
    .join('');

  const tarjetas = layout.nodos
    .map((n) => {
      const es = n.codigo === sel;
      const marcada = necesita.has(n.codigo) || habilita.has(n.codigo);
      const ac = COLOR_NIVEL[(n.nivel - 1) % COLOR_NIVEL.length];
      const texto = es ? c.onBrand : c.texto;
      const tenue = es ? c.onBrand : c.texto3;
      const filas = partirNombre(n.nombre)
        .map((l, i) => `<text x="${n.x + 12}" y="${n.y + 29 + i * 11}" font-family="Archivo, sans-serif" font-size="10" font-weight="600" fill="${texto}">${l}</text>`)
        .join('');
      return `<g opacity="${foco(n.codigo) ? 1 : 0.14}">
<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${es ? ac : c.surface}" stroke="${es || marcada ? ac : c.border}" stroke-width="${es || marcada ? 2.2 : 1.2}"/>
${es ? '' : `<rect x="${n.x}" y="${n.y + 10}" width="3.5" height="${n.h - 20}" rx="1.75" fill="${ac}"/>`}
<text x="${n.x + 12}" y="${n.y + 15}" font-family="'DM Mono', ui-monospace, monospace" font-size="8.5" letter-spacing="0.5" fill="${tenue}">${n.codigo}</text>
${filas}
</g>`;
    })
    .join('');

  const puntas = [1, 2, 3, 4, 5]
    .map((i) => `<marker id="punta${i}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="${COLOR_NIVEL[i - 1]}"/></marker>`)
    .join('');

  const v = opts.recorte ?? { x: 0, y: 0, w: layout.ancho, h: layout.alto };
  return `<svg viewBox="${v.x} ${v.y} ${v.w} ${v.h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><defs>${puntas}</defs>${lineas}${tarjetas}</svg>`;
}

const cabNiveles = (c, visibles = [1, 2]) =>
  `<div style="display:flex;gap:4px;padding:0 16px 6px">${Array.from({ length: layout.niveles }, (_, i) => `<div style="flex:1;text-align:center;font-size:9px;font-weight:600;color:${c.texto2};border-top:2px solid ${COLOR_NIVEL[i]};padding-top:5px;opacity:${visibles.includes(i + 1) ? 1 : 0.3}">${i + 1}° año</div>`).join('')}</div>`;

const cabGrafo = () => `
  <header class="cab linea">
    <div class="atras">${icono('flecha', 18)}</div>
    <div style="flex:1"><h1>Correlatividades</h1><p class="sub">Audiovisión · 58 materias</p></div>
  </header>`;

const buscador = (c, texto, activo = false) => `
  <div style="flex:none;padding:10px 16px 8px">
    <div style="display:flex;align-items:center;gap:9px;background:${c.surface};border:1px solid ${activo ? c.brand : c.border};border-radius:11px;padding:0 12px;min-height:44px;color:${activo ? c.brand : c.texto3}">
      <span style="flex:none;display:flex">${icono('buscar', 17)}</span>
      <span style="font-size:13.5px;flex:1;color:${activo ? c.texto : 'inherit'}">${texto}</span>
      ${activo ? `<span style="color:${c.texto3};font-size:20px;line-height:1">×</span>` : ''}
    </div>
  </div>`;

const chipsFiltro = () =>
  `<div style="display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 8px">${['Puedo cursar', 'Se dicta ahora', 'Aprobadas']
    .map(
      (t, i) => `<span style="min-height:36px;display:inline-flex;align-items:center;padding:0 12px;border-radius:999px;border:1px solid ${i === 0 ? T.brand : T.border};background:${i === 0 ? T.brand : T.surface};color:${i === 0 ? T.onBrand : T.texto2};font-size:11.5px;font-weight:600">${t}</span>`,
    )
    .join('')}</div>`;

const simBar = () => `
  <div style="flex:none;margin:0 16px 8px;padding:10px 12px;border:1px solid ${T.brand};border-radius:12px;background:${T.surface2}">
    <div style="display:flex;flex-wrap:wrap;gap:4px 14px;font-size:11.5px;color:${T.texto2}">
      <span><strong style="color:${T.texto}">1</strong> materia prendida</span>
      <span>Se habilitarían <strong style="color:${T.texto}">1</strong></span>
      <span>Avance <strong style="color:${T.texto}">0%</strong> → <strong style="color:${T.texto}">2%</strong></span>
    </div>
    <p style="margin:6px 0 0;font-size:10.5px;color:${T.texto2}">Se abren: Montaje 2</p>
  </div>`;

// 1. Grafo, vista cercana con tarjetas
const cerca = { x: 0, y: layout.nodos.filter((n) => n.nivel === 1).reduce((m, n) => Math.min(m, n.y), 1e9) - 14, w: 340, h: 470 };
artboard(
  'Main.dc.html',
  `<div class="tel">
  ${cabGrafo()}
  ${buscador(T, 'Buscar una materia')}
  ${simBar()}
  ${cabNiveles(T, [1, 2])}
  <div style="flex:1;overflow:hidden;padding:0 16px;position:relative;display:flex">
    <div style="border:1px solid ${T.border};border-radius:14px;background:${T.surface};width:100%;overflow:hidden">
      ${svgGrafo(null, T, { recorte: cerca })}
    </div>
    <div style="position:absolute;left:26px;bottom:22px;max-width:55%;background:${T.surface2};border:1px solid ${T.border};border-radius:999px;padding:8px 12px;font-size:10.5px;color:${T.texto2}">Tocá una materia para ver su camino</div>
    <div style="position:absolute;right:26px;bottom:22px;display:flex;gap:6px">
      <span style="min-width:40px;min-height:40px;display:grid;place-items:center;border-radius:10px;border:1px solid ${T.border};background:${T.surface2};font-size:18px">+</span>
      <span style="min-width:40px;min-height:40px;display:grid;place-items:center;border-radius:10px;border:1px solid ${T.border};background:${T.surface2};font-size:18px">−</span>
      <span style="min-height:40px;display:grid;place-items:center;padding:0 8px;border-radius:10px;border:1px solid ${T.border};background:${T.surface2};font-size:10.5px;font-weight:600">Ver todo</span>
    </div>
  </div>
  ${nav('carreras')}
</div>`,
);

// 2. Grafo con materia tocada
const sel = layout.nodos.find((n) => n.codigo === '16');
const necesitaSel = sel.correlativas.map((c) => av.materias.find((m) => m.codigo === c));
const habilitaSel = av.materias.filter((m) => m.correlativas.includes(sel.codigo));
const fila = (m, c) =>
  `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid ${c.border};min-height:44px">
     <span class="mono" style="font-size:10.5px;color:${c.texto3};min-width:22px">${m.codigo}</span>
     <span style="flex:1;font-size:13.5px">${m.nombre}</span>
   </div>`;
const recorteSel = {
  x: Math.max(0, sel.x + sel.w / 2 - 170),
  y: Math.max(0, sel.y + sel.h / 2 - 110),
  w: 340,
  h: 220,
};

artboard(
  'GrafoMateria.dc.html',
  `<div class="tel">
  ${cabGrafo()}
  ${cabNiveles(T, [2, 3])}
  <div style="flex:1;min-height:200px;overflow:hidden;padding:0 16px;display:flex">
    <div style="border:1px solid ${T.border};border-radius:14px;background:${T.surface};width:100%;overflow:hidden">
      ${svgGrafo('16', T, { recorte: recorteSel })}
    </div>
  </div>
  <section class="hoja">
    <div class="tirador"></div>
    <div style="display:flex;align-items:baseline;gap:9px">
      <span class="mono" style="font-size:11.5px;color:${T.brand}">16</span>
      <h2 style="margin:0;font-size:17px;font-weight:700;letter-spacing:-.01em">Realización Integral Audiovisual 1</h2>
    </div>
    <p style="margin:5px 0 12px;font-size:11.5px;color:${T.texto2}">2° año · Materia · cuatrimestral · 4 h semanales · se dicta este cuatrimestre</p>
    <div class="rot">Necesitás aprobar antes</div>
    ${necesitaSel.map((m) => fila(m, T)).join('')}
    <div class="rot" style="margin-top:12px">Te habilita</div>
    ${habilitaSel.map((m) => fila(m, T)).join('')}
    <button style="margin-top:14px;width:100%;min-height:46px;border-radius:11px;border:1px solid ${T.border};background:${T.surface2};color:${T.texto};font-family:inherit;font-size:13.5px;font-weight:600">Marcar como aprobada</button>
  </section>
  ${nav('carreras')}
</div>`,
);

// 3. Buscador
const resultados = av.materias.filter((m) => /taller/i.test(m.nombre)).slice(0, 6);
artboard(
  'GrafoBuscar.dc.html',
  `<div class="tel">
  ${cabGrafo()}
  ${buscador(T, 'taller', true)}
  <div style="flex:1;overflow:hidden;padding:0 16px">
    ${resultados
      .map(
        (m) => `<div style="display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid ${T.border};min-height:48px">
      <span style="width:3px;align-self:stretch;border-radius:2px;background:${COLOR_NIVEL[(m.nivel - 1) % COLOR_NIVEL.length]};flex:none"></span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13.5px;font-weight:500">${m.nombre}</div>
        <div style="font-size:10.5px;color:${T.texto3};margin-top:2px"><span class="mono">${m.codigo}</span> · ${m.nivel}° año</div>
      </div>
    </div>`,
      )
      .join('')}
    <div style="margin-top:14px;padding:12px 14px;border:1px dashed ${T.border};border-radius:12px;font-size:11.5px;color:${T.texto2}">Tocá una y el mapa se centra ahí, con su camino resaltado.</div>
  </div>
  ${nav('carreras')}
</div>`,
);

// 4. Inicio
const hoy = new Date('2026-09-08');
const proximas = calendario.eventos
  .filter((e) => new Date(e.hasta) >= hoy)
  .sort((a, b) => a.desde.localeCompare(b.desde))
  .slice(0, 2);
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fmt = (iso) => {
  const [, m, d] = iso.split('-').map(Number);
  return [String(d), MESES[m - 1]];
};
const dias = (iso) => Math.round((new Date(iso) - hoy) / 86400000);

const bienvenida = (c) => `
  <section style="flex:none;background:${c.surface};border:1px solid ${c.border};border-radius:12px;padding:16px;text-align:center">
    ${estrella(FEI.amarillo, 13)}
    <h2 style="margin:8px 0 0;font-size:15px;font-weight:700;letter-spacing:-.01em">Bienvenidx a la Guía UNLa</h2>
    <p style="margin:7px 0 12px;font-size:11.5px;color:${c.texto2};line-height:1.5">Un espacio que centraliza la información importante de cada carrera: materias, novedades, fechas del calendario académico y se vienen cositas.</p>
    <span style="display:inline-flex;align-items:center;min-height:44px;padding:0 24px;border-radius:999px;background:${c.brand};color:${c.onBrand};font-size:13.5px;font-weight:600">Tutorial</span>
  </section>`;

const tarjetaInicio = (c, titulo, pie, destacada = false) => `
  <div style="min-height:108px;display:flex;flex-direction:column;gap:6px;background:${destacada ? c.brand : c.surface};border:1px solid ${destacada ? c.brand : c.border};border-radius:12px;padding:14px;color:${destacada ? c.onBrand : c.texto}">
    <span style="font-size:15px;font-weight:700;line-height:1.2;letter-spacing:-.01em">${titulo}</span>
    <span style="font-size:11.5px;line-height:1.35;color:${destacada ? c.onBrand : c.texto2};opacity:${destacada ? 0.85 : 1}">${pie}</span>
  </div>`;

const inicio = (c) => `<div class="tel">
  <header class="cab" style="padding-top:18px">
    <div style="flex:1">
      <h1 style="font-size:22px">Guía UNLa ${estrella(FEI.violeta, 15)}</h1>
      <p class="sub">Humanidades y Artes</p>
    </div>
    <span style="flex:none;border:1px solid ${c.border};background:${c.surface};border-radius:999px;padding:8px 13px;font-size:11.5px;color:${c.texto2}">Audiovisión</span>
  </header>
  ${avisoInstalar(c)}
  <div class="cuerpo" style="gap:16px">
    ${bannerElecciones()}
    <section style="flex:none">
      <div class="rot" style="margin-bottom:8px">Tu carrera</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${tarjetaInicio(c, 'Mapa de correlatividades', 'Qué necesitás para cada materia', true)}
        ${tarjetaInicio(c, 'Plan de estudios', '58 materias, 5 años')}
        ${tarjetaInicio(c, 'Horarios y aulas', '62 clases este cuatrimestre')}
        ${tarjetaInicio(c, 'Mapa del campus', 'Cómo llegar a cada edificio')}
      </div>
    </section>
    ${bienvenida(c)}
  </div>
  ${nav('inicio')}
</div>`;

artboard('Inicio.dc.html', inicio(T));
artboard('InicioClaro.dc.html', inicio(L), L);

// 5. Carreras
artboard(
  'Carreras.dc.html',
  `<div class="tel">
  <header class="cab" style="padding-top:18px"><div><h1 style="font-size:22px">Carreras</h1><p class="sub">Departamento de Humanidades y Artes</p></div></header>
  <div class="cuerpo" style="gap:12px">
    ${carreras
      .map(
        (c, i) => `<div class="card" style="display:flex;gap:12px;align-items:center;min-height:68px">
      <span style="width:4px;align-self:stretch;border-radius:2px;background:${COLOR_NIVEL[i]};flex:none"></span>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:600;letter-spacing:-.01em">${c.nombreCorto}</div>
        <div style="font-size:11.5px;color:${T.texto2};margin-top:3px">${c.materias.length} materias · ${c.duracionAnios} años${c.tituloIntermedio ? ' · título intermedio' : ''}</div>
      </div>
      <span style="color:${T.texto3};transform:rotate(180deg);display:flex">${icono('flecha', 16)}</span>
    </div>`,
      )
      .join('')}
    ${firmaFei()}
  </div>
  ${nav('carreras')}
</div>`,
);

// 6. Detalle de carrera
artboard(
  'Carrera.dc.html',
  `<div class="tel">
  <header class="cab linea">
    <div class="atras">${icono('flecha', 18)}</div>
    <div style="flex:1"><h1 style="font-size:18px">Audiovisión</h1><p class="sub">58 materias · 5 años · 2880 h</p></div>
  </header>
  <div class="cuerpo" style="padding-top:12px;gap:11px">
    <div style="display:flex;align-items:center;gap:12px;background:${T.brand};border-radius:12px;padding:14px;color:${T.onBrand};min-height:66px">
      <div style="flex:1">
        <strong style="display:block;font-size:15px">Ver el mapa de correlatividades</strong>
        <small style="display:block;font-size:11.5px;opacity:.85;margin-top:3px">Todo el plan y sus caminos</small>
      </div>
      <span style="transform:rotate(180deg);display:flex">${icono('flecha', 18)}</span>
    </div>
    <div class="card" style="padding:12px 13px;font-size:11.5px;color:${T.texto2};line-height:1.45">
      Con las materias hasta 3° año obtenés el título de <span style="color:${T.texto};font-weight:600">Técnico/a Universitario en Audiovisión</span>.
    </div>
    <div style="flex:1;overflow:hidden">
      <div class="rot" style="margin-bottom:6px">Primer año</div>
      ${av.materias
        .filter((m) => m.nivel === 1)
        .slice(0, 7)
        .map(
          (m) => `<div style="display:flex;align-items:center;gap:11px;padding:9px 0;border-bottom:1px solid ${T.border};min-height:46px">
        <span class="mono" style="font-size:10.5px;color:${T.texto3};min-width:24px">${m.codigo}</span>
        <span style="flex:1;font-size:13.5px">${m.nombre}</span>
        <span style="font-size:10px;color:${T.texto3};white-space:nowrap">${m.horasSemanales} h</span>
      </div>`,
        )
        .join('')}
    </div>
  </div>
  ${nav('carreras')}
</div>`,
);

// 7. Horarios, con la grilla del Departamento
const horarios = leer('src/data/horarios/audiovision.json');
const nombreDeClase = (cl) =>
  av.materias.find((m) => m.codigo === cl.materiaCodigo)?.nombre ?? cl.materiaTexto;
const edificioDe = (u) => {
  if (u.virtual) return 'Virtual';
  const e = campus.edificios.find((x) => x.id === u.edificio);
  const nombre = e ? e.nombre.replace(/^Edificio\s+/, '') : '';
  if (!nombre) return u.aula ?? '';
  return nombre.toLowerCase().includes((u.aula ?? '').toLowerCase()) ? nombre : `${u.aula} · ${nombre}`;
};
const delDia = (dia, turno) =>
  horarios.clases.filter((cl) => cl.dia === dia && cl.turno === turno);
const CUENTA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'].map((d) => ({
  d,
  n: horarios.clases.filter((cl) => cl.dia === d).length,
}));

artboard(
  'Horarios.dc.html',
  `<div class="tel">
  <header class="cab" style="padding-top:18px"><div><h1 style="font-size:22px">Horarios</h1><p class="sub">Audiovisión · 2° cuatrimestre 2026</p></div></header>
  <div style="flex:none;display:flex;gap:5px;padding:0 16px 12px">
    ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      .map(
        (etiqueta, i) => `<div style="flex:1;min-height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:10px;border:1px solid ${i === 2 ? T.brand : T.border};background:${i === 2 ? T.brand : T.surface};color:${i === 2 ? T.onBrand : T.texto2};font-size:11.5px;font-weight:600">${etiqueta}<span style="font-size:9.5px;opacity:.75;font-weight:500">${CUENTA[i].n}</span></div>`,
      )
      .join('')}
  </div>
  <div class="cuerpo" style="gap:14px">
    ${['manana', 'tarde']
      .map(
        (turno) => `<section style="flex:none">
      <div class="rot" style="margin-bottom:8px">${turno === 'manana' ? 'Mañana' : 'Tarde'}</div>
      ${delDia('miercoles', turno)
        .slice(0, turno === 'manana' ? 3 : 2)
        .map(
          (cl) => `<div class="card" style="margin-bottom:8px">
        <div style="font-size:13.5px;font-weight:600;line-height:1.3">${nombreDeClase(cl)}${cl.fueraDePlan ? ` <span style="font-size:10.5px;font-weight:500;color:${T.naranja};border:1px solid ${T.naranja};border-radius:999px;padding:1px 7px">optativa o seminario</span>` : ''}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:9px">
          ${cl.ubicaciones
            .map(
              (u) => `<span style="display:inline-flex;align-items:center;gap:5px;min-height:34px;padding:0 10px;border:1px solid ${u.virtual ? T.verde : T.brand};border-radius:9px;font-size:11.5px;color:${u.virtual ? T.verde : T.brand}">${u.virtual ? '' : icono('mapa', 13)}${edificioDe(u)}</span>`,
            )
            .join('')}
        </div>
      </div>`,
        )
        .join('')}
    </section>`,
      )
      .join('')}
    <p style="margin:0;font-size:10.5px;color:${T.texto3};line-height:1.45">Grilla de aulas del Departamento de Humanidades y Artes, 2° cuatrimestre 2026.</p>
  </div>
  ${nav('horarios')}
</div>`,
);

// 8. Campus
const destacado = 'leopoldo-marechal';
const ed = campus.edificios.find((e) => e.id === destacado);
artboard(
  'Mapa.dc.html',
  `<div class="tel">
  <header class="cab" style="padding-top:18px"><div><h1 style="font-size:22px">Campus</h1><p class="sub">Predio 29 de Septiembre</p></div></header>
  <div style="flex:none;margin:0 16px;border:1px solid ${T.border};border-radius:14px;background:${T.surface};padding:8px">
    <svg viewBox="0 0 1440 760" width="100%" style="display:block;height:auto" font-family="Archivo, sans-serif">
      <rect width="1440" height="760" rx="10" fill="${T.surface2}"/>
      ${campus.edificios
        .map((e) => {
          const act = e.id === destacado;
          return `<g><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="6" fill="${act ? T.brand : e.verde ? T.verde : T.border}" stroke="${act ? T.brand : 'none'}" stroke-width="10" stroke-opacity=".25"/><text x="${e.x + e.w / 2}" y="${e.y + e.h / 2 + 7}" text-anchor="middle" font-size="20" font-weight="600" fill="${act ? T.onBrand : T.texto2}">${e.num}</text></g>`;
        })
        .join('')}
      ${campus.accesos.map((a) => `<circle cx="${a.x}" cy="${a.y}" r="13" fill="${T.naranja}"/>`).join('')}
      <text x="720" y="26" text-anchor="middle" font-size="19" fill="${T.texto3}">vías del ferrocarril Roca</text>
      <text x="720" y="750" text-anchor="middle" font-size="19" fill="${T.texto3}">Av. 29 de Septiembre</text>
    </svg>
  </div>
  <div style="flex:1;overflow:hidden;padding:12px 16px 0">
    ${campus.edificios
      .slice(0, 5)
      .map(
        (e) => `<div style="display:flex;align-items:center;gap:11px;min-height:46px;padding:8px 0;border-bottom:1px solid ${T.border}">
      <span style="flex:none;width:26px;height:26px;border-radius:7px;background:${e.id === destacado ? T.brand : T.surface2};color:${e.id === destacado ? T.onBrand : T.texto2};display:grid;place-items:center;font-size:11.5px;font-weight:600">${e.num}</span>
      <span style="flex:1;font-size:13.5px">${e.nombre}</span>
      ${e.aulas ? `<span style="flex:none;font-size:10.5px;color:${T.verde}">aulas</span>` : ''}
    </div>`,
      )
      .join('')}
  </div>
  <section class="hoja">
    <div class="tirador"></div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:30px;height:30px;border-radius:8px;background:${T.brand};color:${T.onBrand};display:grid;place-items:center;font-weight:700;font-size:13.5px;flex:none">4</div>
      <h2 style="margin:0;font-size:16.5px;font-weight:700">${ed.nombre}</h2>
    </div>
    <p style="margin:11px 0 0;font-size:13.5px;color:${T.texto2};line-height:1.5">${ed.comoLlegar}</p>
    <p style="margin:8px 0 0;font-size:11.5px;color:${T.verde}">Este edificio tiene aulas de cursada.</p>
    <div style="display:flex;align-items:center;justify-content:center;min-height:46px;margin-top:12px;border-radius:10px;background:${T.surface2};border:1px solid ${T.border};font-size:13.5px;font-weight:600">Cómo llegar a la UNLa</div>
  </section>
  ${nav('mapa')}
</div>`,
);

// 9. Fechas
const ETIQUETA = {
  inscripcion: 'Inscripción',
  examen: 'Finales',
  cursada: 'Cursada',
  receso: 'Receso',
  fecha: 'Fecha',
  ingreso: 'Ingreso',
};
const COLOR = {
  inscripcion: T.naranja,
  examen: T.brand,
  cursada: T.verde,
  receso: T.texto3,
  fecha: T.texto3,
  ingreso: T.verde,
};
artboard(
  'Calendario.dc.html',
  `<div class="tel">
  <header class="cab" style="padding-top:18px"><div><h1 style="font-size:22px">Fechas</h1><p class="sub">Calendario académico 2026</p></div></header>
  <div class="cuerpo" style="gap:9px">
    <div style="min-height:40px;display:inline-flex;align-items:center;align-self:flex-start;padding:0 12px;border-radius:999px;border:1px solid ${T.border};background:${T.surface};color:${T.texto2};font-size:11.5px">Ver también las que pasaron</div>
    ${calendario.eventos
      .filter((e) => new Date(e.hasta) >= hoy)
      .slice(0, 4)
      .map((e, i) => {
        const [d1, m1] = fmt(e.desde);
        const [d2, m2] = fmt(e.hasta);
        return `<div class="card" style="display:flex;gap:12px;align-items:flex-start">
      <div style="flex:none;width:3px;align-self:stretch;border-radius:2px;background:${COLOR[e.tipo]}"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:9.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:${COLOR[e.tipo]}">${ETIQUETA[e.tipo]}</div>
        <div style="font-size:13.5px;font-weight:600;margin-top:4px;line-height:1.25">${e.titulo}</div>
        <div class="mono" style="font-size:11.5px;color:${T.texto2};margin-top:5px">${d1} ${m1}${e.hasta !== e.desde ? ` → ${d2} ${m2}` : ''}</div>
      </div>
      ${i === 0 ? `<div style="flex:none;min-height:44px;display:flex;align-items:center;padding:0 11px;border-radius:9px;border:1px solid ${T.brand};color:${T.brand};font-size:11.5px;font-weight:600">Agendar</div>` : ''}
    </div>`;
      })
      .join('')}
    ${firmaFei()}
  </div>
  ${nav('calendario')}
</div>`,
);

// 10. Vista Lista: el explorador con la rama abierta
const etiqueta = (texto, color) =>
  `<span style="font-size:10.5px;color:${color};border:1px solid ${color};border-radius:999px;padding:2px 7px">${texto}</span>`;
const seDicta = new Set(horarios.clases.map((cl) => cl.materiaCodigo).filter(Boolean));
const porCodigo = new Map(av.materias.map((m) => [m.codigo, m]));
const elegida = porCodigo.get('16');
const necesitaDe = elegida.correlativas.map((c) => porCodigo.get(c));
const destrabaDe = av.materias.filter((m) => m.correlativas.includes('16'));

const mini = (m, sangria = 0) => `
  <li style="margin:4px 0;margin-left:${sangria}px">
    <div style="display:flex;align-items:flex-start;gap:6px">
      <span style="flex:none;width:14px;padding-top:11px;text-align:center;color:${T.texto3};font-size:11px">${(porCodigo.get(m.codigo)?.correlativas.length ?? 0) ? '▾' : '·'}</span>
      <span style="flex:1;display:flex;align-items:center;gap:8px;min-height:40px;padding:6px 10px;border:1px solid ${T.border};border-radius:9px;background:${T.surface}">
        <span class="mono" style="flex:none;font-size:10.5px;color:${T.texto3};min-width:24px">${m.codigo}</span>
        <span style="flex:1;font-size:11.5px;color:${T.texto}">${m.nombre}</span>
      </span>
    </div>
  </li>`;

const filaLista = (m, prendida = false, apagada = false) => `
  <div style="margin-bottom:7px">
    <div style="display:flex;align-items:flex-start;gap:6px">
      <span style="flex:none;width:14px;padding-top:12px;text-align:center;color:${T.texto3};font-size:11px;opacity:${apagada ? 0.4 : 1}">${prendida ? '▾' : (m.correlativas.length ? '▸' : '·')}</span>
      <div style="flex:1;min-width:0;background:${prendida ? 'color-mix(in oklab, ' + T.brand + ' 10%, ' + T.surface + ')' : apagada ? 'transparent' : T.surface};border:1px solid ${prendida ? T.brand : apagada ? '#2a2730' : T.border};border-radius:12px;padding:11px 12px">
        <div style="display:flex;gap:9px;align-items:baseline">
          <span class="mono" style="font-size:10.5px;color:${T.texto3};min-width:26px">${m.codigo}</span>
          <span style="flex:1;font-size:13.5px;font-weight:${apagada ? 500 : 600};color:${T.texto}">${m.nombre}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;opacity:${apagada ? 0.5 : 1}">
          ${m.dedicacion === 'anual' ? etiqueta('anual', T.naranja) : ''}
          ${seDicta.has(m.codigo) ? etiqueta('se dicta ahora', T.brand) : ''}
          ${etiqueta('podés cursarla', T.verde)}
        </div>
      </div>
    </div>
  </div>`;

artboard(
  'Lista.dc.html',
  `<div class="tel">
  <header class="cab linea">
    <div class="atras">${icono('flecha', 18)}</div>
    <div style="flex:1"><h1 style="font-size:17px">Correlatividades</h1><p class="sub">Audiovisión · 58 materias</p></div>
    <div style="flex:none;display:flex;border:1px solid ${T.border};border-radius:999px;background:${T.surface};padding:2px">
      <span style="min-height:34px;display:grid;place-items:center;padding:0 11px;border-radius:999px;color:${T.texto2};font-size:11.5px;font-weight:600">Mapa</span>
      <span style="min-height:34px;display:grid;place-items:center;padding:0 11px;border-radius:999px;background:${T.brand};color:${T.onBrand};font-size:11.5px;font-weight:600">Lista</span>
    </div>
  </header>
  ${buscador(T, 'Buscar una materia')}
  ${chipsFiltro()}
  ${simBar()}
  <div style="flex:1;overflow:hidden;padding:0 16px">
    <div style="margin:0 0 8px;padding-top:7px;border-top:2px solid ${COLOR_NIVEL[1]};font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:${T.texto2}">2° año</div>
    ${filaLista(porCodigo.get('11'), false, true)}
    <div style="margin-bottom:7px">
      <div style="display:flex;align-items:flex-start;gap:6px">
        <span style="flex:none;width:14px;padding-top:12px;text-align:center;color:${T.texto3};font-size:11px">▾</span>
        <div style="flex:1;min-width:0;background:color-mix(in oklab, ${T.brand} 10%, ${T.surface});border:1px solid ${T.brand};border-radius:12px;padding:11px 12px">
          <div style="display:flex;gap:9px;align-items:baseline">
            <span class="mono" style="font-size:10.5px;color:${T.texto3};min-width:26px">16</span>
            <span style="flex:1;font-size:13.5px;font-weight:600;color:${T.texto}">${elegida.nombre}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:7px">
            ${etiqueta('se dicta ahora', T.brand)}
          </div>
        </div>
      </div>
      <div style="margin:8px 0 0 20px">
        <span style="display:block;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${T.texto3};margin-bottom:4px">Necesita</span>
        <ul style="list-style:none;margin:0;padding:0 0 0 12px;border-left:1px solid ${T.border}">
          ${necesitaDe.map((m) => mini(m)).join('')}
        </ul>
      </div>
      <div style="margin:8px 0 0 20px">
        <span style="display:block;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${T.texto3};margin-bottom:4px">Destraba</span>
        <ul style="list-style:none;margin:0;padding:0 0 0 12px;border-left:1px solid color-mix(in oklab, ${T.verde} 50%, ${T.border})">
          ${destrabaDe.map((m) => mini(m)).join('')}
        </ul>
      </div>
    </div>
  </div>
  ${nav('carreras')}
</div>`,
);

// 11. Tutorial abierto sobre el inicio
artboard(
  'Tutorial.dc.html',
  `<div class="tel">
  <div style="position:absolute;inset:0;opacity:.35">${inicio(T)}</div>
  <div style="position:absolute;inset:0;background:rgba(0,0,0,.55)"></div>
  <section style="position:absolute;left:0;right:0;bottom:0;background:${T.surface};border-top:1px solid ${T.border};border-radius:18px 18px 0 0;padding:12px 16px 18px;box-shadow:0 -12px 28px rgba(0,0,0,.45);text-align:center">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:10.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:${T.texto3}">El mapa</span>
      <span style="font-size:11.5px;color:${T.texto2}">Saltar</span>
    </div>
    <div style="margin:8px auto 0;width:54px;height:54px;border-radius:15px;background:${T.surface2};display:grid;place-items:center;color:${FEI.amarillo}">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h5v4H6zM13 14h5v4h-5zM11 8h2v8h-2z"/></svg>
    </div>
    <h2 style="margin:12px 0 0;font-size:19px;font-weight:700;letter-spacing:-.02em">El mapa de correlatividades</h2>
    <p style="margin:7px 0 0;font-size:13.5px;color:${T.texto2};line-height:1.5">Cada tarjeta es una materia y cada línea va de lo que aprobás a lo que se te abre. Las columnas son los años.</p>
    <div style="display:flex;justify-content:center;gap:6px;margin:16px 0 12px">
      ${Array.from({ length: 8 }, (_, i) => `<span style="width:${i === 5 ? 18 : 6}px;height:6px;border-radius:${i === 5 ? '3px' : '50%'};background:${i === 5 ? T.brand : T.border}"></span>`).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <span style="flex:1;min-height:48px;display:grid;place-items:center;border-radius:12px;border:1px solid ${T.border};background:${T.surface2};font-size:13.5px;font-weight:600">Atrás</span>
      <span style="flex:1;min-height:48px;display:grid;place-items:center;border-radius:12px;border:1px solid ${T.brand};background:${T.brand};color:${T.onBrand};font-size:13.5px;font-weight:600">Siguiente</span>
    </div>
    <p style="margin:8px 0 0;font-size:10.5px;color:${T.texto3}">6 de 8</p>
  </section>
</div>`,
);

// ---------------------------------------------------------------- canvas
const F = { w: 390, h: 844 };
const col = (i) => 40 + i * (F.w + 90);
const filaY = (i) => 60 + i * (F.h + 170);
const canvas = {
  artboards: [
    { file: 'Inicio.dc.html', x: col(0), y: filaY(0), w: F.w, h: F.h },
    { file: 'Tutorial.dc.html', x: col(1), y: filaY(0), w: F.w, h: F.h, title: 'Tutorial' },
    { file: 'Carreras.dc.html', x: col(2), y: filaY(0), w: F.w, h: F.h },
    { file: 'Carrera.dc.html', x: col(3), y: filaY(0), w: F.w, h: F.h },
    { file: 'Main.dc.html', x: col(0), y: filaY(1), w: F.w, h: F.h, title: 'Grafo · tarjetas' },
    { file: 'GrafoMateria.dc.html', x: col(1), y: filaY(1), w: F.w, h: F.h, title: 'Grafo · materia tocada' },
    { file: 'GrafoBuscar.dc.html', x: col(2), y: filaY(1), w: F.w, h: F.h, title: 'Grafo · buscador' },
    { file: 'Lista.dc.html', x: col(3), y: filaY(1), w: F.w, h: F.h, title: 'Grafo · vista lista' },
    { file: 'Horarios.dc.html', x: col(0), y: filaY(2), w: F.w, h: F.h },
    { file: 'Mapa.dc.html', x: col(1), y: filaY(2), w: F.w, h: F.h, title: 'Campus' },
    { file: 'Calendario.dc.html', x: col(2), y: filaY(2), w: F.w, h: F.h, title: 'Fechas' },
    { file: 'InicioClaro.dc.html', x: col(3), y: filaY(2), w: F.w, h: F.h, title: 'Inicio · tema claro' },
  ],
  annotations: [
    {
      id: 'nota-flujo',
      x: 40,
      y: -80,
      w: 900,
      text: 'Guía UNLa · Humanidades y Artes, al día con lo publicado en guiaunla.web.app.\nArriba el recorrido de entrada. En el medio las cuatro caras del mapa de correlatividades. Abajo los horarios reales, el campus, las fechas y el tema claro.',
    },
    {
      id: 'nota-inicio',
      x: col(0),
      y: filaY(0) + F.h + 30,
      w: 860,
      text: 'El inicio ya no lista fechas: los cuatro accesos de "Tu carrera" ocupan ese lugar y se leen de un vistazo. Abajo, la bienvenida con el botón de Tutorial, que son ocho pasos: cinco explican los menúes y tres el mapa.',
    },
    {
      id: 'nota-grafo',
      x: col(0),
      y: filaY(1) + F.h + 30,
      w: 860,
      text: 'El mapa pasó de fichas con el código a tarjetas con el nombre completo. Arranca cerca, donde se lee, y el detalle sube o baja con el zoom. Al tocar una materia su camino queda al frente con punta de flecha. La franja de años se apaga para mostrar dónde estás parado, y quien prefiera texto tiene la vista Lista, con las materias por año y cuatrimestre.',
    },
    {
      id: 'nota-horarios',
      x: col(0),
      y: filaY(2) + F.h + 30,
      w: 860,
      text: 'Horarios ya tiene datos: 188 clases de la grilla del Departamento, por día y turno, con cada aula enlazada a su edificio en el mapa. Lo que no figura en el plan publicado se marca como optativa o seminario en vez de esconderse.',
    },
  ],
  launch: { view: 'canvas' },
};
fs.writeFileSync(path.join(SALIDA, 'canvas.json'), JSON.stringify(canvas, null, 2));

console.log('artboards en', SALIDA, '->', fs.readdirSync(SALIDA).join(', '));
