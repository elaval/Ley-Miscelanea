/**
 * Enriquecedor de metadata
 * Toma documento_base.json y agrega metadata estructurada:
 * - referencias legales
 * - instituciones mencionadas
 * - valores numéricos (montos, plazos, porcentajes)
 * - tags temáticos y de eje
 * - referencias cruzadas
 */

import { readFileSync, writeFileSync } from 'fs';
import type {
  LegalDocument,
  EnrichedArticle,
  EnrichedDocument,
  LegalReference,
  Institution,
  NumericValue,
} from '../types/schema.js';

const INPUT_PATH = 'datos/intermedio/documento_base.json';
const OUTPUT_PATH = 'datos/enriquecido/articulos_enriquecidos.json';

class MetadataEnricher {
  private institutionPatterns = [
    'Ministerio',
    'Servicio',
    'Dirección',
    'Subsecretaría',
    'Consejo',
    'Comisión',
    'Tribunal',
    'Corte',
    'Superintendencia',
    'Banco Central',
    'Contraloría',
    'Tesorería',
  ];

  enrich(document: LegalDocument): EnrichedDocument {
    console.log('\n📊 Iniciando enriquecimiento de metadata\n');

    const enrichedArticles: EnrichedArticle[] = document.articles.map(article => {
      return {
        ...article,
        theme_tags: this.extractThemeTags(article.raw_text),
        axis_tags: this.extractAxisTags(article.raw_text),
        legal_references: this.extractLegalReferences(article.raw_text),
        institutions: this.extractInstitutions(article.raw_text),
        numeric_values: this.extractNumericValues(article.raw_text),
        cross_references: this.extractCrossReferences(article.raw_text),
      };
    });

    const stats = this.calculateStats(enrichedArticles);

    console.log('✅ Enriquecimiento completado');
    console.log(`   Artículos con referencias legales: ${stats.articles_with_legal_refs}`);
    console.log(`   Artículos con instituciones: ${stats.articles_with_institutions}`);
    console.log(`   Artículos con valores numéricos: ${stats.articles_with_numeric_values}`);
    console.log(`   Leyes únicas mencionadas: ${stats.unique_laws_mentioned}`);
    console.log(`   Instituciones únicas: ${stats.unique_institutions}`);

    return {
      metadata: {
        ...document.metadata,
        extraction_date: new Date().toISOString(),
      },
      articles: enrichedArticles,
      enrichment_stats: stats,
    };
  }

  private extractThemeTags(text: string): string[] {
    const tags: string[] = [];
    const lower = text.toLowerCase();

    // Temas detectables por keywords
    const themes = {
      tributario: ['impuesto', 'tribut', 'renta', 'IVA', 'tasa'],
      ambiental: ['ambient', 'ecológic', 'contaminación', 'emisión'],
      laboral: ['trabajo', 'empleo', 'remuneración', 'contrato de trabajo'],
      educación: ['educación', 'universidad', 'educacional'],
      vivienda: ['vivienda', 'habitacional', 'inmueble'],
      inversión: ['inversión', 'capital', 'proyecto de inversión'],
      infraestructura: ['infraestructura', 'obra pública', 'construcción'],
      reconstrucción: ['reconstrucción', 'rehabilitación', 'reparación'],
      incendios: ['incendio', 'siniestro', 'catástrofe'],
      propiedad_intelectual: ['propiedad intelectual', 'derechos de autor', 'copyright'],
      contratos_públicos: ['contrato administrativo', 'licitación', 'compra pública'],
      procedimiento_administrativo: ['procedimiento administrativo', 'acto administrativo'],
    };

    for (const [tag, keywords] of Object.entries(themes)) {
      if (keywords.some(kw => lower.includes(kw))) {
        tags.push(tag);
      }
    }

    return [...new Set(tags)]; // Eliminar duplicados
  }

  private extractAxisTags(text: string): string[] {
    const tags: string[] = [];
    const lower = text.toLowerCase();

    // Ejes temáticos del proyecto
    if (
      lower.includes('reconstrucción') ||
      lower.includes('infraestructura') ||
      lower.includes('obra')
    ) {
      tags.push('reconstrucción_física');
    }

    if (
      lower.includes('impuesto') ||
      lower.includes('tribut') ||
      lower.includes('inversión') ||
      lower.includes('empleo')
    ) {
      tags.push('reconstrucción_económica');
    }

    if (
      lower.includes('procedimiento') ||
      lower.includes('administrativo') ||
      lower.includes('licitación')
    ) {
      tags.push('reconstrucción_institucional');
    }

    if (lower.includes('fiscal') || lower.includes('presupuesto')) {
      tags.push('reconstrucción_fiscal');
    }

    return [...new Set(tags)];
  }

