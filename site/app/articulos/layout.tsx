import { getPermanentArticles, getTransitoryArticles } from '@/lib/data';
import ArticleList from '@/components/ArticleList';

export default function ArticulosLayout({ children }: { children: React.ReactNode }) {
  const permanent = getPermanentArticles();
  const transitory = getTransitoryArticles();

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-200 flex flex-col bg-white">
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
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
