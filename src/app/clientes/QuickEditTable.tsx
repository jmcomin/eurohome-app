"use client";

import { useState } from "react";
import { Save, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { actualizarClientesBulk } from "./actions";
import { useRouter } from "next/navigation";

interface Cliente {
    id: string;
    nombre: string;
    nif_pasaporte: string;
    email: string | null;
    telefono: string | null;
}

interface QuickEditTableProps {
    initialClientes: Cliente[];
}

export default function QuickEditTable({ initialClientes }: QuickEditTableProps) {
    const [clientes, setClientes] = useState(initialClientes);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleChange = (id: string, field: keyof Cliente, value: string) => {
        setClientes(prev => prev.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);

        const result = await actualizarClientesBulk(clientes);

        if (result.success) {
            setMessage({ type: 'success', text: "¡Todos los clientes han sido actualizados!" });
            setTimeout(() => {
                router.push('/clientes');
            }, 1500);
        } else {
            setMessage({ type: 'error', text: result.error || "Ocurrió un error al guardar." });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-slate-50 py-4 z-10 border-b border-slate-200 -mx-4 px-4 sm:-mx-8 sm:px-8">
                <div className="flex items-center space-x-4">
                    <Link href="/clientes" className="p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edición Rápida de Clientes</h2>
                        <p className="text-slate-500 text-xs font-bold">Completa los datos de contacto sin salir de esta pantalla.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-slate-800 transition shadow-lg font-black text-xs uppercase tracking-widest disabled:opacity-50"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{loading ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl border flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                    {message.type === 'error' && <AlertCircle size={20} />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 py-4">Nombre Completo</th>
                                <th className="px-6 py-4">NIF / Pasaporte</th>
                                <th className="px-6 py-4">Email de Contacto</th>
                                <th className="px-6 py-4">Teléfono</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {clientes.map((cliente) => (
                                <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3">
                                        <input
                                            value={cliente.nombre}
                                            onChange={(e) => handleChange(cliente.id, 'nombre', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-500 outline-none py-1.5 transition font-bold text-slate-900"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            value={cliente.nif_pasaporte}
                                            onChange={(e) => handleChange(cliente.id, 'nif_pasaporte', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-500 outline-none py-1.5 transition font-mono text-xs text-slate-600"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            value={cliente.email || ""}
                                            onChange={(e) => handleChange(cliente.id, 'email', e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-500 outline-none py-1.5 transition text-sm text-slate-600 italic placeholder:text-slate-300"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            value={cliente.telefono || ""}
                                            onChange={(e) => handleChange(cliente.id, 'telefono', e.target.value)}
                                            placeholder="600 000 000"
                                            className="w-full bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-500 outline-none py-1.5 transition text-sm text-slate-600 placeholder:text-slate-300"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
