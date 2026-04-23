/**
 * Vincula las descripciones del mensaje presidencial con cada artículo del articulado.
 * Lee las líneas del mensaje (sección "Artículos permanentes" y "Artículos transitorios")
 * y agrega el campo `message_description` a cada artículo en el JSON enriquecido.
 *
 * Las descripciones del mensaje son la explicación que el Ejecutivo da de cada artículo
 * en lenguaje accesible — son la fuente más confiable de intención de política pública.
 */

import mammoth from 'mammoth';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const INPUT_PATH = 'datos/enriquecido/articulos_enriquecidos.json';
const OUTPUT_PATH = 'datos/enriquecido/articulos_enriquecidos.json';

// Mapa de ordinales (mensaje usa palabras, no números)
const ORDINALS: Record<string, number> = {
  'primero': 1, 'segundo': 2, 'tercero': 3, 'cuarto': 4, 'quinto': 5,
  'sexto': 6, 'séptimo': 7, 'octavo': 8, 'noveno': 9, 'décimo': 10,
  'décimo primero': 11, 'décimo segundo': 12, 'décimo tercero': 13,
  'décimo cuarto': 14, 'décimo quinto': 15, 'décimo sexto': 16,
  'décimo séptimo': 17,
};

// Ordena los ordinales de mayor a menor para que el match greedy funcione
// ("décimo primero" antes que "décimo")
const ORDINALS_SORTED = Object.keys(ORDINALS).sort((a, b) => b.length - a.length);

interface ArticleDescription {
  article_number: number;
  article_type: 'permanent' | 'transitory';
  description: string;
}

function parseOrdinalFromLine(line: string): number | null {
  const lower = line.toLowerCase();
  for (const ordinal of ORDINALS_SORTED) {
    // Caso normal: "artículo décimo primero transitorio"
    if (lower.includes(`artículo ${ordinal} transitorio`) || lower.includes(`artículo ${ordinal}° transitorio`)) {
      return ORDINALS[ordinal];
    }
    // Caso sin "transitorio" (error tipográfico en el documento fuente, ej: T11)
    // Solo aplica si el ordinal aparece directamente seguido de un verbo conjugado
    const regex = new RegExp(`artículo\\s+${ordinal}\\s+(?:establece|dispone|faculta|señala|indica|fija|crea|regula|introduce|modifica)`, 'i');
    if (regex.test(lower)) {
      return ORDINALS[ordinal];
    }
  }
  return null;
}

function parsePermanentNumberFromLine(line: string): number | null {
  // Detecta "el artículo N°", "el artículo N ", "el artículo N," en cualquier posición
  const match = line.match(/\bartículo\s+(\d+)[°º]?[\s,\.]/i);
  if (match) return parseInt(match[1]);
  // También al final de línea
  const matchEnd = line.match(/\bartículo\s+(\d+)[°º]?$/i);
  if (matchEnd) return parseInt(matchEnd[1]);
  return null;
}

