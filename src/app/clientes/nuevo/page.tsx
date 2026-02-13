"use client";

import { UserPlus, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearCliente } from "../actions";

export default function NuevoClientePage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await crearCliente(formData);

        if (result.success) {
            router.push("/clientes");
            router.refresh();
        } else {
            setError(result.error || "Ocurrió un error inesperado.");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/clientes" className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition font-bold group mb-2">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs uppercase tracking-widest font-black">Volver a Clientes</span>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">Registrar Cliente</h1>
                </div>
                <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl">
                    <UserPlus size={32} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="nombre" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                required
                                placeholder="Ej: Juan Pérez García"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="nif_pasaporte" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NIF / Pasaporte</label>
                            <input
                                type="text"
                                id="nif_pasaporte"
                                name="nif_pasaporte"
                                required
                                placeholder="Ej: 12345678Z"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="ejemplo@correo.com"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="telefono" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    placeholder="+34 600 000 000"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-4">
                    <Link href="/clientes" className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-900 transition uppercase tracking-widest">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl flex items-center space-x-2 hover:bg-slate-800 transition shadow-lg shadow-slate-200 font-black text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Guardar Cliente</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex items-start space-x-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <Save size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight mb-1">Información Importante</h4>
                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                        Asegúrate de que el NIF o Pasaporte sea correcto. Este dato se utiliza para vincular al cliente con sus operaciones de forma única en el sistema.
                    </p>
                </div>
            </div>
        </div>
    );
}
