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

const AXIS_COLORS: Record<string, string> = {
  reconstruccion_fisica: 'bg-green-100 text-green-700',
  reconstruccion_economica: 'bg-blue-100 text-blue-700',
  reconstruccion_institucional: 'bg-purple-100 text-purple-700',
  reconstruccion_fiscal: 'bg-orange-100 text-orange-700',
  reconstrucción_física: 'bg-green-100 text-green-700',
  reconstrucción_económica: 'bg-blue-100 text-blue-700',
  reconstrucción_institucional: 'bg-purple-100 text-purple-700',
  reconstrucción_fiscal: 'bg-orange-100 text-orange-700',
};

function normalizeAxis(tag: string): string {
  return tag
    .replace('reconstrucción', 'reconstruccion')
    .replace('económica', 'economica')
    .replace('física', 'fisica')
    .replace('institucional', 'institucional')
    .replace('fiscal', 'fiscal');
}

/** Devuelve la mini-descripción generada, o el primer fragmento de plain_explanation como fallback. */
function miniDesc(article: Article): string {
  if (article.mini_description) return article.mini_description;
  const exp = article.llm_analysis?.plain_explanation ?? '';
  if (!exp) return '';
  // Fallback: primera oración truncada a 90 chars
  const first = exp.split(/(?<=[.!?])\s+/)[0] ?? exp;
  return first.length > 90 ? first.slice(0, 87).trimEnd() + '…' : first;
}

function ArticleItem({ article, active, onNavigate }: { article: Article; active: boolean; onNavigate?: () => void }) {
  const axis = article.axis_tags[0];
  const colorClass = axis ? (AXIS_COLORS[axis] ?? 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600';

  return (
    <Link
      href={`/articulos/${article.article_id}`}
      onClick={onNavigate}
      className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-slate-800 text-white'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`font-medium ${active ? 'text-white' : 'text-slate-900'}`}>
          {article.article_type === 'permanent'
            ? `Art. ${article.article_number}`
            : `Transitorio ${article.article_number}`}
        </span>
        {axis && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
            active ? 'bg-white/20 text-white' : colorClass
          }`}>
            {axisShort(normalizeAxis(axis))}
          </span>
        )}
      </div>
      {miniDesc(article) && (
        <p className={`text-[11px] mt-0.5 line-clamp-2 leading-snug ${active ? 'text-slate-300' : 'text-slate-500'}`}>
          {miniDesc(article)}
        </p>
      )}
    </Link>
  );
}

function axisShort(key: string): string {
  const map: Record<string, string> = {
    reconstruccion_fisica: 'Física',
    reconstruccion_economica: 'Económica',
    reconstruccion_institucional: 'Institucional',
    reconstruccion_fiscal: 'Fiscal',
  };
  return map[key] ?? key;
}

export default function ArticleList({ permanent, transitory, onNavigate }: Props) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<'all' | 'permanent' | 'transitory'>('all');

  const filter = (articles: Article[]) =>
    articles.filter(a => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.theme_tags.some(t => t.toLowerCase().includes(q)) ||
        a.axis_tags.some(t => t.toLowerCase().includes(q)) ||
        a.llm_analysis?.plain_explanation.toLowerCase().includes(q)
      );
    });

  const showPermanent = section !== 'transitory';
  const showTransitory = section !== 'permanent';
  const filteredPerm = filter(permanent);
  const filteredTrans = filter(transitory);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-slate-200">
        <input
          type="text"
          placeholder="Buscar artículo o tema…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder:text-slate-400"
        />
        <div className="flex gap-1 mt-2">
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
      </div>

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
