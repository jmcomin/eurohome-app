"use client";

import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { actualizarCliente } from "./actions";
import { useRouter } from "next/navigation";

interface ClienteEditFormProps {
    cliente: {
        id: string;
        nombre: string;
        nif_pasaporte: string;
        email?: string | null;
        telefono?: string | null;
    };
}

export default function ClienteEditForm({ cliente }: ClienteEditFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [nombre, setNombre] = useState(cliente.nombre);
    const [nif, setNif] = useState(cliente.nif_pasaporte);
    const [email, setEmail] = useState(cliente.email || "");
    const [telefono, setTelefono] = useState(cliente.telefono || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSave() {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("nif_pasaporte", nif);
        formData.append("email", email);
        formData.append("telefono", telefono);

        const result = await actualizarCliente(cliente.id, formData);

        if (result.success) {
            setIsEditing(false);
            router.refresh();
        } else {
            setError(result.error || "Error al actualizar");
            setLoading(false);
        }
    }

    if (!isEditing) {
        return (
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                        <Edit2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{cliente.nombre}</h1>
                        <div className="flex items-center space-x-2 text-slate-500 font-bold text-sm">
                            <span>{cliente.nif_pasaporte}</span>
                            {cliente.nif_pasaporte.includes("DUMMY") && (
                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Temporal</span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 px-4 py-2 rounded-xl transition shadow-sm font-bold text-xs uppercase tracking-widest"
                >
                    <Edit2 size={16} />
                    <span>Editar Datos</span>
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 space-y-4 animate-in fade-in duration-300">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Editar Información Personal</h2>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 mb-2">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-slate-900 rounded-xl outline-none font-bold text-slate-900 transition-all shadow-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NIF / Pasaporte</label>
                    <input
                        type="text"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-slate-900 rounded-xl outline-none font-bold text-slate-900 transition-all shadow-sm uppercase"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-slate-900 rounded-xl outline-none font-bold text-slate-900 transition-all shadow-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
                    <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+34 600 000 000"
                        className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-slate-900 rounded-xl outline-none font-bold text-slate-900 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-slate-200 font-black text-xs uppercase tracking-widest disabled:opacity-50"
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
        </div>
    );
}
