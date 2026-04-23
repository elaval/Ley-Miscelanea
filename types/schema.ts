/**
 * Tipos e interfaces para la estructura del documento legal
 * Estos tipos representan la arquitectura de datos del proyecto
 */

// ===== Metadata del documento =====

export interface DocumentMetadata {
  title: string;
  subtitle?: string;
  date: string;
  source_path: string;
  extraction_date: string;
  parser_version: string;
}

// ===== Secciones del documento =====

export type SectionType =
  | 'header'
  | 'antecedentes'
  | 'fundamentos'
  | 'eje_tematico'
  | 'contenido'
  | 'articulos_permanentes'
  | 'articulos_transitorios'
  | 'other';

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  raw_text: string;
  subsections?: Section[];
  order: number;
}

// ===== Artículos =====

export type ArticleType = 'permanent' | 'transitory';

export interface LegalReference {
  law_name: string;
  article_number?: string;
  modification_type?: 'modifica' | 'deroga' | 'reemplaza' | 'agrega' | 'intercala' | 'sustituye';
  raw_mention: string;
}

export interface Institution {
  name: string;
  normalized_name?: string;
  role?: string;
}

export interface NumericValue {
  type: 'monto' | 'porcentaje' | 'plazo' | 'tasa' | 'umbral';
  value: string;
  unit?: string;
  context: string;
}

export interface Article {
  article_id: string;
  article_number: number;
  article_type: ArticleType;
  title: string;
  raw_text: string;

  // Metadata básica
  section_id?: string;
  order: number;

  // Campos para enriquecimiento (vacíos en documento_base)
  theme_tags?: string[];
  axis_tags?: string[];
  legal_references?: LegalReference[];
  institutions?: Institution[];
  numeric_values?: NumericValue[];
  cross_references?: string[];

  // Campos para análisis LLM (vacíos en documento_base)
  llm_analysis?: LLMAnalysis;
}

// ===== Análisis LLM =====

export interface LLMAnalysis {
  plain_explanation?: string;
  what_changes?: string;
  who_is_affected?: string[];
  policy_goal?: string;
  open_questions?: string[];
  possible_tensions?: string[];
  generated_date?: string;
  model_version?: string;
}

// ===== Documento completo =====

export interface LegalDocument {
  metadata: DocumentMetadata;
  sections: Section[];
  articles: Article[];

  // Estadísticas del parsing
  parsing_stats?: {
    total_sections: number;
    total_articles: number;
    permanent_articles: number;
    transitory_articles: number;
    parsing_warnings: string[];
    ambiguities: string[];
  };
}

// ===== Enriquecimiento =====

export interface EnrichedArticle extends Article {
  theme_tags: string[];
  axis_tags: string[];
  legal_references: LegalReference[];
  institutions: Institution[];
  numeric_values: NumericValue[];
  cross_references: string[];
}

export interface EnrichedDocument {
  metadata: DocumentMetadata;
  articles: EnrichedArticle[];
  enrichment_stats?: {
    articles_with_legal_refs: number;
    articles_with_institutions: number;
    articles_with_numeric_values: number;
    unique_laws_mentioned: number;
    unique_institutions: number;
  };
}
