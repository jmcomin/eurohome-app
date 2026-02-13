import { prisma } from "@/lib/prisma";
import { ArrowLeft, User, Phone, Mail, Building2, Calendar, CreditCard, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClienteEditForm from "../ClienteEditForm";

export default async function ClienteDetallePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
            operaciones: {
                include: {
                    promocion: true,
                    vivienda: true,
                    pagos: {
                        orderBy: { fecha: 'desc' }
                    },
                    tramos: {
                        orderBy: { tipo: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!cliente) {
        notFound();
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Edit Form */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="w-full">
                    <Link href="/clientes" className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition font-bold group mb-4">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs uppercase tracking-widest font-black">Volver a Clientes</span>
                    </Link>

                    <ClienteEditForm cliente={{
                        id: cliente.id,
                        nombre: cliente.nombre,
                        nif_pasaporte: cliente.nif_pasaporte,
                        email: cliente.email,
                        telefono: cliente.telefono
                    }} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral: Información de Contacto */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Datos de Contacto</h2>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Email</div>
                                    <div className="text-sm font-bold text-slate-900">{cliente.email || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Teléfono</div>
                                    <div className="text-sm font-bold text-slate-900">{cliente.telefono || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 group pt-2">
                                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Alta en Sistema</div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {cliente.createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-slate-200">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Resumen Operativo</h3>
                            <div className="text-3xl font-black mb-1">{cliente.operaciones.length}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Operaciones Totales</div>
                        </div>
                    </div>
                </div>

                {/* Principal: Historial de Operaciones */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                        <Building2 className="text-slate-400" size={20} />
                        <span>Historial de Operaciones</span>
                    </h2>

                    {cliente.operaciones.length === 0 ? (
                        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Home size={32} />
                            </div>
                            <p className="text-slate-500 font-bold">Este cliente aún no registra operaciones.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cliente.operaciones.map((op) => (
                                <Link
                                    key={op.id}
                                    href={`/operaciones/${op.id}`}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md hover:border-slate-300 transition-all group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Home size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 uppercase tracking-tight">{op.promocion.nombre}</h4>
                                            <div className="text-xs text-slate-500 font-medium">
                                                Cód: {op.vivienda.codigo} | {op.vivienda.planta} {op.vivienda.letra}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex items-center space-x-8">
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</div>
                                            <span className={`text-xs font-black uppercase tracking-tighter ${op.estado === 'ACTIVA' ? 'text-blue-600' :
                                                op.estado === 'CANCELADA' ? 'text-red-600' : 'text-slate-600'
                                                }`}>
                                                {op.estado}
                                            </span>
                                        </div>
                                        <ChevronRight className="text-slate-300 group-hover:text-slate-900 transition-all group-hover:translate-x-1" size={20} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
