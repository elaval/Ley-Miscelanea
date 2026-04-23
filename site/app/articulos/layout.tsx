import { getPermanentArticles, getTransitoryArticles } from '@/lib/data';
import ArticleList from '@/components/ArticleList';
import MobileHeader from '@/components/MobileHeader';

export default function ArticulosLayout({ children }: { children: React.ReactNode }) {
  const permanent = getPermanentArticles();
  const transitory = getTransitoryArticles();

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-white">
      {/* Mobile: fixed top bar + slide-in drawer */}
      <MobileHeader permanent={permanent} transitory={transitory} />

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-slate-200 flex-col bg-white">
        <div className="px-4 py-4 border-b border-slate-200">
          <h1 className="text-sm font-bold text-slate-900 leading-tight">
            Ley Miscelánea de Reconstrucción
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">22 de abril de 2026</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ArticleList permanent={permanent} transitory={transitory} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 min-h-0">
        {children}
      </main>
    </div>
  );
}
