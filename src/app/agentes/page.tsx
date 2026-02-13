import { Building2, Mail, Phone, Trash2, Edit2, Percent } from "lucide-react";
import { prisma } from "@/lib/prisma";
import NuevoAgenteModal from "./NuevoAgenteModal";
import EditarAgenteModal from "./EditarAgenteModal";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AgentesPage() {
    const agentes = await prisma.agente.findMany({
        orderBy: { nombre: 'asc' },
        include: {
            _count: {
                select: { operaciones: true }
            }
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agentes Comerciales</h1>
                    <p className="text-slate-500 font-bold mt-1">Gestiona las inmobiliarias y agentes externos</p>
                </div>
                <NuevoAgenteModal />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agentes.map((agente) => (
                    <div key={agente.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full group-hover:scale-110 transition-transform"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-slate-900 text-white rounded-xl">
                                    <Building2 size={24} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operaciones</p>
                                    <p className="text-xl font-black text-slate-900">{agente._count.operaciones}</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 mb-4">{agente.nombre}</h3>

                            <div className="space-y-2 mb-6">
                                {agente.email && (
                                    <div className="flex items-center text-sm font-bold text-slate-500">
                                        <Mail size={14} className="mr-2 text-slate-400" />
                                        {agente.email}
                                    </div>
                                )}
                                {agente.telefono && (
                                    <div className="flex items-center text-sm font-bold text-slate-500">
                                        <Phone size={14} className="mr-2 text-slate-400" />
                                        {agente.telefono}
                                    </div>
                                )}
                                <div className="flex items-center text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-flex">
                                    <Percent size={14} className="mr-2" />
                                    {agente.comision_base_pct}% Comisión Base
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-4 border-t border-slate-50">
                                <EditarAgenteModal agente={agente} />
                                {agente._count.operaciones === 0 && (
                                    <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {agentes.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <Building2 size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">No hay agentes registrados</p>
                        <p className="text-sm">Crea tu primer agente para empezar a vincular operaciones</p>
                    </div>
                )}
            </div>
        </div>
    );
}
