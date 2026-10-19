const DATA = [
  {
    dia: 'Lunes',
    turno: 'Mañana',
    n: 19,
    texto:
      '*LUNES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMacedonio 11 - Comunicación\nMacedonio 11 - Estadística\nMacedonio 11 - Sistematización\nManso 8 - Seminario 2\n\n*Enfermería:*\nCarrica 1 - Adulto 2 (C)\nKirchner 9 - Materno 2 (A)\nMarechal 1 - Microbiología (A)\nMarechal 2 - Materno 1 (B)\nMarechal 3 - Salud mental (C)\nMarechal 4 - Salud comunitaria (B)\nMarechal 6 - Gestión (A)\n\n*Nutrición:*\nHernández 20 - Salud mental (D, Barcala)\nHernández 21 - FyQ Culinaria (A, Colombo)\nManso 2 - Anatomía (A, Ghirardi)\nManso 3 - Salud mental (B, Yanco)\nMarechal 7 - Bromatología 1 (B)\nMarechal 7 - TFI\nMarechal 9 - Desarrollo comunitario\nMarechal 10 - Gestión orgs salud',
  },
  {
    dia: 'Lunes',
    turno: 'Tarde',
    n: 8,
    texto:
      '*LUNES - TURNO TARDE*\n\n*Trabajo Social:*\nMacedonio 2 - Intro Cs. Sociales\n\n*Enfermería:*\nMacedonio 5 - Materno 2 (D)\nUgarte 1 - Materno 1 (D)\nUgarte 2 - Microbiología (E)\nUgarte 3 - Microbiología (F)\nUgarte 4 - Salud comunitaria (E)\nUgarte 7 - Gestión (B)\nSin aula - TFI',
  },
  {
    dia: 'Lunes',
    turno: 'Noche',
    n: 8,
    texto:
      '*LUNES - TURNO NOCHE*\n\n*Trabajo Social:*\nManso 1 - TS 2\nRemedios 1 - Seminario 4\nRemedios 4 - Seminario 3 (Padrón)\n\n*Nutrición:*\nHernández 1 - Fisiopato adulto\nHernández 1 - Núcleo\nMarechal 1 - Biofísica (C)\nMarechal 2 - Biofísica (E)\nMarechal 3 - FyQ Culinaria (C)',
  },
  {
    dia: 'Martes',
    turno: 'Mañana',
    n: 18,
    texto:
      '*MARTES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMacedonio 2 - Metodología 1\nMacedonio 3 - Epidemiología\nManso 8 - Legislación 2\n\n*Enfermería:*\nCarrica 3 - Adulto 2 (B)\nMarechal 1 - Salud mental (A)\nMarechal 2 - Materno 1 (B)\nMarechal 2 - Salud mental (B)\nMarechal 3 - Nutrición (C)\nMarechal 4 - Salud comunitaria (A)\nMarechal 5 - Salud comunitaria (C)\nMarechal 6 - Gestión (A)\n\n*Nutrición:*\nHernández 21 - Bromatología 1 (A)\nMarechal 7 - Educación alimentaria (B)\nMarechal 9 - Economía regional\nUgarte 8 - GASA\n\n*Trabajo Social / Nutrición:*\nHernández 20 - Sem. Sit. Prob. y… (Chianetta)\nManso 2 - Sem. Sit. Prob. y… (Davila)\nManso 3 - Sem. Sit. Prob. y… (Vilas)',
  },
  {
    dia: 'Martes',
    turno: 'Tarde',
    n: 7,
    texto:
      '*MARTES - TURNO TARDE*\n\n*Trabajo Social:*\nMacedonio 5 - TS 1\n\n*Enfermería:*\nUgarte 1 - Nutrición (D)\nUgarte 2 - Salud mental (E)\nUgarte 3 - Materno 1 (F)\nUgarte 4 - Salud comunitaria (D)\nUgarte 8 - Adulto 2 (E)\nUgarte 8 - Gestión (B)',
  },
  {
    dia: 'Martes',
    turno: 'Noche',
    n: 17,
    texto:
      '*MARTES - TURNO NOCHE*\n\n*Trabajo Social:*\nMacedonio 1 - Estadística\nMacedonio 2 - TS 1\nManso 3 - Metodología 1\nRemedios 1 - Comunicación\nRemedios 1 - Sistematización\nRemedios 4 - Epidemiología\n\n*Nutrición:*\nHernández 1 - Nutrición comunitaria\nMarechal 1 - Anatomía (C)\nMarechal 2 - Anatomía (E)\nMarechal 3 - Anatomía (F)\nMarechal 4 - Educación alimentaria (C)\nMarechal 4 - FyQ Culinaria (F)\nMarechal 7 - Desarrollo comunitario\nUgarte 9 - Gestión orgs salud\n\n*Ciclo Ed. Física:*\nCarrica - Todas\nCarrica - Todas\nCarrica - Todas',
  },
  {
    dia: 'Miércoles',
    turno: 'Mañana',
    n: 20,
    texto:
      '*MIÉRCOLES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMarechal 9 - Seminario 3\nUgarte 8 - TS 1\nUgarte 9 - TS 2\n\n*Enfermería:*\nCarrica 2 - Adulto 2 (A)\nCarrica 3 - Materno 2 (B)\nMarechal 1 - Materno 1 (A)\nMarechal 2 - Nutrición (B)\nMarechal 3 - Materno 1 (C)\nMarechal 3 - Salud colectiva (C)\nMarechal 5 - Salud comunitaria (C)\nMarechal 6 - Gestión (A)\nSin aula - Taller integrador (A)\n\n*Nutrición:*\nHernández 20 - Anatomía (D, Ghirardi)\nHernández 21 - Ética / Microbiología (A)\nManso 2 - Nutrición 1 (A, Pelatelli)\nManso 3 - Biofísica (B, Amiano)\nManso 8 - Fisiopato adulto\nMarechal 7 - Nutrición 3 (B)\nMarechal 7 - TFI\nUgarte 8 - Núcleo',
  },
  {
    dia: 'Miércoles',
    turno: 'Tarde',
    n: 10,
    texto:
      '*MIÉRCOLES - TURNO TARDE*\n\n*Trabajo Social:*\nMacedonio 4 - Estado y Política\n\n*Enfermería:*\nUgarte 1 - Microbiología (D)\nUgarte 2 - Materno 1 (E)\nUgarte 3 - Materno 1 (F)\nUgarte 3 - Nutrición (F)\nUgarte 4 - Adulto 2 (D)\nUgarte 7 - Gestión (B)\nUgarte 8 - Adulto 2 (E)\nUgarte 8 - Educación y salud (E)\nSin aula - TFI',
  },
  {
    dia: 'Miércoles',
    turno: 'Noche',
    n: 13,
    texto:
      '*MIÉRCOLES - TURNO NOCHE*\n\n*Trabajo Social:*\nMacedonio 5 - Evaluación\nMarechal 10 - TFI\nRemedios 1 - Seminario 3 (Carbone)\n\n*Nutrición:*\nHernández 1 - Epidemiología 1 (E)\nMarechal 3 - Nutrición 3 (C)\nMarechal 5 - Epidemiología 1 (C)\nMarechal 6 - FyQ Culinaria (E)\nMarechal 6 - GASA\n\n*Trabajo Social / Nutrición:*\nMarechal 1 - Sem. Sit. Prob. y… (Davila)\nMarechal 2 - Sem. Sit. Prob. y… (Pereyra)\n\n*Ciclo Ed. Física:*\nCarrica - Todas\nCarrica - Todas\nCarrica - Todas',
  },
  {
    dia: 'Jueves',
    turno: 'Mañana',
    n: 18,
    texto:
      '*JUEVES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMacedonio 2 - Estado y Política\nMacedonio 5 - Seminario 4\nMacedonio 11 - TFI\n\n*Enfermería:*\nCarrica 3 - Adulto 2 (B)\nCarrica 3 - Educación y salud (B)\nMacedonio 1 - Materno 2 (C)\nMarechal 1 - Nutrición (A)\nMarechal 2 - Microbiología (B)\nMarechal 3 - Microbiología (C)\nMarechal 4 - Salud comunitaria (A)\nMarechal 6 - Investigación (C)\n\n*Nutrición:*\nHernández 20 - Biofísica (D, Amiano)\nHernández 21 - Fisiopato niño\nManso 2 - Biofísica (A, Amiano)\nManso 3 - Anatomía (Gagliano)\nManso 8 - Epidemiología 1\nMarechal 7 - FyQ Culinaria (B, Monerais)\nMarechal 9 - Nutrición 3 (A)',
  },
  {
    dia: 'Jueves',
    turno: 'Tarde',
    n: 8,
    texto:
      '*JUEVES - TURNO TARDE*\n\n*Enfermería:*\nKirchner 6 - Materno 2 (E)\nKirchner 7 - Investigación (D)\nKirchner 8 - Investigación (B)\nUgarte 1 - Salud colectiva (D)\nUgarte 2 - Nutrición (E)\nUgarte 3 - Salud mental (F)\nUgarte 4 - Salud comunitaria (D)\n\n*Trabajo Social / Nutrición:*\nMacedonio 2 - Sem. Sit. Prob. y… (Miguel)',
  },
  {
    dia: 'Jueves',
    turno: 'Noche',
    n: 10,
    texto:
      '*JUEVES - TURNO NOCHE*\n\n*Trabajo Social:*\nHernández 19 - Teoría Social 1\nMacedonio 1 - Estado y Política\nManso 8 - Antropología\nRemedios 1 - Legislación 2\n\n*Nutrición:*\nHernández 1 - Fisiopato niño\nMarechal 1 - Nutrición 1 (C)\nMarechal 2 - Nutrición 1 (E)\nMarechal 3 - Bromatología 1 (C)\nMarechal 6 - Economía regional\nMarechal 7 - Metodología',
  },
  {
    dia: 'Viernes',
    turno: 'Mañana',
    n: 21,
    texto:
      '*VIERNES - TURNO MAÑANA*\n\n*Trabajo Social:*\nMacedonio 10 - Evaluación\nMacedonio 11 - Antropología\nMacedonio 11 - Teoría Social 1\nMarechal 7 - Historia latinoamericana\n\n*Enfermería:*\nCarrica 1 - Adulto 2 (C)\nCarrica 1 - Educación y salud (C)\nCarrica 2 - Adulto 2 (A)\nFernández 1 - Educación y salud (A)\nFernández 2 - Investigación (A)\nMarechal 1 - Salud colectiva (A)\nMarechal 2 - Salud colectiva (B)\nMarechal 3 - Materno 1 (C)\nMarechal 4 - Salud comunitaria (B)\nSin aula - Taller integrador (A)\n\n*Nutrición:*\nHernández 20 - Nutrición 1 (D, Yedvab)\nHernández 21 - Educación alimentaria (A)\nManso 2 - Salud mental (A, Rubel)\nManso 3 - Nutrición 1 (B, Lenze)\nManso 8 - Técnica dieto 2\nMarechal 9 - Ética / Microbiología (B)\nUgarte 8 - Núcleo',
  },
  {
    dia: 'Viernes',
    turno: 'Tarde',
    n: 8,
    texto:
      '*VIERNES - TURNO TARDE*\n\n*Enfermería:*\nUgarte 1 - Materno 1 (D)\nUgarte 1 - Salud mental (D)\nUgarte 2 - Materno 1 (E)\nUgarte 2 - Salud colectiva (E)\nUgarte 3 - Salud colectiva (F)\nUgarte 4 - Adulto 2 (D)\nUgarte 4 - Educación y salud (D)\nUgarte 4 - Salud comunitaria (E)',
  },
  {
    dia: 'Viernes',
    turno: 'Noche',
    n: 9,
    texto:
      '*VIERNES - TURNO NOCHE*\n\n*Trabajo Social:*\nMacedonio 1 - Promoción\nMacedonio 2 - Historia latinoamericana\nMacedonio 5 - Abordajes\nManso 8 - Seminario 2\n\n*Nutrición:*\nHernández 1 - Núcleo\nHernández 1 - Técnica dieto 2\nMarechal 1 - Salud mental (C)\nMarechal 2 - Salud mental (E)\nMarechal 3 - Ética / Microbiología (C)',
  },
  {
    dia: 'Sábado',
    turno: 'Mañana',
    n: 2,
    texto: '*SÁBADO - TURNO MAÑANA*\n\n*Trabajo Social:*\nManso 1 - Abordajes\nManso 8 - Promoción',
  },
  {
    dia: 'Sábado',
    turno: 'Día completo',
    n: 3,
    texto:
      '*SÁBADO - DÍA COMPLETO*\n\n*Ciclo Trabajo Social:*\nSin aula - 3 materias (8 a 14 hs)\nSin aula - 3 materias (8 a 17 hs)\nSin aula - 3 materias (8 a 17 hs)',
  },
  {
    dia: 'Solo prácticas',
    turno: 'Mañana',
    n: 1,
    texto: '*SOLO PRÁCTICAS - TURNO MAÑANA*\n\n*Enfermería:*\nSolo prácticas - Cuidado crítico (A)',
  },
  {
    dia: 'Solo prácticas',
    turno: 'Tarde',
    n: 1,
    texto: '*SOLO PRÁCTICAS - TURNO TARDE*\n\n*Enfermería:*\nSolo prácticas - Cuidado crítico (B)',
  },
];
const DIAS = [...new Set(DATA.map((d) => d.dia))];
const $days = document.getElementById('days'),
  $day = document.getElementById('day');
