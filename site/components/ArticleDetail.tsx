'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Article } from '@/lib/types';

const AXIS_BADGE: Record<string, { label: string; className: string }> = {
  reconstruccion_fisica:       { label: 'Reconstrucción física',         className: 'bg-green-100 text-green-800 border-green-200' },
  reconstruccion_economica:    { label: 'Reconstrucción económica',       className: 'bg-blue-100 text-blue-800 border-blue-200' },
  reconstruccion_institucional:{ label: 'Reconstrucción institucional',   className: 'bg-purple-100 text-purple-800 border-purple-200' },
  reconstruccion_fiscal:       { label: 'Reconstrucción fiscal',          className: 'bg-orange-100 text-orange-800 border-orange-200' },
  reconstrucción_física:       { label: 'Reconstrucción física',         className: 'bg-green-100 text-green-800 border-green-200' },
  reconstrucción_económica:    { label: 'Reconstrucción económica',       className: 'bg-blue-100 text-blue-800 border-blue-200' },
  reconstrucción_institucional:{ label: 'Reconstrucción institucional',   className: 'bg-purple-100 text-purple-800 border-purple-200' },
  reconstrucción_fiscal:       { label: 'Reconstrucción fiscal',          className: 'bg-orange-100 text-orange-800 border-orange-200' },
};

function SectionCard({
  label,
  icon,
  color,
  labelColor = 'text-slate-600',
  children,
}: {
  label: string;
  icon: string;
  color: string;
  labelColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border ${color} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>
        {icon} {label}
      </p>
      {children}
    </div>
  );
}

function CollapsibleText({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const preview = text.slice(0, 300);
  const isLong = text.length > 300;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          📄 {label}
        </span>
        <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
            {text}
          </p>
        </div>
      )}
      {!open && (
        <p className="px-4 pb-3 text-sm text-slate-500 italic">
          {isLong ? preview + '…' : text}
        </p>
      )}
    </div>
  );
}

export default function ArticleDetail({ article }: { article: Article }) {
  const analysis = article.llm_analysis;
  const isTransitory = article.article_type === 'transitory';

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">
      {/* Mobile back button */}
      <div className="md:hidden">
        <Link
          href="/articulos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors py-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Todos los artículos
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
            isTransitory
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {isTransitory ? 'Artículo transitorio' : 'Artículo permanente'}
          </span>
          {article.axis_tags.map(tag => {
            const badge = AXIS_BADGE[tag];
            if (!badge) return null;
            return (
              <span key={tag} className={`text-xs px-2 py-1 rounded-full border font-medium ${badge.className}`}>
                {badge.label}
              </span>
            );
          })}
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">{article.title}</h1>
        {article.theme_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {article.theme_tags.map(t => (
              <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Descripción oficial */}
      {article.message_description && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2">
            🏛 Descripción oficial del Ejecutivo
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">
            {article.message_description}
          </p>
        </div>
      )}

      {/* Texto legal colapsable */}
      <CollapsibleText text={article.raw_text} label="Texto legal oficial" />

      {/* Análisis LLM */}
      {analysis ? (
        <>
          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-4">
              Análisis generado con IA · {article.llm_model} · Revisar con criterio propio
            </p>
          </div>

          {/* Qué hace este artículo */}
          <SectionCard
            label="¿Qué hace este artículo?"
            icon="💡"
            color="border-sky-200 bg-sky-50"
            labelColor="text-sky-800"
          >
            <p className="text-base text-sky-900 leading-relaxed">
              {analysis.plain_explanation}
            </p>
          </SectionCard>

          {/* Qué cambia */}
          <SectionCard
            label="¿Qué cambia?"
            icon="⚖️"
            color="border-slate-200 bg-white"
          >
            <p className="text-sm text-slate-800 leading-relaxed">
              {analysis.what_changes}
            </p>
          </SectionCard>

          {/* A quién afecta */}
          <SectionCard
            label="¿A quién afecta?"
            icon="👥"
            color="border-slate-200 bg-white"
          >
            <ul className="space-y-2">
              {analysis.who_is_affected.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-800">
                  <span className="text-slate-400 mt-0.5 shrink-0">→</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Lo que el mensaje oficial no dice */}
          {analysis.gaps_in_message &&
           analysis.gaps_in_message !== 'El texto es consistente con la descripción oficial.' ? (
            <SectionCard
              label="Lo que la descripción oficial no menciona"
              icon="🔍"
              color="border-violet-200 bg-violet-50"
              labelColor="text-violet-800"
            >
              <p className="text-sm text-violet-900 leading-relaxed">
                {analysis.gaps_in_message}
              </p>
            </SectionCard>
          ) : analysis.gaps_in_message ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex gap-2 items-center">
              <span>✅</span>
              <p className="text-sm text-green-800">
                El texto legal es consistente con la descripción oficial.
              </p>
            </div>
          ) : null}

          {/* Preguntas abiertas */}
          {analysis.open_questions.length > 0 && (
            <SectionCard
              label="Preguntas que el texto deja abiertas"
              icon="❓"
              color="border-slate-200 bg-white"
            >
              <ol className="space-y-2 list-none">
                {analysis.open_questions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-800">
                    <span className="font-semibold text-slate-400 shrink-0">{i + 1}.</span>
                    <span className="leading-relaxed">{q}</span>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          {/* Alertas ciudadanas */}
          {analysis.citizen_alert &&
           analysis.citizen_alert.length > 0 &&
           analysis.citizen_alert[0] !== 'No se identifican efectos latentes relevantes más allá de lo ya señalado.' && (
            <SectionCard
              label="Efectos que podrían pasar desapercibidos"
              icon="⚠️"
              color="border-amber-200 bg-amber-50"
              labelColor="text-amber-800"
            >
              <p className="text-xs text-amber-700 mb-3">
                Esta sección incluye efectos posibles, no certezas. Cada punto está anclado en el texto pero requiere interpretación.
              </p>
              <ul className="space-y-3">
                {analysis.citizen_alert.map((alert, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-900">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{alert}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* Nota de análisis */}
          {analysis.analysis_note && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold">Limitación del análisis:</span> {analysis.analysis_note}
              </p>
            </div>
          )}

          {/* Leyes referenciadas */}
          {article.legal_references.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                📚 Leyes que modifica o referencia
              </p>
              <ul className="space-y-1.5">
                {article.legal_references.map((ref, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-slate-400 shrink-0">→</span>
                    <span>
                      <span className="font-medium">{ref.law_name}</span>
                      {ref.modification_type && (
                        <span className="ml-2 text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ref.modification_type}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-500 text-sm">Este artículo aún no tiene análisis generado.</p>
        </div>
      )}
    </div>
  );
}
