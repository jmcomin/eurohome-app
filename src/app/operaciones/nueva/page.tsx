import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NuevaOperacionForm from "./NuevaOperacionForm";

export default async function NuevaOperacionPage() {
    const promociones = await prisma.promocion.findMany({
        orderBy: { nombre: 'asc' },
        select: { id: true, nombre: true }
    });

    const agentes = await prisma.agente.findMany({
        orderBy: { nombre: 'asc' },
        select: { id: true, nombre: true }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Link href="/operaciones" className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition font-bold group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs uppercase tracking-widest font-black">Volver a Operaciones</span>
                </Link>
                <h1 className="text-2xl font-black text-slate-900">Nueva Operación</h1>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-slate-900">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3 text-blue-600 mb-2">
                        <User size={20} />
                        <h2 className="font-black uppercase tracking-widest text-sm">Información del Cliente</h2>
                    </div>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">Si el cliente ya existe (mismo NIF), se vinculará automáticamente y se actualizarán sus datos de contacto.</p>
                </div>

                <NuevaOperacionForm promociones={promociones} agentes={agentes} />
            </div>

            <div className="text-center p-8">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Eurohome Commission System v1.0</p>
            </div>
        </div>
    );
}
