import { readFileSync } from 'fs';
import path from 'path';
import type { Article, EnrichedData } from './types';

let _cache: Article[] | null = null;

export function getAllArticles(): Article[] {
  if (_cache) return _cache;

  // En producción (Vercel) o tras prebuild: leer desde site/data/
  // En desarrollo local: intentar primero la copia local, luego la ruta externa
  const candidates = [
    path.join(process.cwd(), 'data', 'articulos_enriquecidos.json'),
    path.join(process.cwd(), '..', 'datos', 'enriquecido', 'articulos_enriquecidos.json'),
  ];

  let filePath: string | null = null;
  for (const p of candidates) {
    try { readFileSync(p); filePath = p; break; } catch { /* try next */ }
  }
  if (!filePath) throw new Error('No se encontró articulos_enriquecidos.json. Ejecuta npm run build o npm run prebuild.');

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
