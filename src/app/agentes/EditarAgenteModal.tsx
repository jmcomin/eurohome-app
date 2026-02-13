'use client';

import { useState } from "react";
import { X, Save, User, Mail, Phone, Percent, Edit2 } from "lucide-react";
import { actualizarAgente } from "./actions";

interface EditarAgenteModalProps {
    agente: {
        id: string;
        nombre: string;
        email: string | null;
        telefono: string | null;
        comision_base_pct: number;
    };
}

export default function EditarAgenteModal({ agente }: EditarAgenteModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(event.currentTarget);

        try {
            const result = await actualizarAgente(agente.id, formData);
            if (result.success) {
                setIsOpen(false);
            } else {
                setError(result.error || "Error al actualizar el agente");
            }
        } catch (err) {
            setError("Error de red o del servidor");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition shadow-sm border border-slate-100 flex items-center justify-center space-x-2"
            >
                <Edit2 size={12} />
                <span>Editar</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-slate-900">
                        <Edit2 size={20} className="text-blue-600" />
                        <h3 className="font-black uppercase tracking-widest text-sm">Editar Agente Comercial</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                            <User size={10} className="mr-1" /> Nombre del Agente
                        </label>
                        <input
                            name="nombre"
                            required
                            type="text"
                            defaultValue={agente.nombre}
                            placeholder="Ej: Inmobiliaria Sol"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                                <Mail size={10} className="mr-1" /> Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={agente.email || ""}
                                placeholder="agente@ejemplo.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                                <Phone size={10} className="mr-1" /> Teléfono
                            </label>
                            <input
                                name="telefono"
                                type="tel"
                                defaultValue={agente.telefono || ""}
                                placeholder="600 000 000"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                            <Percent size={10} className="mr-1" /> % Comisión Base
                        </label>
                        <input
                            name="comision_base_pct"
                            type="number"
                            step="0.01"
                            defaultValue={agente.comision_base_pct}
                            placeholder="Ej: 3.0"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center space-x-3 group disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={16} className="group-hover:scale-110 transition-transform" />
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