let current;
try {
  current = localStorage.getItem('delegados.dia');
} catch (e) {}
if (!DIAS.includes(current)) current = DIAS[0];

function esc(s) {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
}
function wa(s) {
  return esc(s).replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
}

async function copiar(texto, btn, label) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(texto);
    ok = true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.className = 'fallback';
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    try {
      ok = document.execCommand('copy');
    } catch (e2) {}
    ta.remove();
  }
  btn.textContent = ok ? '¡Copiado!' : 'No se pudo';
  btn.classList.toggle('done', ok);
  setTimeout(() => {
    btn.textContent = label;
    btn.classList.remove('done');
  }, 1800);
}

function renderDays() {
  $days.innerHTML = '';
  DIAS.forEach((d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = d;
    b.id = 'dia-' + d;
    b.setAttribute('aria-pressed', d === current);
    b.onclick = () => {
      current = d;
      try {
        localStorage.setItem('delegados.dia', d);
      } catch (e) {}
      renderDays();
      renderDay();
    };
    $days.appendChild(b);
  });
}
function renderDay() {
  const items = DATA.filter((x) => x.dia === current);
  const total = items.reduce((a, x) => a + x.n, 0);
  $day.innerHTML = `<div class="dayhead"><h2>${esc(current)}</h2>
    <button class="dayall" type="button" id="copy-dia">Copiar el día completo (${total})</button></div><div class="list"></div>`;
  const list = $day.querySelector('.list');
  items.forEach((x, i) => {
    const c = document.createElement('article');
    c.className = 'card';
    c.innerHTML = `<div class="cardhead"><div><h3>${x.turno === 'Día completo' ? 'Día completo' : 'Turno ' + esc(x.turno)}</h3>
      <span class="count">${x.n} cursada${x.n === 1 ? '' : 's'}</span></div>
      <button class="copy" type="button" id="copy-${i}">Copiar</button></div>
      <div class="preview">${wa(x.texto)}</div>`;
    c.querySelector('.copy').onclick = (e) => copiar(x.texto, e.currentTarget, 'Copiar');
    list.appendChild(c);
  });
  const lbl = `Copiar el día completo (${total})`;
  document.getElementById('copy-dia').onclick = (e) =>
    copiar(items.map((x) => x.texto).join('\n\n\n'), e.currentTarget, lbl);
}
renderDays();
renderDay();