  private extractLegalReferences(text: string): LegalReference[] {
    const references: LegalReference[] = [];

    // Patrón para leyes: ley N° 12.345
    const lawPattern = /ley\s+N°?\s*(\d+[\.,]?\d*)/gi;
    let match;
    while ((match = lawPattern.exec(text)) !== null) {
      references.push({
        law_name: `Ley ${match[1].replace(',', '.')}`,
        raw_mention: match[0],
      });
    }

    // Patrón para DFL: decreto con fuerza de ley N° 123
    const dflPattern = /decreto\s+con\s+fuerza\s+de\s+ley\s+N°?\s*(\d+)/gi;
    while ((match = dflPattern.exec(text)) !== null) {
      references.push({
        law_name: `DFL ${match[1]}`,
        raw_mention: match[0],
      });
    }

    // Patrón para decretos: decreto N° 123
    const decreePattern = /decreto\s+N°?\s*(\d+[\.,]?\d*)/gi;
    while ((match = decreePattern.exec(text)) !== null) {
      references.push({
        law_name: `Decreto ${match[1].replace(',', '.')}`,
        raw_mention: match[0],
      });
    }

    // Detectar tipo de modificación
    const modificationKeywords = {
      modifica: ['modif', 'modifíc', 'modifíquese'],
      deroga: ['derog', 'derógase'],
      reemplaza: ['reemplaz', 'reemplácese'],
      agrega: ['agrég', 'agrégase', 'incorpór'],
      intercala: ['intercal', 'intercálase'],
      sustituye: ['sustitu', 'sustitúyase'],
    };

    references.forEach(ref => {
      for (const [type, keywords] of Object.entries(modificationKeywords)) {
        if (keywords.some(kw => text.toLowerCase().includes(kw))) {
          ref.modification_type = type as any;
          break;
        }
      }
    });

    return references;
  }

  private extractInstitutions(text: string): Institution[] {
    const institutions: Institution[] = [];
    const foundInstitutions = new Set<string>();

    // Buscar instituciones por patrón
    for (const pattern of this.institutionPatterns) {
      const regex = new RegExp(`${pattern}[^.;,]*`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const fullName = match[0].trim();
        if (!foundInstitutions.has(fullName)) {
          foundInstitutions.add(fullName);
          institutions.push({
            name: fullName,
          });
        }
      }
    }

    // Instituciones específicas conocidas
    const knownInstitutions = [
      'Servicio de Impuestos Internos',
      'Banco Central de Chile',
      'Tesorería General de la República',
      'Contraloría General de la República',
      'Unidad de Análisis Financiero',
      'Superintendencia del Medio Ambiente',
    ];

    for (const inst of knownInstitutions) {
      if (text.includes(inst) && !foundInstitutions.has(inst)) {
        foundInstitutions.add(inst);
        institutions.push({ name: inst });
      }
    }

    return institutions;
  }

  private extractNumericValues(text: string): NumericValue[] {
    const values: NumericValue[] = [];

    // Porcentajes
    const percentPattern = /(\d+(?:[.,]\d+)?)\s*%/g;
    let match;
    while ((match = percentPattern.exec(text)) !== null) {
      values.push({
        type: 'porcentaje',
        value: match[1].replace(',', '.'),
        unit: '%',
        context: this.getContext(text, match.index, 50),
      });
    }

    // Montos en UF, UTM, pesos
    const amountPattern = /([\d.,]+)\s*(UF|UTM|pesos|CLP)/gi;
    while ((match = amountPattern.exec(text)) !== null) {
      values.push({
        type: 'monto',
        value: match[1].replace(',', '.'),
        unit: match[2],
        context: this.getContext(text, match.index, 50),
      });
    }

    // Plazos en días, meses, años
    const timePattern = /(\d+)\s*(días?|meses|años?|hábiles)/gi;
    while ((match = timePattern.exec(text)) !== null) {
      values.push({
        type: 'plazo',
        value: match[1],
        unit: match[2],
        context: this.getContext(text, match.index, 50),
      });
    }

    return values;
  }

  private extractCrossReferences(text: string): string[] {
    const references: string[] = [];

    // Referencias a otros artículos
    const articleRefPattern = /artículo\s+(\d+)/gi;
    let match;
    while ((match = articleRefPattern.exec(text)) !== null) {
      references.push(`art-${match[1]}`);
    }

    return [...new Set(references)]; // Eliminar duplicados
  }

  private getContext(text: string, index: number, length: number): string {
    const start = Math.max(0, index - length);
    const end = Math.min(text.length, index + length);
    return text.substring(start, end).trim();
  }

  private calculateStats(articles: EnrichedArticle[]) {
    const uniqueLaws = new Set<string>();
    const uniqueInstitutions = new Set<string>();

    let articlesWithLegalRefs = 0;
    let articlesWithInstitutions = 0;
    let articlesWithNumericValues = 0;

    for (const article of articles) {
      if (article.legal_references.length > 0) {
        articlesWithLegalRefs++;
        article.legal_references.forEach(ref => uniqueLaws.add(ref.law_name));
      }

      if (article.institutions.length > 0) {
        articlesWithInstitutions++;
        article.institutions.forEach(inst => uniqueInstitutions.add(inst.name));
      }

      if (article.numeric_values.length > 0) {
        articlesWithNumericValues++;
      }
    }

    return {
      articles_with_legal_refs: articlesWithLegalRefs,
      articles_with_institutions: articlesWithInstitutions,
      articles_with_numeric_values: articlesWithNumericValues,
      unique_laws_mentioned: uniqueLaws.size,
      unique_institutions: uniqueInstitutions.size,
    };
  }
}

// ===== Ejecución =====

async function main() {
  console.log('🚀 Iniciando enriquecimiento de metadata\n');

  // Leer documento base
  const documentJson = readFileSync(INPUT_PATH, 'utf-8');
  const document: LegalDocument = JSON.parse(documentJson);

  console.log(`📖 Documento cargado: ${document.articles.length} artículos`);

  // Enriquecer
  const enricher = new MetadataEnricher();
  const enrichedDocument = enricher.enrich(document);

  // Guardar
  writeFileSync(OUTPUT_PATH, JSON.stringify(enrichedDocument, null, 2), 'utf-8');

  console.log(`\n💾 Archivo generado: ${OUTPUT_PATH}\n`);
}

main().catch(console.error);