async function extractDescriptions(): Promise<ArticleDescription[]> {
  const fuente = readdirSync('fuente');
  const docx = fuente.find((f: string) => f.endsWith('.docx'))!;
  const buf = readFileSync(join('fuente', docx));
  const r = await mammoth.extractRawText({ buffer: buf });
  const lines = r.value.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

  // Encontrar límites de la sección del mensaje
  const permanentHeaderIdx = lines.findIndex(l => l.trim() === 'Artículos permanentes');
  const transitoryHeaderIdx = lines.findIndex(l => l.trim() === 'Artículos transitorios');
  const articuladoIdx = lines.findIndex(l => l.trim() === 'PROYECTO DE LEY:');

  if (permanentHeaderIdx === -1 || transitoryHeaderIdx === -1 || articuladoIdx === -1) {
    throw new Error('No se encontraron los marcadores de sección esperados');
  }

  console.log(`  Sección permanentes: líneas ${permanentHeaderIdx + 1}–${transitoryHeaderIdx}`);
  console.log(`  Sección transitorios: líneas ${transitoryHeaderIdx + 1}–${articuladoIdx}`);

  const descriptions: ArticleDescription[] = [];

  // Contexto grupal para arts. 14-18 (se incluye como prefijo)
  let groupContext14to18 = '';

  // ── Artículos permanentes ──────────────────────────────────────────
  let currentNumber: number | null = null;
  let currentLines: string[] = [];

  const saveCurrent = (type: 'permanent' | 'transitory') => {
    if (currentNumber !== null && currentLines.length > 0) {
      descriptions.push({
        article_number: currentNumber,
        article_type: type,
        description: currentLines.join(' ').replace(/\s+/g, ' ').trim(),
      });
    }
    currentNumber = null;
    currentLines = [];
  };

  for (let i = permanentHeaderIdx + 1; i < transitoryHeaderIdx; i++) {
    const line = lines[i];

    // Detectar descripción grupal arts. 14-18
    if (line.match(/artículos\s+14\s+a\s+18/i)) {
      groupContext14to18 = line;
      continue;
    }

    const num = parsePermanentNumberFromLine(line);

    if (num !== null && num >= 1 && num <= 33) {
      saveCurrent('permanent');
      currentNumber = num;
      // Para arts. 14-18, prefijamos con el contexto grupal
      if (num >= 14 && num <= 18 && groupContext14to18) {
        currentLines = [groupContext14to18, line];
      } else {
        currentLines = [line];
      }
    } else if (currentNumber !== null) {
      // Línea de continuación
      currentLines.push(line);
    }
  }
  saveCurrent('permanent');

  // ── Artículos transitorios ─────────────────────────────────────────
  currentNumber = null;
  currentLines = [];

  for (let i = transitoryHeaderIdx + 1; i < articuladoIdx; i++) {
    const line = lines[i];
    const num = parseOrdinalFromLine(line);

    if (num !== null) {
      saveCurrent('transitory');
      currentNumber = num;
      currentLines = [line];
    } else if (currentNumber !== null) {
      // No absorber la frase de cierre del mensaje presidencial
      if (line.toLowerCase().startsWith('en consecuencia') || line.toLowerCase().includes('tengo el honor')) {
        break;
      }
      currentLines.push(line);
    }
  }
  saveCurrent('transitory');

  return descriptions;
}

async function main() {
  console.log('\n🔗 Vinculando descripciones del mensaje con artículos\n');

  const descriptions = await extractDescriptions();
  console.log(`\n  Descripciones extraídas: ${descriptions.length}`);

  // Verificar cobertura
  const permDescs = descriptions.filter(d => d.article_type === 'permanent');
  const transDescs = descriptions.filter(d => d.article_type === 'transitory');
  console.log(`  - Permanentes: ${permDescs.length} / 33`);
  console.log(`  - Transitorios: ${transDescs.length} / 17`);

  // Reportar faltantes
  const permNums = new Set(permDescs.map(d => d.article_number));
  const transNums = new Set(transDescs.map(d => d.article_number));
  const permMissing = Array.from({ length: 33 }, (_, i) => i + 1).filter(n => !permNums.has(n));
  const transMissing = Array.from({ length: 17 }, (_, i) => i + 1).filter(n => !transNums.has(n));
  if (permMissing.length) console.log(`  ⚠️  Permanentes sin descripción: ${permMissing.join(', ')}`);
  if (transMissing.length) console.log(`  ⚠️  Transitorios sin descripción: ${transMissing.join(', ')}`);

  // Cargar JSON enriquecido y agregar message_description
  const enriched = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'));

  const descMap = new Map<string, string>();
  for (const d of descriptions) {
    descMap.set(`${d.article_type}-${d.article_number}`, d.description);
  }

  let linked = 0;
  for (const article of enriched.articles) {
    const key = `${article.article_type}-${article.article_number}`;
    const desc = descMap.get(key);
    if (desc) {
      article.message_description = desc;
      linked++;
    } else {
      article.message_description = null;
    }
  }

  console.log(`\n  Artículos vinculados: ${linked} / ${enriched.articles.length}`);

  enriched.metadata.description_linking_date = new Date().toISOString();
  writeFileSync(OUTPUT_PATH, JSON.stringify(enriched, null, 2), 'utf-8');
  console.log(`\n💾 JSON actualizado: ${OUTPUT_PATH}\n`);

  // Vista previa de algunos resultados
  console.log('── Vista previa ──────────────────────────────────────────────');
  for (const n of [1, 7, 13, 14, 16, 33]) {
    const a = enriched.articles.find((x: any) => x.article_type === 'permanent' && x.article_number === n);
    if (a?.message_description) {
      console.log(`\nArt. ${n}: ${a.message_description.substring(0, 120)}...`);
    }
  }
  for (const n of [1, 3, 17]) {
    const a = enriched.articles.find((x: any) => x.article_type === 'transitory' && x.article_number === n);
    if (a?.message_description) {
      console.log(`\nT${n}: ${a.message_description.substring(0, 120)}...`);
    }
  }
}

main().catch(console.error);
