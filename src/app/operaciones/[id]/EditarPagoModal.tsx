"use client";

import { useState } from "react";
import { Edit2, X, Save, Euro, Calendar, CreditCard, Trash2, AlertTriangle } from "lucide-react";
import { editarPago, eliminarPago } from "../actions";
import { useRouter } from "next/navigation";

interface EditarPagoModalProps {
    pago: {
        id: string;
        importe: number;
        fecha: Date;
        metodo: string | null;
        referencia: string | null;
    };
    operacionId: string;
}

export default function EditarPagoModal({ pago, operacionId }: EditarPagoModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await editarPago(pago.id, operacionId, formData);

        if (result.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            setError(result.error || "Ocurrió un error inesperado.");
            setLoading(false);
        }
    }

    async function handleDelete() {
        setLoading(true);
        const result = await eliminarPago(pago.id, operacionId);
        if (result.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            setError(result.error || "Error al eliminar");
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-slate-900 transition-all no-print"
                title="Editar Pago"
            >
                <Edit2 size={14} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => !loading && setIsOpen(false)}
            />

            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                            <Edit2 size={18} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Editar Pago</h2>
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

                    {!showDeleteConfirm ? (
                        <>
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
                                        defaultValue={pago.importe}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-black text-slate-900 shadow-inner"
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
                                        defaultValue={new Date(pago.fecha).toISOString().split('T')[0]}
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
                                        defaultValue={pago.metodo || "Transferencia"}
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
                                        defaultValue={pago.referencia || ""}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col space-y-4">
                                <div className="flex items-center space-x-3">
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
                                                <span>Guardar Cambios</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest transition"
                                >
                                    Eliminar este pago
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="py-8 space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                    <AlertTriangle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase">¿Estás seguro?</h3>
                                    <p className="text-slate-500 font-bold text-sm mt-2">Esta acción eliminará el registro de este cobro y recalculará los hitos de la operación.</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-6 py-4 text-xs font-black text-slate-400 hover:text-slate-900 transition uppercase tracking-widest"
                                >
                                    Volver
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 text-white px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-red-700 transition shadow-xl shadow-red-100 font-black text-xs uppercase tracking-widest disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            <span>Eliminar Pago</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
