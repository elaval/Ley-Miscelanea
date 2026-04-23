'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Article } from '@/lib/types';
import ArticleList from './ArticleList';

interface Props {
  permanent: Article[];
  transitory: Article[];
}

export default function MobileHeader({ permanent, transitory }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // On the article list index page, the list is shown inline — no header needed
  if (pathname === '/articulos') return null;

  return (
    <>
      {/* Fixed top bar — mobile only */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-slate-200 flex items-center gap-3 px-4 h-14 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú de artículos"
          className="p-1 -ml-1 text-slate-700 shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight truncate">
            Ley Miscelánea de Reconstrucción
          </p>
          <p className="text-xs text-slate-500">22 de abril de 2026</p>
        </div>
      </header>

      {/* Spacer to push content below fixed bar */}
      <div className="md:hidden h-14 shrink-0" />

      {/* Drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Side panel */}
          <div className="w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col h-full shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
              <p className="text-sm font-bold text-slate-900 leading-tight">
                Ley Miscelánea de Reconstrucción
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ArticleList
                permanent={permanent}
                transitory={transitory}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
