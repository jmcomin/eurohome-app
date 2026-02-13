import { Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SearchInput from "@/components/SearchInput";
import FilterOptions from "./FilterOptions";

export const dynamic = 'force-dynamic';

export default async function OperacionesPage({
    searchParams,
}: {
    searchParams: Promise<{
        query?: string;
        estado?: string;
        promocion?: string;
        agente?: string
    }>;
}) {
    const { query, estado, promocion, agente } = await searchParams;

    // Construir el filtro where
    const whereClause: any = { AND: [] };

    if (query) {
        whereClause.AND.push({
            OR: [
                { cliente: { nombre: { contains: query } } },
                { vivienda: { codigo: { contains: query } } },
                { promocion: { nombre: { contains: query } } },
            ]
        });
    }

    if (estado) {
        whereClause.AND.push({ estado });
    }

    if (promocion) {
        whereClause.AND.push({ promocionId: promocion });
    }

    if (agente) {
        if (agente === 'DIRECTA') {
            whereClause.AND.push({ agenteId: null });
        } else {
            whereClause.AND.push({ agenteId: agente });
        }
    }

    const finalWhere = whereClause.AND.length > 0 ? whereClause : {};

    const [operaciones, promociones, agencias] = await Promise.all([
        prisma.operacion.findMany({
            where: finalWhere,
            include: {
                cliente: true,
                promocion: true,
                vivienda: true,
                pagos: true,
            },
        }),
        prisma.promocion.findMany({
            select: { id: true, nombre: true },
            orderBy: { nombre: 'asc' }
        }),
        prisma.agente.findMany({
            select: { id: true, nombre: true },
            orderBy: { nombre: 'asc' }
        })
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Operaciones</h1>
                    <p className="text-slate-500 text-sm">Listado completo de ventas y estado de comisiones.</p>
                </div>
                <Link href="/operaciones/nueva" className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition shadow-sm font-semibold">
                    <Plus size={18} />
                    <span>Nueva Operación</span>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <SearchInput />
                <FilterOptions promociones={promociones} agentes={agencias} />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Cliente / Vivienda</th>
                                <th className="px-6 py-4">Promoción</th>
                                <th className="px-6 py-4">Precio (con IVA)</th>
                                <th className="px-6 py-4">% Pagado</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {operaciones.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic font-medium">No hay operaciones registradas.</td>
                                </tr>
                            ) : (
                                operaciones
                                    .sort((a, b) => a.vivienda.codigo.localeCompare(b.vivienda.codigo, undefined, { numeric: true, sensitivity: 'base' }))
                                    .map((op) => {
                                        const totalPaid = op.pagos.reduce((sum, p) => sum + p.importe, 0);
                                        const priceWithIva = op.vivienda.precio_sin_iva * (1 + op.promocion.iva_porcentaje / 100);
                                        const pctPaid = Math.round((totalPaid / priceWithIva) * 100) || 0;

                                        return (
                                            <tr key={op.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{op.cliente.nombre}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{op.vivienda.codigo} - {op.vivienda.planta}{op.vivienda.letra}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{op.promocion.nombre}</td>
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    {priceWithIva.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-1 bg-slate-100 rounded-full h-2 w-16 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${pctPaid >= 30 ? 'bg-green-500' : pctPaid >= 15 ? 'bg-blue-500' : 'bg-slate-300'}`}
                                                                style={{ width: `${Math.min(pctPaid, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-black text-slate-700">{pctPaid.toLocaleString('es-ES')}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${op.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {op.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/operaciones/${op.id}`} className="text-slate-400 hover:text-slate-900 transition-colors p-2 inline-block">
                                                        <ArrowUpRight size={18} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
