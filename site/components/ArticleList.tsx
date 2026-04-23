'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Article } from '@/lib/types';

interface Props {
  permanent: Article[];
  transitory: Article[];
  onNavigate?: () => void;
}

// ── Axis config ──────────────────────────────────────────────────────────────

type AxisKey = 'reconstruccion_fisica' | 'reconstruccion_economica' | 'reconstruccion_institucional' | 'reconstruccion_fiscal';

const AXIS_CONFIG: Record<AxisKey, { label: string; short: string; dot: string; chip: string }> = {
  reconstruccion_fisica:        { label: 'Reconstrucción física',        short: 'Física',      dot: 'bg-green-500',  chip: 'bg-green-100 text-green-700' },
  reconstruccion_economica:     { label: 'Reconstrucción económica',     short: 'Económica',   dot: 'bg-blue-500',   chip: 'bg-blue-100 text-blue-700' },
  reconstruccion_institucional: { label: 'Reconstrucción institucional', short: 'Institucional', dot: 'bg-purple-500', chip: 'bg-purple-100 text-purple-700' },
  reconstruccion_fiscal:        { label: 'Reconstrucción fiscal',        short: 'Fiscal',      dot: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700' },
};

const AXIS_KEYS = Object.keys(AXIS_CONFIG) as AxisKey[];

type AxisFilter = 'all' | AxisKey;

function normalizeAxis(tag: string): AxisKey | null {
  const n = tag
    .replace('reconstrucción', 'reconstruccion')
    .replace('económica', 'economica')
    .replace('física', 'fisica');
  return AXIS_KEYS.includes(n as AxisKey) ? (n as AxisKey) : null;
}

function getArticleAxes(article: Article): AxisKey[] {
  return [...new Set(article.axis_tags.map(normalizeAxis).filter(Boolean) as AxisKey[])];
}

// ── Mini-description fallback ────────────────────────────────────────────────

function miniDesc(article: Article): string {
  if (article.mini_description) return article.mini_description;
  const exp = article.llm_analysis?.plain_explanation ?? '';
  if (!exp) return '';
  const first = exp.split(/(?<=[.!?])\s+/)[0] ?? exp;
  return first.length > 90 ? first.slice(0, 87).trimEnd() + '…' : first;
}

// ── ArticleItem ──────────────────────────────────────────────────────────────

function ArticleItem({
  article,
  active,
  onNavigate,
}: {
  article: Article;
  active: boolean;
  onNavigate?: () => void;
}) {
  const axes = getArticleAxes(article);

  return (
    <Link
      href={`/articulos/${article.article_id}`}
      onClick={onNavigate}
      className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`font-medium ${active ? 'text-white' : 'text-slate-900'}`}>
          {article.article_type === 'permanent'
            ? `Art. ${article.article_number}`
            : `Transitorio ${article.article_number}`}
        </span>
        {/* Axis dots — one per axis, full label as tooltip */}
        {axes.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            {axes.map(key => (
              <span
                key={key}
                title={AXIS_CONFIG[key].label}
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${AXIS_CONFIG[key].dot} ${
                  active ? 'opacity-70' : ''
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {miniDesc(article) && (
        <p className={`text-[11px] mt-0.5 line-clamp-2 leading-snug ${
          active ? 'text-slate-300' : 'text-slate-500'
        }`}>
          {miniDesc(article)}
        </p>
      )}
    </Link>
  );
}

// ── Axis legend (shown once at top of list) ──────────────────────────────────

function AxisLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 bg-slate-50 border-b border-slate-100">
      {AXIS_KEYS.map(key => (
        <span key={key} className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className={`w-2 h-2 rounded-full ${AXIS_CONFIG[key].dot}`} />
          {AXIS_CONFIG[key].short}
        </span>
      ))}
    </div>
  );
}

// ── ArticleList ──────────────────────────────────────────────────────────────

export default function ArticleList({ permanent, transitory, onNavigate }: Props) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<'all' | 'permanent' | 'transitory'>('all');
  const [axisFilter, setAxisFilter] = useState<AxisFilter>('all');

  const filter = (articles: Article[]) =>
    articles.filter(a => {
      // Axis filter
      if (axisFilter !== 'all') {
        const axes = getArticleAxes(a);
        if (!axes.includes(axisFilter)) return false;
      }
      // Text search
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.theme_tags.some(t => t.toLowerCase().includes(q)) ||
        a.axis_tags.some(t => t.toLowerCase().includes(q)) ||
        (a.mini_description ?? '').toLowerCase().includes(q) ||
        (a.llm_analysis?.plain_explanation ?? '').toLowerCase().includes(q)
      );
    });

  const showPermanent = section !== 'transitory';
  const showTransitory = section !== 'permanent';
  const filteredPerm = filter(permanent);
  const filteredTrans = filter(transitory);
  const totalShown = (showPermanent ? filteredPerm.length : 0) + (showTransitory ? filteredTrans.length : 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search + filters */}
      <div className="p-3 border-b border-slate-200 space-y-2">
        <input
          type="text"
          placeholder="Buscar artículo o tema…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder:text-slate-400"
        />

        {/* Type filter */}
        <div className="flex gap-1">
          {(['all', 'permanent', 'transitory'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex-1 text-[11px] py-1 rounded font-medium transition-colors ${
                section === s
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'permanent' ? 'Permanentes' : 'Transitorios'}
            </button>
          ))}
        </div>

        {/* Axis filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setAxisFilter('all')}
            className={`text-[11px] px-2 py-1 rounded font-medium transition-colors ${
              axisFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos los ejes
          </button>
          {AXIS_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setAxisFilter(axisFilter === key ? 'all' : key)}
              className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded font-medium transition-colors ${
                axisFilter === key
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                axisFilter === key ? 'bg-white/80' : AXIS_CONFIG[key].dot
              }`} />
              {AXIS_CONFIG[key].short}
            </button>
          ))}
        </div>

        {/* Active filter summary */}
        {(axisFilter !== 'all' || query) && (
          <p className="text-[10px] text-slate-400">
            {totalShown} artículo{totalShown !== 1 ? 's' : ''}
            {axisFilter !== 'all' && ` · eje ${AXIS_CONFIG[axisFilter].short}`}
            {query && ` · "${query}"`}
            <button
              onClick={() => { setAxisFilter('all'); setQuery(''); }}
              className="ml-1.5 text-slate-500 hover:text-slate-800 underline"
            >
              limpiar
            </button>
          </p>
        )}
      </div>

      {/* Axis color legend */}
      <AxisLegend />

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {showPermanent && filteredPerm.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 py-1.5">
              Permanentes ({filteredPerm.length})
            </p>
            <div className="space-y-0.5">
              {filteredPerm.map(a => (
                <ArticleItem
                  key={a.article_id}
                  article={a}
                  active={pathname === `/articulos/${a.article_id}`}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
        {showTransitory && filteredTrans.length > 0 && (
          <div className={showPermanent && filteredPerm.length > 0 ? 'mt-3' : ''}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 py-1.5">
              Transitorios ({filteredTrans.length})
            </p>
            <div className="space-y-0.5">
              {filteredTrans.map(a => (
                <ArticleItem
                  key={a.article_id}
                  article={a}
                  active={pathname === `/articulos/${a.article_id}`}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
        {filteredPerm.length === 0 && filteredTrans.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Sin resultados</p>
        )}
      </div>
    </div>
  );
}
