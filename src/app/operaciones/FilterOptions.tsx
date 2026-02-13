'use client';

import { Filter, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface FilterOptionsProps {
    promociones: { id: string; nombre: string }[];
    agentes: { id: string; nombre: string }[];
}

export default function FilterOptions({ promociones, agentes }: FilterOptionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const currentEstado = searchParams.get('estado') || '';
    const currentPromocion = searchParams.get('promocion') || '';
    const currentAgente = searchParams.get('agente') || '';

    function updateFilter(name: string, value: string) {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }

    function clearFilters() {
        const params = new URLSearchParams(searchParams);
        params.delete('estado');
        params.delete('promocion');
        params.delete('agente');

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
            setIsOpen(false);
        });
    }

    const hasFilters = currentEstado || currentPromocion || currentAgente;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition font-medium text-sm ${hasFilters
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
            >
                <Filter size={18} className={isPending ? 'animate-pulse' : ''} />
                <span>Filtros</span>
                {hasFilters && (
                    <span className="bg-white text-slate-900 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {[currentEstado, currentPromocion, currentAgente].filter(Boolean).length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="font-bold text-slate-900 text-sm">Opciones de Filtro</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Estado */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</label>
                            <select
                                value={currentEstado}
                                onChange={(e) => updateFilter('estado', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="">Todos los estados</option>
                                <option value="ACTIVA">Activa</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select>
                        </div>

                        {/* Promoción */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Promoción</label>
                            <select
                                value={currentPromocion}
                                onChange={(e) => updateFilter('promocion', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="">Todas las promociones</option>
                                {promociones.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Agente */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agente</label>
                            <select
                                value={currentAgente}
                                onChange={(e) => updateFilter('agente', e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="">Todos los agentes</option>
                                {agentes.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre}</option>
                                ))}
                                <option value="DIRECTA">Venta Directa (Sin Agente)</option>
                            </select>
                        </div>

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
