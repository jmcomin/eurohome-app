"use client";

import { useState } from "react";
import { Plus, X, Save, Euro, Calendar, CreditCard, Layers } from "lucide-react";
import { registrarPago } from "../actions";
import { useRouter } from "next/navigation";

interface RegistrarPagoModalProps {
    operacionId: string;
}

export default function RegistrarPagoModal({ operacionId }: RegistrarPagoModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await registrarPago(operacionId, formData);

        if (result.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            setError(result.error || "Ocurrió un error inesperado.");
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition text-sm font-bold flex items-center space-x-2 shadow-sm"
            >
                <Plus size={16} />
                <span>Registrar Pago</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => !loading && setIsOpen(false)}
            />

            {/* Modal */}
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                            <Plus size={18} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nuevo Pago</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-slate-900 transition p-1"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="importe" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center">
                                <Euro size={12} className="mr-1" /> Importe
                            </label>
                            <input
                                type="number"
                                id="importe"
                                name="importe"
                                required
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-black text-slate-900 placeholder:text-slate-300 shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="fecha" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center">
                                <Calendar size={12} className="mr-1" /> Fecha del Cobro
                            </label>
                            <input
                                type="date"
                                id="fecha"
                                name="fecha"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="metodo" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center">
                                <CreditCard size={12} className="mr-1" /> Método / Banco
                            </label>
                            <select
                                id="metodo"
                                name="metodo"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 shadow-inner appearance-none"
                            >
                                <option value="Transferencia">Transferencia</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="referencia" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Referencia interna (opcional)</label>
                            <input
                                type="text"
                                id="referencia"
                                name="referencia"
                                placeholder="Ej: Pago Reserva"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                            className="flex-1 px-6 py-4 text-xs font-black text-slate-400 hover:text-slate-900 transition uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition shadow-xl shadow-slate-200 font-black text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Guardar Cobro</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="p-4 bg-blue-50 text-[10px] text-blue-700 font-medium text-center border-t border-blue-100">
                    Al registrar el pago, se recalcularán automáticamente los hitos de liquidación.
                </div>
            </div>
        </div>
    );
}
