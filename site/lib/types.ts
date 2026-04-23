export interface ArticleAnalysis {
  plain_explanation: string;
  what_changes: string;
  who_is_affected: string[];
  gaps_in_message: string;
  open_questions: string[];
  analysis_note: string;
  citizen_alert: string[];
}

export interface LegalReference {
  law_name: string;
  raw_mention: string;
  modification_type?: string;
}

export interface NumericValue {
  type: string;
  value: string;
  unit: string;
  context: string;
}

export interface Article {
  article_id: string;
  article_number: number;
  article_type: 'permanent' | 'transitory';
  title: string;
  raw_text: string;
  order: number;
  theme_tags: string[];
  axis_tags: string[];
  legal_references: LegalReference[];
  institutions: string[];
  numeric_values: NumericValue[];
  cross_references: string[];
  message_description: string | null;
  mini_description?: string;
  llm_analysis?: ArticleAnalysis;
  llm_analysis_date?: string;
  llm_model?: string;
}

export interface EnrichedData {
  metadata: Record<string, unknown>;
  articles: Article[];
}