// ---- Mapa ----
const B = [
  // n, nombre, x,y,w,h, etiqueta corta en el mapa, voto, usado en cursadas
  [1, 'Edificio José Hernández', 600, 53, 400, 50, 'Hernández', 'CEDEPYT', 1],
  [24, 'Aula Magna Ana Jaramillo', 600, 105, 400, 42, 'Aula Magna', 0, 0],
  [8, 'Edificio Hernández Arregui', 1045, 53, 45, 29, '', 0, 0],
  [30, 'Gimnasio Universitario Gatica', 1100, 53, 62, 29, '', 0, 0],
  [32, 'Quincho Roberto Fontanarrosa', 1172, 53, 53, 29, '', 0, 0],
  [26, 'Escuela Judicial Manuel Dorrego', 1285, 137, 100, 31, '', 0, 0],
  [23, 'Buffet', 663, 177, 107, 28, 'Buffet', 0, 0],
  [28, 'Estudio de Grabación Enrique Discépolo', 788, 177, 107, 28, '', 0, 0],
  [13, 'Edificio Lola Mora', 948, 177, 50, 28, '', 0, 0],
  [10, 'Edificio Juana Azurduy', 510, 215, 65, 28, '', 0, 0],
  [4, 'Edificio Leopoldo Marechal', 285, 220, 165, 45, 'Marechal', 0, 1],
  [17, 'Edificio Rodolfo Ortega Peña', 325, 280, 85, 28, '', 0, 0],
  [9, 'Edificio Homero Manzi', 310, 330, 95, 35, '', 0, 0],
  [3, 'Edificio Juana Manso', 615, 300, 155, 35, 'Manso', 'CEPyPP', 1],
  [16, 'Edificio Paco Urondo', 783, 245, 39, 28, '', 0, 0],
  [21, 'Vestidores del Campo de Deportes', 933, 245, 57, 28, '', 0, 0],
  [25, 'Escuela de Gobierno Néstor Kirchner', 815, 305, 55, 45, 'Kirchner', 0, 1],
  [20, 'Campo de Deportes Delfo Cabrera', 908, 285, 100, 140, '', 0, 0],
  [5, 'Edificio Manuel Ugarte', 253, 395, 152, 40, 'Ugarte', 0, 1],
  [18, 'Edificio Irma Laciar de Carrica', 933, 445, 52, 40, 'Carrica', 0, 1],
  [2, 'Edificio Arturo Jauretche', 250, 468, 155, 40, 'Jauretche', 'CESACO', 0],
  [29, 'Radio UNLa', 503, 498, 70, 27, '', 0, 0],
  [15, 'Edificio María Remedios del Valle', 813, 528, 72, 50, 'Remedios', 0, 1],
  [11, 'Edificio Leonardo Werthein', 930, 528, 58, 50, '', 0, 0],
  [6, 'Edificio Raúl Scalabrini Ortiz', 130, 553, 180, 52, '', 0, 0],
  [14, 'Edificio Macedonio Fernández', 135, 625, 165, 30, 'Macedonio', 0, 1],
  [22, 'Casa del Estudiante Claudia Falcone', 470, 595, 40, 33, '', 0, 0],
  [12, 'Edificio Lisandro de la Torre', 385, 625, 63, 30, '', 0, 0],
  [7, 'Edificio Héctor Oesterheld', 700, 665, 55, 30, '', 0, 0],
  [31, 'Jardín Maternal Azucena Villaflor', 768, 650, 50, 35, '', 0, 0],
  [27, 'Laboratorio Oscar Varsavsky', 930, 635, 58, 50, '', 0, 0],
  [19, 'Cine Universitario Tita Merello', 600, 682, 58, 33, '', 0, 0],
];
const ENTRADAS = [
  {
    x: 997,
    y: 38,
    t: 'Entrada Ferrocarril',
    d: 'Por las vías del Roca, en la punta del Hernández',
    lx: 1022,
    ly: 30,
    anchor: 'start',
  },
  {
    x: 79,
    y: 445,
    t: 'Entrada Malabia y Alsina',
    d: 'Lado oeste del predio',
    lx: 24,
    ly: 392,
    anchor: 'start',
  },
  {
    x: 486,
    y: 744,
    t: 'Entrada 29 de Septiembre',
    d: 'Sobre la Av. 29 de Septiembre',
    lx: 452,
    ly: 752,
    anchor: 'end',
  },
];
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  parent && parent.appendChild(e);
  return e;
}
const $map = document.getElementById('map'),
  $info = document.getElementById('info'),
  $blist = document.getElementById('blist');
