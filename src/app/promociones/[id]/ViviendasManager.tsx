"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Save, AlertCircle, FileText, Trash } from "lucide-react";
import { upsertVivienda, deleteVivienda, deleteAllViviendas } from "../actions";
import BulkCreateModal from "./BulkCreateModal";

interface Vivienda {
    id: string;
    codigo: string;
    nombre?: string | null;
    planta: string;
    letra: string;
    precio_sin_iva: number;
    operaciones?: {
        cliente: {
            nombre: string;
        };
    }[];
}

interface ViviendasManagerProps {
    promocionId: string;
    viviendas: Vivienda[];
    iva_porcentaje: number;
}

export default function ViviendasManager({ promocionId, viviendas, iva_porcentaje }: ViviendasManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVivienda, setEditingVivienda] = useState<Vivienda | null>(null);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [filter, setFilter] = useState<'TODAS' | 'LIBRES' | 'VENDIDAS'>('TODAS');
    const [loading, setLoading] = useState(false);

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        await upsertVivienda(promocionId, formData);
        setLoading(false);
        closeModal();
    }

    async function handleDelete(viviendaId: string) {
        if (confirm("¿Estás seguro de que quieres eliminar esta vivienda?")) {
            setLoading(true);
            try {
                const result = await deleteVivienda(promocionId, viviendaId);
                if (result && !result.success) {
                    alert(result.error);
                }
            } catch (error) {
                alert("Error al eliminar la vivienda");
            } finally {
                setLoading(false);
            }
        }
    }

    async function handleClearAll() {
        if (!confirm("¿Estás seguro de que quieres borrar TODAS las viviendas vacías?")) return;
        if (!confirm("AVISO: Esta acción no se puede deshacer. Se borrarán todas las unidades que no tengan operaciones asignadas. ¿Proceder?")) return;

        setLoading(true);
        try {
            const result = await deleteAllViviendas(promocionId);
            if (result.success) {
                if (result.count === 0) {
                    alert(result.message || "No se ha borrado nada.");
                } else {
                    alert(`Se han eliminado ${result.count} viviendas correctamente.`);
                }
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Error al vaciar el inventario.");
        } finally {
            setLoading(false);
        }
    }

    function openModal(vivienda?: Vivienda) {
        setEditingVivienda(vivienda || null);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingVivienda(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Inventario de Viviendas</h2>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">Listado completo de unidades disponibles en este proyecto.</p>
                </div>
                <div className="flex space-x-2">
                    {viviendas.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            disabled={loading}
                            className="bg-white text-red-600 border border-red-100 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-red-50 transition shadow-sm font-black text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            <span>Vaciar Inventario</span>
                        </button>
                    )}
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-50 transition shadow-sm font-black text-xs uppercase tracking-widest"
                    >
                        <FileText size={16} />
                        <span>Alta Masiva</span>
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-800 transition shadow-lg font-black text-xs uppercase tracking-widest"
                    >
                        <Plus size={16} />
                        <span>Añadir Vivienda</span>
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setFilter('TODAS')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'TODAS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Todas ({viviendas.length})
                </button>
                <button
                    onClick={() => setFilter('LIBRES')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'LIBRES' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Libres ({viviendas.filter(v => !v.operaciones || v.operaciones.length === 0).length})
                </button>
                <button
                    onClick={() => setFilter('VENDIDAS')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'VENDIDAS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Vendidas ({viviendas.filter(v => v.operaciones && v.operaciones.length > 0).length})
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Código</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Vivienda (Nombre) / Cliente</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">P.L.</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Base</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Total (+IVA)</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {viviendas
                            .filter((v) => {
                                if (filter === 'LIBRES') return !v.operaciones || v.operaciones.length === 0;
                                if (filter === 'VENDIDAS') return v.operaciones && v.operaciones.length > 0;
                                return true;
                            })
                            .sort((a, b) => {
                                // Ordenación natural por Código (ej: 1, 2, 10...)
                                return a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' });
                            })
                            .map((v) => {
                                const operacionActiva = v.operaciones?.[0];
                                return (
                                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex flex-col space-y-1">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded font-mono text-xs font-bold w-fit">{v.codigo}</span>
                                                {operacionActiva && (
                                                    <span className="text-[9px] bg-blue-100 text-blue-700 font-black uppercase px-2 py-0.5 rounded-full w-fit">
                                                        Vendido
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {operacionActiva ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-0.5">Cliente Adjudicado</span>
                                                    <span className="text-sm font-black text-blue-600">{operacionActiva.cliente.nombre}</span>
                                                    <span className="text-[9px] text-slate-400 italic">Unidad: {v.nombre || 'Sin nombre'}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-black text-slate-900">{v.nombre || 'N/A'}</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase">{v.planta}{v.letra}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-xs font-bold text-slate-400">
                                                {v.precio_sin_iva.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-sm font-black text-slate-900">
                                                {(v.precio_sin_iva * (1 + (iva_porcentaje || 0) / 100)).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(v)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        {viviendas.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400 font-bold italic">
                                    No hay viviendas cargadas en esta promoción.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Vivienda */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                                {editingVivienda ? "Editar Vivienda" : "Añadir Vivienda"}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {editingVivienda && <input type="hidden" name="id" value={editingVivienda.id} />}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código (Ref)</label>
                                    <input
                                        name="codigo"
                                        required
                                        defaultValue={editingVivienda?.codigo || ""}
                                        placeholder="Ej: 101"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vivienda (Nombre)</label>
                                    <input
                                        name="nombre"
                                        defaultValue={editingVivienda?.nombre || ""}
                                        placeholder="Ej: Portal 1, 1ºA"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Planta</label>
                                    <input
                                        name="planta"
                                        defaultValue={editingVivienda?.planta || ""}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Letra</label>
                                    <input
                                        name="letra"
                                        defaultValue={editingVivienda?.letra || ""}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio sin IVA (€)</label>
                                <input
                                    name="precio_sin_iva"
                                    type="number"
                                    step="0.01"
                                    defaultValue={editingVivienda?.precio_sin_iva || ""}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Guardar Vivienda</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <BulkCreateModal
                promocionId={promocionId}
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
            />
        </div>
    );
}
