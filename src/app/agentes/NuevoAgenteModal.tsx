'use client';

import { useState } from "react";
import { Plus, X, Save, User, Mail, Phone, Percent } from "lucide-react";
import { crearAgente } from "./actions";

export default function NuevoAgenteModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(event.currentTarget);

        try {
            const result = await crearAgente(formData);
            if (result.success) {
                setIsOpen(false);
            } else {
                setError(result.error || "Error al crear el agente");
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
                className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-slate-800 transition shadow-lg font-black text-xs uppercase tracking-widest"
            >
                <Plus size={18} />
                <span>Nuevo Agente</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-slate-900">
                        <User size={20} className="text-blue-600" />
                        <h3 className="font-black uppercase tracking-widest text-sm">Nuevo Agente Comercial</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                            placeholder="Ej: 3.0"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                        />
                        <p className="text-[10px] text-slate-400 italic">Se usará por defecto en nuevas operaciones.</p>
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
                                    <span>Guardar Agente</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
