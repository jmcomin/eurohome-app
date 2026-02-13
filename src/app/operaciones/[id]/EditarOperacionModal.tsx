'use client';

import { useState } from "react";
import { Edit2, X, Save, Building2, Home, Calendar, Percent } from "lucide-react";
import { actualizarOperacion } from "../actions";

interface EditarOperacionModalProps {
    operacion: {
        id: string;
        viviendaId: string;
        agenteId: string | null;
        pct_comision_agente: number;
        fecha_inicio: Date;
        promocionId: string;
    };
    agentes: { id: string; nombre: string }[];
    viviendas: { id: string; codigo: string; nombre?: string | null; planta: string; letra: string; precio_sin_iva: number }[];
}

export default function EditarOperacionModal({ operacion, agentes, viviendas }: EditarOperacionModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        try {
            const result = await actualizarOperacion(operacion.id, formData);
            if (result.success) {
                setIsOpen(false);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Error al guardar los cambios.");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-50 transition shadow-sm font-black text-xs uppercase tracking-widest"
            >
                <Edit2 size={16} />
                <span>Editar Detalles</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print text-left">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-slate-900">
                        <Edit2 size={20} className="text-blue-600" />
                        <h3 className="font-black uppercase tracking-widest text-sm text-slate-900">Editar Detalles de Operación</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Vivienda */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <Home size={10} className="mr-1" /> Vivienda / Unidad
                            </label>
                            <select
                                name="viviendaId"
                                defaultValue={operacion.viviendaId}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700 appearance-none"
                            >
                                {viviendas
                                    .sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' }))
                                    .map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.codigo} - {v.nombre || `${v.planta}${v.letra}`} ({v.precio_sin_iva.toLocaleString('es-ES', { maximumFractionDigits: 0 })})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Fecha Inicio */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <Calendar size={10} className="mr-1" /> Fecha de Inicio
                            </label>
                            <input
                                name="fecha_inicio"
                                required
                                type="date"
                                defaultValue={new Date(operacion.fecha_inicio).toISOString().split('T')[0]}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                        {/* Agente */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <Building2 size={10} className="mr-1" /> Agente Comercial
                            </label>
                            <select
                                name="agenteId"
                                defaultValue={operacion.agenteId || "DIRECTA"}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700 appearance-none"
                            >
                                <option value="DIRECTA">Venta Directa (Sin Agente)</option>
                                {agentes.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Comisión Agente */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <Percent size={10} className="mr-1" /> % Comisión Agente
                            </label>
                            <input
                                name="pct_comision_agente"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                defaultValue={operacion.pct_comision_agente}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center space-x-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Guardar Cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
