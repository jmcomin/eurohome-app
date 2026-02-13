"use client";

import { useState, useEffect } from "react";
import { Building2, Home, Mail, Phone, Save } from "lucide-react";
import { getViviendasPorPromocion, crearOperacion } from "../actions";
import { useRouter } from "next/navigation";

interface NuevaOperacionFormProps {
    promociones: { id: string; nombre: string }[];
    agentes: { id: string; nombre: string }[];
}

export default function NuevaOperacionForm({ promociones, agentes }: NuevaOperacionFormProps) {
    const [promocionId, setPromocionId] = useState("");
    const [viviendas, setViviendas] = useState<any[]>([]);
    const [loadingViviendas, setLoadingViviendas] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (promocionId) {
            setLoadingViviendas(true);
            getViviendasPorPromocion(promocionId).then(res => {
                if (res.success) {
                    setViviendas(res.viviendas || []);
                }
                setLoadingViviendas(false);
            });
        } else {
            setViviendas([]);
        }
    }, [promocionId]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await crearOperacion(formData);

        if (result.success) {
            router.push(`/operaciones/${result.operacionId}`);
            router.refresh();
        } else {
            setError(result.error || "Error al crear la operación");
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold">
                    {error}
                </div>
            )}

            {/* Fila 1: Nombre y NIF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo del Cliente</label>
                    <input
                        name="nombreCliente"
                        required
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIF / Pasaporte</label>
                    <input
                        name="nif"
                        required
                        type="text"
                        placeholder="Ej: 12345678Z"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700 uppercase"
                    />
                </div>
            </div>

            {/* Fila 2: Email y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                        <Mail size={10} className="mr-1" />
                        Email
                    </label>
                    <input
                        name="email"
                        type="email"
                        placeholder="Ej: cliente@correo.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                        <Phone size={10} className="mr-1" />
                        Teléfono
                    </label>
                    <input
                        name="telefono"
                        type="tel"
                        placeholder="Ej: +34 600 000 000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
                    />
                </div>
            </div>

            {/* Fila 3: Vivienda y Promoción */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-50">
                <div className="md:col-span-1">
                    <div className="flex items-center space-x-3 text-slate-400 mb-4">
                        <Building2 size={18} />
                        <h2 className="font-black uppercase tracking-widest text-[10px]">Proyecto</h2>
                    </div>
                    <select
                        name="promocionId"
                        required
                        value={promocionId}
                        onChange={(e) => setPromocionId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700 appearance-none"
                    >
                        <option value="">Seleccione promoción...</option>
                        {promociones.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 text-slate-400 mb-4">
                        <Home size={18} />
                        <h2 className="font-black uppercase tracking-widest text-[10px]">Vivienda / Unidad</h2>
                    </div>
                    <select
                        name="viviendaCodigo"
                        required
                        disabled={!promocionId || loadingViviendas}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700 disabled:opacity-50 appearance-none"
                    >
                        <option value="">
                            {loadingViviendas ? "Cargando viviendas..." : promocionId ? "Seleccione vivienda..." : "Primero seleccione una promoción"}
                        </option>
                        {viviendas
                            .sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' }))
                            .map(v => (
                                <option key={v.id} value={v.codigo}>
                                    {v.codigo} - {v.nombre || `${v.planta}${v.letra}`} ({v.precio_sin_iva.toLocaleString('es-ES', { maximumFractionDigits: 0 })})
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            {/* Fila 4: Agente */}
            <div className="grid grid-cols-1 gap-6 pt-8 border-t border-slate-50">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                        <Building2 size={10} className="mr-1" />
                        Agente Comercial
                    </label>
                    <select
                        name="agenteId"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700 appearance-none"
                    >
                        <option value="DIRECTA">Venta Directa (Sin Agente)</option>
                        {agentes.map(a => (
                            <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="pt-8 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center space-x-3 group disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save size={18} className="group-hover:scale-110 transition-transform" />
                            <span>Crear Operación</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
