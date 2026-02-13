import { prisma } from "@/lib/prisma";
import { ArrowLeft, Building2, Home, Plus, Edit2, Trash2, Euro } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ViviendasManager from "./ViviendasManager";

export const dynamic = 'force-dynamic';

export default async function PromocionDetallePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    console.log(`[DEBUG] PromocionDetallePage: rawId="${rawId}", decodedId="${id}"`);

    const promocion = await prisma.promocion.findUnique({
        where: { id },
        include: {
            viviendas: {
                include: {
                    operaciones: {
                        where: { estado: 'ACTIVA' },
                        include: { cliente: true }
                    }
                },
                orderBy: { codigo: 'asc' }
            }
        }
    });

    if (!promocion) {
        notFound();
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/promociones" className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition font-bold group mb-2">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs uppercase tracking-widest font-black">Volver a Promociones</span>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">{promocion.nombre}</h1>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href={`/promociones/${promocion.id}/editar`}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition font-bold text-sm flex items-center space-x-2"
                    >
                        <Edit2 size={16} />
                        <span>Editar Configuración</span>
                    </Link>
                </div>
            </div>

            {/* Grid de Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Viviendas" value={promocion.viviendas.length.toString()} icon={<Home size={20} />} />
                <StatCard label="Comisión EH" value={`${promocion.comision_total_pct}%`} icon={<Euro size={20} />} />
                <StatCard label="Hito 1" value={`${promocion.hito_1_pct}%`} icon={<Building2 size={20} />} />
                <StatCard label="Hito 2" value={`${promocion.hito_2_pct}%`} icon={<Building2 size={20} />} />
            </div>

            {/* Inventario de Viviendas */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6">
                <ViviendasManager
                    promocionId={promocion.id}
                    viviendas={promocion.viviendas}
                    iva_porcentaje={promocion.iva_porcentaje}
                />
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 text-slate-400 mb-2">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
        </div>
    );
}
