export default function ArticulosIndex() {
  return (
    <div className="flex items-center justify-center h-full text-center px-8">
      <div>
        <p className="text-4xl mb-4">⚖️</p>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          Selecciona un artículo
        </h2>
        <p className="text-sm text-slate-500 max-w-xs">
          Usa el panel izquierdo para navegar entre los 33 artículos permanentes
          y 17 transitorios del proyecto de ley.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-left">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="font-semibold text-slate-700 mb-1">🟢 Reconstrucción física</p>
            <p className="text-slate-500">Obras, vivienda, infraestructura</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="font-semibold text-slate-700 mb-1">🔵 Reconstrucción económica</p>
            <p className="text-slate-500">Empleo, subsidios, actividad productiva</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="font-semibold text-slate-700 mb-1">🟣 Reconstrucción institucional</p>
            <p className="text-slate-500">Permisos, organismos, procedimientos</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="font-semibold text-slate-700 mb-1">🟠 Reconstrucción fiscal</p>
            <p className="text-slate-500">Impuestos, gasto público, financiamiento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
