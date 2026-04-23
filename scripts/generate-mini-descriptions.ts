/**
 * Genera una mini-descripción (1 frase, ≤ 15 palabras) por artículo
 * a partir de la plain_explanation ya existente — sin re-analizar el texto legal.
 *
 * Usa claude-haiku-3-5 para ser rápido y barato.
 * Agrega el campo `mini_description` a cada artículo en articulos_enriquecidos.json.
 *
 * Uso:
 *   npx tsx scripts/generate-mini-descriptions.ts            → todos los artículos
 *   npx tsx scripts/generate-mini-descriptions.ts --force    → reescribe aunque ya exista
 *   npx tsx scripts/generate-mini-descriptions.ts --dry-run  → muestra prompt sin llamar API
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const PATH = 'datos/enriquecido/articulos_enriquecidos.json';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');

function buildPrompt(plain_explanation: string): string {
  return `Tienes la siguiente explicación de un artículo de un proyecto de ley:

"${plain_explanation}"

Escribe UNA sola frase en español (máximo 15 palabras) que describa qué hace este artículo, adecuada para mostrar en un listado de navegación. Reglas:
- No uses "Este artículo", "El artículo" ni "Artículo" al inicio
- Usa voz activa y lenguaje directo
- Menciona el efecto concreto, no el mecanismo legal
- Solo la frase, sin comillas, sin punto final

Ejemplo de buen resultado: "Extiende el beneficio tributario a viviendas reconstruidas en zonas de catástrofe"`;
}

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const raw = readFileSync(PATH, 'utf-8');
  const data = JSON.parse(raw);
  const articles: any[] = data.articles;

  const toProcess = articles.filter(a => {
    if (!a.llm_analysis?.plain_explanation) return false;
    if (!FORCE && a.mini_description) return false;
    return true;
  });

  console.log(`📋 Artículos a procesar: ${toProcess.length} (de ${articles.length} total)`);
  if (toProcess.length === 0) {
    console.log('✅ Todos los artículos ya tienen mini_description. Usa --force para regenerar.');
    return;
  }

  let ok = 0;
  let err = 0;

  for (const article of toProcess) {
    const label = article.article_type === 'permanent'
      ? `Art. ${article.article_number}`
      : `Transitorio ${article.article_number}`;

    const prompt = buildPrompt(article.llm_analysis.plain_explanation);

    if (DRY_RUN) {
      console.log(`\n--- ${label} ---`);
      console.log(prompt);
      continue;
    }

    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 60,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();
      article.mini_description = text;
      ok++;
      console.log(`✅ ${label}: ${text}`);

      // Guardar tras cada artículo para no perder progreso
      data.articles = articles;
      writeFileSync(PATH, JSON.stringify(data, null, 2), 'utf-8');

      // Pausa breve para no saturar la API
      await new Promise(r => setTimeout(r, 300));

    } catch (e) {
      console.error(`❌ ${label}: ${e}`);
      err++;
    }
  }

  if (!DRY_RUN) {
    console.log(`\n✅ Completado: ${ok} generados, ${err} errores.`);
  }
}

main().catch(console.error);
