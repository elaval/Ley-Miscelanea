/**
 * Genera análisis LLM para cada artículo usando la API de Anthropic.
 * Usa prompt v0.2.0: dos fuentes (raw_text + message_description) y 6 campos de output.
 *
 * Uso:
 *   npm run analyze              → todos los artículos sin análisis
 *   npm run analyze -- --id 9    → solo el artículo permanente 9
 *   npm run analyze -- --id T3   → solo el artículo transitorio 3
 *   npm run analyze -- --dry-run → muestra el prompt sin llamar a la API
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Cargar .env si existe
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const INPUT_PATH = 'datos/enriquecido/articulos_enriquecidos.json';
const OUTPUT_PATH = 'datos/enriquecido/articulos_enriquecidos.json';

// Artículos muy largos: umbral para emitir advertencia
const LARGE_ARTICLE_CHARS = 15_000;

interface ArticleAnalysis {
  plain_explanation: string;
  what_changes: string;
  who_is_affected: string[];
  gaps_in_message: string;
  open_questions: string[];
  analysis_note: string;
  citizen_alert: string[];
}

interface EnrichedArticle {
  article_id: string;
  article_number: number;
  article_type: 'permanent' | 'transitory';
  title: string;
  raw_text: string;
  message_description: string | null;
  legal_references: Array<{ law_name: string; raw_mention: string; modification_type?: string }>;
  numeric_values: Array<{ type: string; value: string; unit: string; context: string }>;
  llm_analysis?: ArticleAnalysis;
  llm_analysis_date?: string;
  llm_model?: string;
}

function buildPrompt(article: EnrichedArticle): string {
  const typeLabel = article.article_type === 'permanent'
    ? 'Artículo permanente'
    : `Artículo ${article.title.replace('Artículo ', '')} (transitorio)`;

  const legalRefs = article.legal_references.length > 0
    ? article.legal_references
        .map(r => `- ${r.law_name}${r.modification_type ? ` (${r.modification_type})` : ''}`)
        .join('\n')
    : '- No se detectaron referencias legales específicas.';

  const numericValues = article.numeric_values.length > 0
    ? article.numeric_values
        .slice(0, 8) // limitar para no inflar el prompt
        .map(v => `- ${v.value} ${v.unit} — "${v.context.trim().substring(0, 80)}"`)
        .join('\n')
    : '- No se detectaron valores numéricos.';

  const messageDesc = article.message_description
    ?? '(No disponible — analizar solo desde el texto legal.)';

  return `Eres un analista de política pública especializado en legislación chilena.
Tu rol es ayudar a ciudadanos a leer un proyecto de ley de manera crítica, trazable
y comprensible, distinguiendo con claridad entre lo que el texto dice, lo que puede
inferirse razonablemente y lo que sería solo una hipótesis.

Este proyecto (Ley Miscelánea de Reconstrucción, 22 de abril de 2026) contiene medidas
en cuatro ejes: reconstrucción física, económica, institucional y fiscal, tras los
incendios de enero de 2026 en Valparaíso, Ñuble y Biobío.

---

# ARTÍCULO ${article.article_number} — ${typeLabel}

---

## FUENTE 1 — DESCRIPCIÓN OFICIAL DEL EJECUTIVO
*(Lo que el gobierno declaró que hace este artículo en el mensaje presidencial.
No es el análisis: es la referencia de intención declarada.)*

${messageDesc}

---

## FUENTE 2 — TEXTO LEGAL OFICIAL
*(El texto normativo que tendrá efecto de ley.)*

${article.raw_text}

---

## DATOS ESTRUCTURADOS

**Leyes que modifica o referencia:**
${legalRefs}

**Valores clave detectados:**
${numericValues}

---

## PRINCIPIOS DE TRABAJO — LEE ESTO ANTES DE ANALIZAR

Trabajas con criterio de auditoría textual estricta.

1. **Fidelidad literal primero.** Evalúa qué dice efectivamente el texto, qué no dice, y qué solo puede inferirse con cautela.
2. **No afirmes cambios sobre el derecho previo** salvo que el material lo demuestre. Si no, usa [inferencia] o abstente.
3. **No conviertas facultades en obligaciones.** "Podrá requerir" no es "queda obligado a".
4. **Marca las inferencias.** Toda conclusión no textual debe ir marcada como [inferencia].
5. **No expandas remisiones normativas** más allá de lo que el texto dice expresamente.
6. **Si una conclusión depende de normas no entregadas, dilo.**
7. **Prioriza efecto práctico sobre etiqueta técnica.** Explica qué hace la norma en la práctica antes que describirla en lenguaje dogmático.
8. **No elimines ambigüedades reales.** Si el texto es ambiguo, incompleto o técnicamente abierto, dilo de forma explícita.

---

## TU TAREA

Genera un análisis con exactamente los siguientes 7 campos.

### 1. plain_explanation
Explica en 2 a 3 oraciones qué hace este artículo según su texto.
- Lenguaje accesible para una persona no especialista.
- Evita jerga como "imputación", "legitimación activa", "caducidad", "guarismo", "hecho gravado", "norma supletoria", salvo que sea indispensable.
- Si usas un término técnico, reemplázalo por una expresión común o explícalo en la misma frase.
- No copies el mensaje oficial: sintetiza desde el texto.
- Menciona el cambio concreto, no el objetivo político.

### 2. what_changes
Describe qué cambia en el ordenamiento jurídico.
- Si modifica una ley existente: qué aspecto específico cambia.
- Si crea una norma nueva: qué situación regula.
- Sé concreto y prioriza el efecto práctico: "permite descontar parte de los sueldos pagados del impuesto de la empresa" es mejor que "introduce cambios tributarios".
- Si afirmas que algo "antes no existía", márcalo como [inferencia] salvo que el propio texto lo diga.

### 3. who_is_affected
Lista los actores afectados. Sé específico. Distingue entre:
- quienes se benefician directamente,
- quienes quedan excluidos,
- instituciones que adquieren nuevas facultades u obligaciones,
- personas o entidades que quedan sujetas a mayores exigencias, controles o sanciones.
No confundas facultades con obligaciones. Si el efecto sobre un grupo es indirecto o tentativo, márcalo como [inferencia].

### 4. gaps_in_message
Identifica qué contiene el texto que la descripción oficial minimiza u omite.
Enfócate en omisiones **operativas**: plazos concretos, condiciones de acceso o exclusión, secuencia de aplicación, mecanismos de fiscalización y sus consecuencias, pérdida del beneficio, reglas documentales o probatorias, alcance preciso de facultades.
No inventes tensiones. No hagas interpretaciones político-constitucionales aquí.
Si no hay gaps relevantes, escribe: "El texto es consistente con la descripción oficial."

### 5. open_questions
Lista 2 o 3 preguntas genuinas que el texto deja sin responder.
- Solo preguntas que el propio texto no responde.
- No preguntas retóricas.
- No plantees como problema algo que probablemente será resuelto por reglamentación ordinaria, salvo que ese silencio pueda alterar materialmente el alcance del artículo.
- Enfócate en dudas operativas o de aplicación práctica que realmente importen.

### 6. analysis_note
Una oración que declare la principal limitación: qué norma adicional sería necesaria para completar el análisis, o si el análisis es suficiente con el material entregado.

### 7. citizen_alert
**Este campo tiene un régimen diferente a todos los anteriores. Aquí, y solo aquí, puedes ir más allá del texto literal.**
Señala efectos que un ciudadano común probablemente no percibiría: riesgos laterales, dinámicas de incentivos, grupos afectados de formas no evidentes.

Condiciones obligatorias:
1. Toda afirmación debe comenzar con "Podría…", "Es posible que…" o "Vale la pena preguntarse si…"
2. Cada alerta debe estar anclada en un rasgo concreto del artículo: un umbral, un plazo, una exclusión, una incompatibilidad, una sanción, una facultad amplia, una omisión relevante.
3. No incluyas hipótesis de segundo orden que dependan de múltiples supuestos externos o cadenas causales largas.
4. Prioriza alertas de plausibilidad media o alta. Evita ideas ingeniosas pero débiles.
5. Máximo 3 puntos.
6. Si no identificas efectos latentes relevantes bien anclados, escribe: "No se identifican efectos latentes relevantes más allá de lo ya señalado."

---

## RESTRICCIONES GLOBALES (excepto citizen_alert dentro de sus límites)

- No afirmes constitucionalidad o inconstitucionalidad como hecho.
- No predicas efectos económicos cuantificados como certeza.
- No introduzcas opiniones políticas sobre si la medida es buena o mala.
- No inventes contexto ausente en las fuentes.
- No copies el mensaje como análisis propio.
- No conviertas una posibilidad en una consecuencia segura.
- Si el texto es ambiguo, dilo.

---

## FORMATO DE SALIDA

Responde ÚNICAMENTE con el siguiente JSON, sin texto adicional antes ni después:

{
  "plain_explanation": "...",
  "what_changes": "...",
  "who_is_affected": ["...", "..."],
  "gaps_in_message": "...",
  "open_questions": ["...", "..."],
  "analysis_note": "...",
  "citizen_alert": ["...", "..."]
}`;
}

function parseArgs(): { targetId: string | null; dryRun: boolean } {
  const args = process.argv.slice(2);
  let targetId: string | null = null;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) targetId = args[i + 1];
    if (args[i] === '--dry-run') dryRun = true;
  }
  return { targetId, dryRun };
}

function resolveTarget(articles: EnrichedArticle[], id: string): EnrichedArticle[] {
  // --id T3 → transitorio 3, --id 9 → permanente 9
  if (id.startsWith('T') || id.startsWith('t')) {
    const num = parseInt(id.slice(1));
    return articles.filter(a => a.article_type === 'transitory' && a.article_number === num);
  }
  const num = parseInt(id);
  return articles.filter(a => a.article_type === 'permanent' && a.article_number === num);
}

async function analyzeArticle(
  client: Anthropic,
  article: EnrichedArticle,
  dryRun: boolean
): Promise<ArticleAnalysis | null> {
  const prompt = buildPrompt(article);

  if (dryRun) {
    console.log('\n' + '─'.repeat(60));
    console.log(`PROMPT PARA: ${article.article_id}`);
    console.log('─'.repeat(60));
    console.log(prompt);
    return null;
  }

  if (article.raw_text.length > LARGE_ARTICLE_CHARS) {
    console.warn(`  ⚠️  Artículo largo: ${article.raw_text.length} chars. Considera segmentarlo.`);
  }

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2500,
    system: 'Eres un analista de política pública. Respondes únicamente en JSON válido, sin markdown, sin texto adicional.',
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    // Limpiar posible wrapping de markdown (```json ... ```)
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned) as ArticleAnalysis;
  } catch (e) {
    console.error(`  ❌ Error parseando JSON para ${article.article_id}: ${e}`);
    // Guardar raw output para diagnóstico
    writeFileSync(`/tmp/llm_raw_${article.article_id}.txt`, raw, 'utf-8');
    console.error(`  Raw guardado en /tmp/llm_raw_${article.article_id}.txt`);
    return null;
  }
}

async function main() {
  const { targetId, dryRun } = parseArgs();

  if (!dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Falta ANTHROPIC_API_KEY en el entorno.');
    process.exit(1);
  }

  const enriched = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'));
  const articles: EnrichedArticle[] = enriched.articles;

  // Seleccionar artículos a procesar
  let targets: EnrichedArticle[];
  if (targetId) {
    targets = resolveTarget(articles, targetId);
    if (targets.length === 0) {
      console.error(`❌ No se encontró artículo con id: ${targetId}`);
      process.exit(1);
    }
  } else {
    // Por defecto: solo los que aún no tienen análisis
    targets = articles.filter(a => !a.llm_analysis);
  }

  console.log(`\n🤖 Generando análisis LLM`);
  console.log(`   Modelo: claude-opus-4-7`);
  console.log(`   Artículos a procesar: ${targets.length}`);
  if (dryRun) console.log(`   Modo: DRY RUN (no se llama a la API)\n`);

  const client = dryRun ? null : new Anthropic();
  let success = 0;
  let errors = 0;

  for (const article of targets) {
    process.stdout.write(`  → ${article.article_id} (${article.raw_text.length} chars)... `);

    const analysis = await analyzeArticle(client!, article, dryRun);

    if (analysis) {
      // Actualizar en el array original
      const idx = articles.findIndex(a => a.article_id === article.article_id);
      articles[idx].llm_analysis = analysis;
      articles[idx].llm_analysis_date = new Date().toISOString();
      articles[idx].llm_model = 'claude-opus-4-7';
      console.log('✅');
      success++;
    } else if (!dryRun) {
      console.log('❌');
      errors++;
    }
  }

  if (!dryRun) {
    writeFileSync(OUTPUT_PATH, JSON.stringify(enriched, null, 2), 'utf-8');
    console.log(`\n💾 Guardado: ${OUTPUT_PATH}`);
    console.log(`   ✅ Exitosos: ${success} | ❌ Errores: ${errors}`);
  }
}

main().catch(console.error);
