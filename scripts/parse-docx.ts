/**
 * Parser de documento DOCX
 * Extrae el texto y estructura del proyecto de ley
 * Genera documento_base.json con la estructura detectada
 */

import mammoth from 'mammoth';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type {
  LegalDocument,
  Section,
  Article,
  ArticleType,
  SectionType,
} from '../types/schema.js';

// Detectar el archivo DOCX en la carpeta fuente
function findSourceFile(): string {
  const files = readdirSync('fuente');
  const docxFile = files.find((f: string) => f.endsWith('.docx'));
  if (!docxFile) {
    throw new Error('No se encontró archivo .docx en la carpeta fuente/');
  }
  return `fuente/${docxFile}`;
}

const SOURCE_PATH = findSourceFile();
const OUTPUT_PATH = 'datos/intermedio/documento_base.json';

interface ParsingContext {
  warnings: string[];
  ambiguities: string[];
  currentSection: Section | null;
  sectionCounter: number;
  articleCounter: number;
}

class DocxParser {
  private ctx: ParsingContext = {
    warnings: [],
    ambiguities: [],
    currentSection: null,
    sectionCounter: 0,
    articleCounter: 0,
  };

  async parse(sourcePath: string): Promise<LegalDocument> {
    console.log(`\n📄 Leyendo archivo: ${sourcePath}`);

    // Leer el archivo DOCX
    const buffer = readFileSync(sourcePath);
    const result = await mammoth.extractRawText({ buffer });

    const text = result.value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    console.log(`✅ Extraídos ${lines.length} párrafos no vacíos`);

    // Construir estructura
    const sections = this.detectSections(lines);
    const articles = this.extractArticles(lines);

    const document: LegalDocument = {
      metadata: {
        title: this.extractTitle(lines),
        date: '2026-04-22',
        source_path: sourcePath,
        extraction_date: new Date().toISOString(),
        parser_version: '0.1.0',
      },
      sections,
      articles,
      parsing_stats: {
        total_sections: sections.length,
        total_articles: articles.length,
        permanent_articles: articles.filter(a => a.article_type === 'permanent').length,
        transitory_articles: articles.filter(a => a.article_type === 'transitory').length,
        parsing_warnings: this.ctx.warnings,
        ambiguities: this.ctx.ambiguities,
      },
    };

    return document;
  }

