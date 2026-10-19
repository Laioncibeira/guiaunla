"""
Convierte la planilla de cursadas de un departamento (una hoja por carrera,
filas Mañana/Tarde/Noche y columnas Lunes..Sábado) al formato de la página
/ELECCIONES: un texto por día y turno, listo para WhatsApp, con las clases
agrupadas por carrera y ordenadas por edificio y aula.

Uso:  python3 tools/elecciones/desde-xlsx.py planilla.xlsx > salida.json
Necesita openpyxl (pip install openpyxl).

Cada celda trae una clase por línea, así:
  "1° (Coh. 2025) Física I (Antoniuk) — 4 Ugarte — 50% presencial"
y sale como:
  "Ugarte 4 - Física I (1°, Coh. 2025, Antoniuk, 50% presencial)"
"""
import json
import re
import sys
import unicodedata

import openpyxl

DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
TURNOS = ['Mañana', 'Tarde', 'Noche']

# Nombre de la carrera en el texto, por nombre de hoja (en el orden de la planilla).
CARRERAS = {
    'Economía': 'Economía Política',
    'Tec. Ferroviarias': 'Tecnologías Ferroviarias',
    'Turismo': 'Turismo',
    'Sistemas (2024+)': 'Sistemas (cohortes 2024 en adelante)',
    'Sistemas (2023-)': 'Sistemas (cohortes 2023 y anteriores)',
    'Gestión Ambiental': 'Gestión Ambiental Urbana',
    'Alimentos': 'Ciencia y Tecnología de los Alimentos',
    'Logística y Transporte': 'Logística y Transporte',
}

# Cómo nombra cada edificio la planilla -> el nombre corto del mapa.
EDIFICIOS = {
    'kirchner': 'Kirchner', 'n. kirchner': 'Kirchner', 'nestor kirchner': 'Kirchner',
    'hernandez': 'Hernández', 'j. hernandez': 'Hernández', 'jose hernandez': 'Hernández',
    'macedonio': 'Macedonio', 'macedonio fernandez': 'Macedonio',
    'marechal': 'Marechal', 'l. marechal': 'Marechal', 'leopoldo marechal': 'Marechal',
    'ugarte': 'Ugarte', 'm. ugarte': 'Ugarte', 'manuel ugarte': 'Ugarte',
    'jauretche': 'Jauretche', 'a. jauretche': 'Jauretche', 'aj': 'Jauretche',
    'juana manso': 'Manso', 'manso': 'Manso',
    'manzi': 'Manzi', 'dorrego': 'Dorrego',
    'scalabrini': 'Scalabrini', 's. ortiz': 'Scalabrini',
}

def plano(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

def edificio(nombre):
    return EDIFICIOS.get(plano(nombre.strip()))

def partir(texto, sep=' — '):
    """Parte por el separador, salvo dentro de paréntesis: '(Coh. 2022 — Electromec.)'."""
    partes, nivel, actual, i = [], 0, '', 0
    while i < len(texto):
        if texto.startswith(sep, i) and nivel == 0:
            partes.append(actual); actual = ''; i += len(sep); continue
        c = texto[i]
        nivel += c == '('; nivel -= c == ')'
        actual += c; i += 1
    return partes + [actual]

def lugar(texto):
    """'8 N. Kirchner' -> ('Kirchner', '8'). Devuelve (edificio o texto, aula)."""
    t = texto.strip()
    if re.fullmatch(r'(?i)virtual', t):
        return ('Virtual', '')
    if re.fullmatch(r'(?i)(aula )?a definir|sin aula( indicada)?', t):
        return ('Sin aula', '')
    m = re.fullmatch(r'(\d+(?:/\d+)?) (.+?)(/Virtual)?( \(.*\))?', t)
    if m and edificio(m.group(2)):
        return (edificio(m.group(2)), m.group(1) + (' / Virtual' if m.group(3) else '') + (m.group(4) or ''))
    m = re.fullmatch(r'(Labs?\. .+|Lumca \d+) (A\. Jauretche|AJ|Scalabrini)', t)
    if m:
        return (edificio(m.group(2)), m.group(1))
    return (t, '')

PREFIJO = re.compile(
    r'^((?:\d°(?:/\d°)?|\d(?= ))(?: ?\([^)]*\))?(?: [A-Z]-[A-Z])?|Coh\. \d{4}|Sem\. Opt\.)\s+'
)

def clase(linea):
    partes = [p.strip() for p in partir(linea)]
    izquierda, ubicacion, extras = partes[0], (partes[1] if len(partes) > 1 else ''), partes[2:]
    detalles = []
    m = PREFIJO.match(izquierda)
    if m:
        pre = m.group(1)
        izquierda = izquierda[m.end():]
        if re.fullmatch(r'\d', pre):
            pre += '°'
        detalles += [p.strip() for p in re.split(r'[()]|, ', pre) if p.strip()]
    # El docente es el último paréntesis; lo que sigue (horario, régimen) va a los detalles.
    m = list(re.finditer(r'\(([^()]*)\)', izquierda))
    materia, despues = izquierda, ''
    if m:
        u = m[-1]
        materia, docente, despues = izquierda[:u.start()].strip(), u.group(1), izquierda[u.end():].strip(' -')
        detalles.append(docente)
    if despues:
        detalles.append(despues)
    detalles += extras
    materia = re.sub(r'\s+-\s+(Com\.\d+|\d{4}-\d)$', r' \1', materia)
    edif, aula = lugar(ubicacion) if ubicacion else ('Sin aula', '')
    donde = f'{edif} {aula}'.strip()
    texto = f'{donde} - {materia}' + (f' ({", ".join(detalles)})' if detalles else '')
    # Orden: edificios con nombre, después lo virtual y lo que no tiene aula.
    resto = edif in ('Virtual', 'Sin aula') or edif not in EDIFICIOS.values()
    num = re.match(r'\d+', aula)
    return ((resto, plano(edif), int(num.group()) if num else 999, aula, texto), texto)

def main(ruta):
    wb = openpyxl.load_workbook(ruta, data_only=True)
    por_turno = {}
    for hoja in wb:
        nombre = CARRERAS.get(hoja.title)
        if not nombre:
            sys.exit(f'Hoja desconocida: {hoja.title}. Agregala a CARRERAS.')
        filas = list(hoja.iter_rows(values_only=True))
        cab = filas[2]
        assert cab[0] == 'Turno' and list(cab[1:7]) == DIAS, f'{hoja.title}: encabezado inesperado'
        for fila in filas[3:]:
            if fila[0] not in TURNOS:
                continue
            for dia, celda in zip(DIAS, fila[1:7]):
                if not celda:
                    continue
                lineas = [l.strip() for l in str(celda).split('\n') if l.strip()]
                por_turno.setdefault((dia, fila[0]), {}).setdefault(nombre, []).extend(clase(l) for l in lineas)
    salida = []
    for dia in DIAS:
        for turno in TURNOS:
            grupos = por_turno.get((dia, turno))
            if not grupos:
                continue
            bloques, n = [], 0
            for carrera in CARRERAS.values():
                if carrera in grupos:
                    lineas = [t for _, t in sorted(grupos[carrera])]
                    n += len(lineas)
                    bloques.append(f'*{carrera}:*\n' + '\n'.join(lineas))
            titulo = f'*{dia.upper()} - TURNO {turno.upper()}*'
            salida.append({'dia': dia, 'turno': turno, 'n': n, 'texto': titulo + '\n\n' + '\n\n'.join(bloques)})
    json.dump(salida, sys.stdout, ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main(sys.argv[1])