const nodes = {};
function select(n) {
  Object.values(nodes).forEach((g) => g.classList.remove('sel'));
  const b = B.find((x) => x[0] === n);
  if (!b) return;
  nodes[n].classList.add('sel');
  $info.innerHTML =
    `<strong>${n}. ${esc(b[1])}</strong>` +
    (b[7]
      ? ` · <span style="color:var(--vote-strong);font-weight:700">Se vota ${b[7]}</span>`
      : '');
}
function drawMap() {
  el('rect', { x: 0, y: 0, width: 1440, height: 790, rx: 10, fill: 'var(--ground)' }, $map);
  el(
    'text',
    { x: 720, y: 24, 'text-anchor': 'middle', 'font-size': 18, class: 'street' },
    $map,
    'vías del ferrocarril Roca',
  );
  el(
    'line',
    {
      x1: 20,
      y1: 42,
      x2: 1420,
      y2: 42,
      stroke: 'var(--line)',
      'stroke-width': 3,
      'stroke-dasharray': '14 8',
    },
    $map,
  );
  el(
    'text',
    { x: 760, y: 778, 'text-anchor': 'middle', 'font-size': 18, class: 'street' },
    $map,
    'Av. 29 de Septiembre',
  );
  B.forEach((b) => {
    const [n, name, x, y, w, h, short, vote, used] = b;
    const g = el(
      'g',
      {
        class: 'bld' + (vote ? ' vote' : used ? ' used' : ''),
        tabindex: 0,
        role: 'button',
        'aria-label': name + (vote ? ', se vota ' + vote : ''),
      },
      $map,
    );
    el('title', {}, g, n + '. ' + name);
    el('rect', { x, y, width: w, height: h, rx: 6 }, g);
    let label = String(n),
      fs = 18;
    if (short) {
      label = n + ' · ' + short;
      fs = Math.min(18, (w - 8) / (label.length * 0.6));
      if (fs < 12) {
        label = short;
        fs = Math.min(16, (w - 6) / (label.length * 0.6));
      }
      if (fs < 10) {
        label = String(n);
        fs = 18;
      }
    }
    if (n === 1) {
      label = '1 · Hernández · Se vota CEDEPYT';
      fs = 19;
    }
    el(
      'text',
      {
        x: x + w / 2,
        y: y + h / 2 + fs * 0.36,
        'text-anchor': 'middle',
        'font-size': fs.toFixed(1),
      },
      g,
      label,
    );
    g.addEventListener('click', () => select(n));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(n);
      }
    });
    nodes[n] = g;
  });
  // carteles de votación
  const tags = {
    1: { x: 800, y: 152, anchor: 'middle' },
    3: { x: 692, y: 342, anchor: 'middle' },
    2: { x: 327, y: 515, anchor: 'middle' },
  };
  // el cartel del Hernández va dentro del mismo edificio (ancho), los otros debajo
  B.filter((b) => b[7] && b[0] !== 1).forEach((b) => {
    const [n, , x, y, w, h] = b;
    const txt = 'Se vota ' + b[7];
    const fs = 17,
      tw = txt.length * fs * 0.56 + 22,
      cx = x + w / 2;
    let ty = n === 1 ? y + h + 4 + 44 : y + h + 6;
    if (n === 1) {
      ty = y - 4 - 30;
    } // arriba del Hernández no hay lugar, va a la derecha
    const g = el('g', { class: 'votetag' }, $map);
    if (n === 1) {
      el('rect', { x: x + w - tw - 8, y: y + 10, width: tw, height: 30, rx: 15 }, g);
      el(
        'text',
        { x: x + w - 8 - tw / 2, y: y + 31, 'text-anchor': 'middle', 'font-size': fs },
        g,
        txt,
      );
    } else {
      el('rect', { x: cx - tw / 2, y: ty, width: tw, height: 30, rx: 15 }, g);
      el('text', { x: cx, y: ty + 21, 'text-anchor': 'middle', 'font-size': fs }, g, txt);
    }
  });
  ENTRADAS.forEach((e) => {
    const g = el('g', { class: 'entry' }, $map);
    el('title', {}, g, e.t + '. ' + e.d);
    el('circle', { class: 'ring', cx: e.x, cy: e.y, r: 16 }, g);
    el('circle', { class: 'dot', cx: e.x, cy: e.y, r: 16 }, g);
    el(
      'path',
      {
        d: `M${e.x - 6} ${e.y}h12M${e.x + 1} ${e.y - 6}l6 6-6 6`,
        stroke: 'var(--surface)',
        'stroke-width': 3,
        fill: 'none',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        transform: `rotate(${e.y < 100 ? 90 : e.x < 200 ? 0 : -90} ${e.x} ${e.y})`,
      },
      g,
    );
    const fs = 19,
      tw = e.t.length * fs * 0.55 + 20;
    const rx = e.anchor === 'start' ? e.lx - 8 : e.lx - tw + 8;
    el('rect', { x: rx, y: e.ly - fs - 4, width: tw, height: fs + 14, rx: 8 }, g);
    el(
      'text',
      {
        class: 'lbl',
        x: e.anchor === 'start' ? e.lx + 2 : e.lx - 2,
        y: e.ly + 2,
        'text-anchor': e.anchor,
        'font-size': fs,
      },
      g,
      e.t,
    );
  });
  [...B]
    .sort((a, b) => a[0] - b[0])
    .forEach((b) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="num">${b[0]}</span><button type="button">${esc(b[1])}${b[7] ? ` <span class="v">· Se vota ${b[7]}</span>` : ''}</button>`;
      li.querySelector('button').onclick = () => {
        select(b[0]);
        document.querySelector('.mapbox').scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      $blist.appendChild(li);
    });
}
drawMap();
function showView(v) {
  try {
    localStorage.setItem('delegados.vista', v);
  } catch (e) {}
  document.getElementById('v-horarios').hidden = v !== 'horarios';
  document.getElementById('v-mapa').hidden = v !== 'mapa';
  document.getElementById('tab-horarios').setAttribute('aria-selected', v === 'horarios');
  document.getElementById('tab-mapa').setAttribute('aria-selected', v === 'mapa');
  if (v === 'mapa') {
    const m = document.querySelector('.mapbox');
    m.scrollLeft = (m.scrollWidth - m.clientWidth) * 0.45;
  }
}
document.getElementById('tab-horarios').onclick = () => showView('horarios');
document.getElementById('tab-mapa').onclick = () => showView('mapa');
let vista;
try {
  vista = localStorage.getItem('delegados.vista');
} catch (e) {}
if (location.hash === '#mapa') vista = 'mapa';
showView(vista === 'mapa' ? 'mapa' : 'horarios');
