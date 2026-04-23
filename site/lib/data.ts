import { readFileSync } from 'fs';
import path from 'path';
import type { Article, EnrichedData } from './types';

let _cache: Article[] | null = null;

export function getAllArticles(): Article[] {
  if (_cache) return _cache;

  // Leer siempre desde site/data/ (copiado en prebuild via scripts/copy-data.mjs)
  const filePath = path.join(process.cwd(), 'data', 'articulos_enriquecidos.json');
  try { readFileSync(filePath); } catch {
    throw new Error('No se encontró articulos_enriquecidos.json en site/data/. Ejecuta: npm run build (o node scripts/copy-data.mjs).');
  }

  const raw = readFileSync(filePath, 'utf-8');
  const data: EnrichedData = JSON.parse(raw);
  _cache = data.articles.sort((a, b) => a.order - b.order);
  return _cache;
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find(a => a.article_id === id);
}

export function getPermanentArticles(): Article[] {
  return getAllArticles().filter(a => a.article_type === 'permanent');
}

export function getTransitoryArticles(): Article[] {
  return getAllArticles().filter(a => a.article_type === 'transitory');
}

export const AXIS_LABELS: Record<string, string> = {
  reconstruccion_fisica: 'Reconstrucción física',
  reconstruccion_economica: 'Reconstrucción económica',
  reconstruccion_institucional: 'Reconstrucción institucional',
  reconstruccion_fiscal: 'Reconstrucción fiscal',
  reconstrucción_física: 'Reconstrucción física',
  reconstrucción_económica: 'Reconstrucción económica',
  reconstrucción_institucional: 'Reconstrucción institucional',
  reconstrucción_fiscal: 'Reconstrucción fiscal',
};

export const THEME_LABELS: Record<string, string> = {
  tributario: 'Tributario',
  laboral: 'Laboral',
  ambiental: 'Ambiental',
  institucional: 'Institucional',
  fiscal: 'Fiscal',
  vivienda: 'Vivienda',
  educacion: 'Educación',
  'educación': 'Educación',
  inversión: 'Inversión',
  inversion: 'Inversión',
  penal: 'Penal',
  patrimonial: 'Patrimonial',
  minería: 'Minería',
  mineria: 'Minería',
};
