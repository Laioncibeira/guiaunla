/**
 * Genera los artboards .dc.html del mockup de Claude Design.
 * Refleja la app publicada: mismos datos, mismos tokens, misma identidad.
 *
 * Uso:  node tools/mockup/armar.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { calcularLayout, curva, COLOR_NIVEL } from '../layout-grafo.mjs';

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
const layout = calcularLayout(av, 4, 'ficha');

function svgGrafo(sel, c, opts = {}) {
  const pos = new Map(layout.nodos.map((n) => [n.codigo, n]));
  const necesita = new Set(sel ? (pos.get(sel)?.correlativas ?? []) : []);
  const habilita = new Set(sel ? layout.aristas.filter((a) => a.de === sel).map((a) => a.a) : []);
  const foco = (cod) => !sel || cod === sel || necesita.has(cod) || habilita.has(cod);

  const lineas = layout.aristas
    .map((a) => {
      const activa = sel && (a.de === sel || a.a === sel);
      const col = COLOR_NIVEL[(a.nivelDe - 1) % COLOR_NIVEL.length];
      return `<path d="${curva(pos.get(a.de), pos.get(a.a))}" fill="none" stroke="${col}" stroke-width="${activa ? 2 : 1}" opacity="${sel && !activa ? 0.05 : activa ? 1 : 0.34}"/>`;
    })
    .join('');

  const fichas = layout.nodos
    .map((n) => {
      const es = n.codigo === sel;
      const marcada = necesita.has(n.codigo) || habilita.has(n.codigo);
      const ac = COLOR_NIVEL[(n.nivel - 1) % COLOR_NIVEL.length];
      return `<g opacity="${foco(n.codigo) ? 1 : 0.16}">
<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="7" fill="${es ? ac : c.surface}" stroke="${es || marcada ? ac : c.border}" stroke-width="${es || marcada ? 1.8 : 1}"/>
<text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 + 3.6}" text-anchor="middle" font-family="'DM Mono', ui-monospace, monospace" font-size="11" font-weight="500" fill="${es ? c.onBrand : c.texto}">${n.codigo}</text>
</g>`;
    })
    .join('');

  if (opts.recorte) {
    const n = pos.get(opts.recorte.codigo);
    const [vw, vh] = [opts.recorte.w, opts.recorte.h];
    const tope = (v, max) => Math.max(0, Math.min(v, Math.max(0, max)));
    const vx = tope(n.x + n.w / 2 - vw / 2, layout.ancho - vw);
    const vy = tope(n.y + n.h / 2 - vh / 2, layout.alto - vh);
    return `<svg viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}">${lineas}${fichas}</svg>`;
  }
  const esc = opts.escala ?? 348 / layout.ancho;
  return `<svg viewBox="0 0 ${layout.ancho} ${layout.alto}" width="${layout.ancho * esc}" height="${layout.alto * esc}">${lineas}${fichas}</svg>`;
}

const cabNiveles = (c) =>
  `<div style="display:flex;gap:4px;padding:0 16px 6px">${Array.from({ length: layout.niveles }, (_, i) => `<div style="flex:1;text-align:center;font-size:9px;font-weight:600;color:${c.texto3};border-top:2px solid ${COLOR_NIVEL[i]};padding-top:5px">${i + 1}° año</div>`).join('')}</div>`;

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

// 1. Grafo completo
artboard(
  'Main.dc.html',
  `<div class="tel">
  ${cabGrafo()}
  ${buscador(T, 'Buscar una materia')}
  ${cabNiveles(T)}
  <div style="flex:1;overflow:hidden;padding:0 16px;position:relative;display:flex">
    <div style="border:1px solid ${T.border};border-radius:14px;background:${T.surface};padding:6px;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">
      ${svgGrafo(null, T, { escala: 470 / layout.alto })}
    </div>
    <div style="position:absolute;left:50%;transform:translateX(-50%);bottom:16px;background:${T.surface2};border:1px solid ${T.border};border-radius:999px;padding:8px 14px;font-size:11.5px;color:${T.texto2};white-space:nowrap">Tocá una materia · pellizcá para acercar</div>
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

artboard(
  'GrafoMateria.dc.html',
  `<div class="tel">
  ${cabGrafo()}
  ${cabNiveles(T)}
  <div style="flex:1;min-height:200px;overflow:hidden;padding:0 16px;display:flex">
    <div style="border:1px solid ${T.border};border-radius:14px;background:${T.surface};padding:6px;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">
      ${svgGrafo('16', T, { recorte: { codigo: '16', w: 344, h: 196 } })}
    </div>
  </div>
  <section class="hoja">
    <div class="tirador"></div>
    <div style="display:flex;align-items:baseline;gap:9px">
      <span class="mono" style="font-size:11.5px;color:${T.brand}">16</span>
      <h2 style="margin:0;font-size:17px;font-weight:700;letter-spacing:-.01em">Realización Integral Audiovisual 1</h2>
    </div>
    <p style="margin:5px 0 12px;font-size:11.5px;color:${T.texto2}">2° año · Materia · 4 h semanales · 64 h totales</p>
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

const inicio = (c) => `<div class="tel">
  <header class="cab" style="padding-top:18px">
    <div style="flex:1">
      <h1 style="font-size:22px">Guía UNLa ${estrella(FEI.violeta, 15)}</h1>
      <p class="sub">Humanidades y Artes</p>
    </div>
  </header>
  ${avisoInstalar(c)}
  <div class="cuerpo">
    ${bannerElecciones()}
    <section style="flex:none">
      <div class="rot" style="margin-bottom:7px">Lo que viene</div>
      ${proximas
        .map((e, i) => {
          const [d, mes] = fmt(e.desde);
          const faltan = dias(e.desde);
          return `<div class="card" style="margin-bottom:8px;display:flex;gap:12px;align-items:flex-start;border-color:${i === 0 ? c.naranja : c.border}">
        <div style="flex:none;text-align:center;min-width:44px">
          <div style="font-size:17px;font-weight:700;line-height:1.1;color:${i === 0 ? c.naranja : c.texto}">${d}</div>
          <div style="font-size:10px;color:${c.texto3};text-transform:uppercase;letter-spacing:.06em">${mes}</div>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13.5px;font-weight:600;line-height:1.25">${e.titulo}</div>
          <div style="font-size:11.5px;color:${c.texto2};margin-top:3px">${faltan < 0 ? 'En curso' : 'En ' + faltan + ' días'}${e.hasta !== e.desde ? ' · hasta el ' + fmt(e.hasta).join(' ') : ''}</div>
        </div>
      </div>`;
        })
        .join('')}
    </section>
    <section style="flex:none">
      <div class="rot" style="margin-bottom:7px">Tu carrera</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
        <div class="card" style="background:${c.brand};border-color:${c.brand};color:${c.onBrand};min-height:92px">
          <div style="font-size:14.5px;font-weight:700;line-height:1.2">Mapa de correlatividades</div>
          <div style="font-size:11.5px;margin-top:5px;opacity:.82">Qué necesitás para cada materia</div>
        </div>
        <div class="card" style="min-height:92px">
          <div style="font-size:14.5px;font-weight:700;line-height:1.2">Plan de estudios</div>
          <div style="font-size:11.5px;color:${c.texto2};margin-top:5px">58 materias, 5 años</div>
        </div>
      </div>
    </section>
    ${firmaFei()}
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

// 7. Horarios
artboard(
  'Horarios.dc.html',
  `<div class="tel">
  <header class="cab" style="padding-top:18px"><div><h1 style="font-size:22px">Horarios</h1><p class="sub">Audiovisión</p></div></header>
  <div class="cuerpo">
    <div style="background:${T.surface};border:1px dashed ${T.border};border-radius:12px;padding:16px">
      <h2 style="margin:0 0 8px;font-size:15px">Todavía no tenemos la grilla</h2>
      <p style="margin:0 0 12px;font-size:13.5px;color:${T.texto2};line-height:1.5">Los días, horarios y aulas los publica el Departamento al abrir cada cuatrimestre. Apenas nos pasen la planilla, esta pantalla muestra en qué edificio cursás cada materia y te lleva al mapa.</p>
      <p style="margin:0 0 8px;font-size:11.5px;color:${T.texto3}">Mientras tanto:</p>
      <div style="display:flex;align-items:center;justify-content:center;min-height:46px;margin-bottom:8px;border-radius:10px;background:${T.surface2};border:1px solid ${T.border};font-size:13.5px;font-weight:600">Ver el mapa del campus</div>
      <div style="display:flex;align-items:center;justify-content:center;min-height:46px;border-radius:10px;background:${T.surface2};border:1px solid ${T.border};font-size:13.5px;font-weight:600">Ver las fechas del cuatrimestre</div>
    </div>
    ${firmaFei()}
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

// ---------------------------------------------------------------- canvas
const F = { w: 390, h: 844 };
const col = (i) => 40 + i * (F.w + 90);
const filaY = (i) => 60 + i * (F.h + 170);
const canvas = {
  artboards: [
    { file: 'Inicio.dc.html', x: col(0), y: filaY(0), w: F.w, h: F.h },
    { file: 'Carreras.dc.html', x: col(1), y: filaY(0), w: F.w, h: F.h },
    { file: 'Carrera.dc.html', x: col(2), y: filaY(0), w: F.w, h: F.h },
    { file: 'Main.dc.html', x: col(3), y: filaY(0), w: F.w, h: F.h, title: 'Grafo · vista completa' },
    {
      file: 'GrafoMateria.dc.html',
      x: col(4),
      y: filaY(0),
      w: F.w,
      h: F.h,
      title: 'Grafo · materia tocada',
    },
    { file: 'GrafoBuscar.dc.html', x: col(5), y: filaY(0), w: F.w, h: F.h, title: 'Grafo · buscador' },
    { file: 'Horarios.dc.html', x: col(0), y: filaY(1), w: F.w, h: F.h },
    { file: 'Mapa.dc.html', x: col(1), y: filaY(1), w: F.w, h: F.h, title: 'Campus' },
    { file: 'Calendario.dc.html', x: col(2), y: filaY(1), w: F.w, h: F.h, title: 'Fechas' },
    { file: 'InicioClaro.dc.html', x: col(3), y: filaY(1), w: F.w, h: F.h, title: 'Inicio · tema claro' },
  ],
  annotations: [
    {
      id: 'nota-flujo',
      x: 40,
      y: -80,
      w: 900,
      text: 'Guía UNLa · Humanidades y Artes — al día con lo publicado en guiaunla.web.app.\nRecorrido de uso, todo a 390 px: Inicio → Carreras → Detalle → Mapa de correlatividades (tres estados). Abajo: Horarios, Campus, Fechas y el mismo Inicio en tema claro.',
    },
    {
      id: 'nota-fei',
      x: col(0),
      y: filaY(0) + F.h + 30,
      w: 860,
      text: 'La identidad del FEI aparece en tres lugares y no más: una chispa violeta al lado del título, el banner de las elecciones del CEDHA con el logo y la Lista 7, y la firma con las tres chispas al pie de cada pantalla de la barra. Los bloques del FEI van siempre sobre oscuro, también en tema claro, porque el logo es blanco.',
    },
    {
      id: 'nota-grafo',
      x: col(3),
      y: filaY(0) + F.h + 30,
      w: 860,
      text: 'El grafo es de verdad: 58 materias y 71 correlativas de Audiovisión, con las columnas ordenadas para que se crucen menos líneas. Al tocar una materia el mapa se acerca a ella, su camino queda al frente y la hoja de abajo lista qué necesita y qué habilita.',
    },
    {
      id: 'nota-barra',
      x: col(0),
      y: filaY(1) + F.h + 30,
      w: 860,
      text: 'La barra de abajo es fija y se ve siempre. Las pantallas con hoja inferior tienen alto acotado para que ningún botón quede tapado. El plano del campus toma su proporción real y debajo va la lista de los 32 edificios: en un teléfono vertical un plano apaisado solo no alcanza.',
    },
  ],
  launch: { view: 'canvas' },
};
fs.writeFileSync(path.join(SALIDA, 'canvas.json'), JSON.stringify(canvas, null, 2));

console.log('artboards en', SALIDA, '->', fs.readdirSync(SALIDA).join(', '));