  private extractTitle(lines: string[]): string {
    // Buscar el título principal en las primeras líneas
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i];
      if (
        line.toLowerCase().includes('proyecto de ley') ||
        line.toLowerCase().includes('mensaje') ||
        line.toLowerCase().includes('reconstrucción')
      ) {
        return line;
      }
    }
    return 'Proyecto de Ley - Reconstrucción';
  }

  private detectSections(lines: string[]): Section[] {
    const sections: Section[] = [];
    let currentType: SectionType = 'other';
    let currentTitle = '';
    let currentText: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextSectionType = this.detectSectionType(line);

      if (nextSectionType) {
        // Guardar sección anterior si existe
        if (currentTitle || currentText.length > 0) {
          sections.push({
            id: `section-${this.ctx.sectionCounter++}`,
            type: currentType,
            title: currentTitle || 'Sin título',
            raw_text: currentText.join('\n'),
            order: sections.length,
          });
        }

        // Iniciar nueva sección
        currentType = nextSectionType;
        currentTitle = line;
        currentText = [];
      } else {
        currentText.push(line);
      }
    }

    // Guardar última sección
    if (currentTitle || currentText.length > 0) {
      sections.push({
        id: `section-${this.ctx.sectionCounter++}`,
        type: currentType,
        title: currentTitle || 'Sin título',
        raw_text: currentText.join('\n'),
        order: sections.length,
      });
    }

    console.log(`📋 Detectadas ${sections.length} secciones`);
    return sections;
  }

  private detectSectionType(line: string): SectionType | null {
    const lower = line.toLowerCase();

    if (lower.includes('antecedentes')) return 'antecedentes';
    if (lower.includes('fundamentos')) return 'fundamentos';
    if (lower.match(/eje.*temático/)) return 'eje_tematico';
    if (lower.includes('artículos permanentes')) return 'articulos_permanentes';
    if (lower.includes('artículos transitorios')) return 'articulos_transitorios';

    // Detectar encabezados numerados romanos: I., II., III., etc.
    if (line.match(/^[IVX]+\.\s/)) return 'eje_tematico';

    return null;
  }

  private readonly ORDINALS: Record<string, number> = {
    'primero': 1, 'segundo': 2, 'tercero': 3, 'cuarto': 4, 'quinto': 5,
    'sexto': 6, 'séptimo': 7, 'octavo': 8, 'noveno': 9, 'décimo': 10,
    'décimo primero': 11, 'décimo segundo': 12, 'décimo tercero': 13,
    'décimo cuarto': 14, 'décimo quinto': 15, 'décimo sexto': 16,
    'décimo séptimo': 17, 'décimo octavo': 18, 'décimo noveno': 19,
    'vigésimo': 20,
  };

  private parseOrdinal(word: string): number | null {
    const normalized = word.toLowerCase().trim();
    return this.ORDINALS[normalized] ?? null;
  }

  private extractArticles(lines: string[]): Article[] {
    const articles: Article[] = [];
    // Solo procesar artículos dentro del articulado formal (después de "PROYECTO DE LEY:")
    let inArticulado = false;
    let currentSection: 'permanent' | 'transitory' = 'permanent';
    let currentArticleNumber: number | null = null;
    let currentArticleText: string[] = [];

    const saveCurrentArticle = () => {
      if (currentArticleNumber !== null && currentArticleText.length > 0) {
        articles.push(this.buildArticle(currentArticleNumber, currentArticleText, currentSection));
        currentArticleNumber = null;
        currentArticleText = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detectar inicio del articulado formal
      if (!inArticulado) {
        if (line.trim() === 'PROYECTO DE LEY:') {
          inArticulado = true;
        }
        continue;
      }

      // Detectar artículo transitorio: "Artículo primero transitorio.-"
      // Buscar "Artículo <ordinal> transitorio" al inicio de la línea
      const transitoryMatch = line.match(/^Art[ií]culo\s+(.+?)\s+transitorio[\.\-]/i);
      if (transitoryMatch) {
        saveCurrentArticle();
        // Intentar mapear el ordinal compuesto (ej: "décimo primero")
        const ordinalText = transitoryMatch[1].toLowerCase().trim();
        const num = this.parseOrdinal(ordinalText);
        if (num !== null) {
          currentSection = 'transitory';
          currentArticleNumber = num;
          currentArticleText = [line];
        } else {
          this.ctx.warnings.push(`Ordinal transitorio no reconocido: "${ordinalText}"`);
        }
        continue;
      }

      // Detectar artículo permanente numerado.
      // El Artículo 1 del PDL empieza con comilla (apertura de la cita del proyecto).
      // Los artículos 2-33 NO tienen comilla inicial — los que tienen comilla son
      // sub-artículos de leyes modificadas y deben ignorarse.
      const hasLeadingQuote = /^["\u201c]/.test(line);
      const isFirstArticle = currentArticleNumber === null;
      const permanentMatch = line.match(/^["\u201c]?Art[ií]culo\s+(\d+)[°º]?[\.\-]/i);
      if (permanentMatch && (!hasLeadingQuote || isFirstArticle)) {
        const hasSuffix = line.match(/^["\u201c]?Art[ií]culo\s+\d+\s*(bis|ter|qu[aá]ter|quinquies)/i);
        if (!hasSuffix) {
          saveCurrentArticle();
          currentSection = 'permanent';
          currentArticleNumber = parseInt(permanentMatch[1]);
          currentArticleText = [line];
          continue;
        }
      }

      // Acumular texto del artículo actual
      if (currentArticleNumber !== null) {
        currentArticleText.push(line);
      }
    }

    saveCurrentArticle();

    console.log(`📜 Extraídos ${articles.length} artículos`);
    return articles;
  }

  private buildArticle(
    articleNumber: number,
    lines: string[],
    section: 'permanent' | 'transitory'
  ): Article {
    return {
      article_id: `art-${section}-${articleNumber}`,
      article_number: articleNumber,
      article_type: section as ArticleType,
      title: section === 'transitory'
        ? `Artículo ${articleNumber}° transitorio`
        : `Artículo ${articleNumber}`,
      raw_text: lines.join('\n'),
      order: this.ctx.articleCounter++,
    };
  }
}

// ===== Ejecución =====

async function main() {
  console.log('🚀 Iniciando parser de documento legal\n');

  const parser = new DocxParser();
  const document = await parser.parse(SOURCE_PATH);

  // Guardar JSON
  const outputPath = join(process.cwd(), OUTPUT_PATH);
  writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');

  console.log(`\n💾 Archivo generado: ${OUTPUT_PATH}`);
  console.log('\n📊 Estadísticas:');
  console.log(`   Total de secciones: ${document.parsing_stats?.total_sections}`);
  console.log(`   Total de artículos: ${document.parsing_stats?.total_articles}`);
  console.log(`   Artículos permanentes: ${document.parsing_stats?.permanent_articles}`);
  console.log(`   Artículos transitorios: ${document.parsing_stats?.transitory_articles}`);

  if (document.parsing_stats?.parsing_warnings.length) {
    console.log('\n⚠️  Advertencias:');
    document.parsing_stats.parsing_warnings.forEach(w => console.log(`   - ${w}`));
  }

  if (document.parsing_stats?.ambiguities.length) {
    console.log('\n❓ Ambigüedades detectadas:');
    document.parsing_stats.ambiguities.forEach(a => console.log(`   - ${a}`));
  }

  console.log('\n✅ Parsing completado\n');
}

main().catch(console.error);
