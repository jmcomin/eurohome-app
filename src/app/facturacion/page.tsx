import { FileText, CheckCircle, Clock, AlertTriangle, Printer, Layers, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ConfirmarCobroButton from "./ConfirmarCobroButton";
import RevertirStatusButton from "./RevertirStatusButton";
import PrintButton from "./PrintButton";

export const dynamic = 'force-dynamic';

export default async function FacturacionPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const currentView = params.view || 'pendientes';
    const currentType = params.type || 'all'; // 'all', 'eurohome', 'agente'

    const whereClause: any = {
        facturable: true,
    };

    if (currentView === 'pendientes') {
        whereClause.OR = [
            { factura: { is: null } },
            { factura: { estado: { not: 'COBRADA' } } }
        ];
    } else if (currentView === 'historial') {
        whereClause.validado = true;
    }

    if (currentType === 'eurohome') {
        whereClause.tipo = { in: ['EUROHOME_1', 'EUROHOME_2'] };
    } else if (currentType === 'agente') {
        whereClause.tipo = 'AGENTE';
    }

    const tramosFacturables = await prisma.tramoComision.findMany({
        where: whereClause,
        include: {
            operacion: {
                include: {
                    cliente: true,
                    promocion: true,
                    vivienda: true,
                    agente: true
                }
            },
            factura: true
        },
        orderBy: { updatedAt: 'desc' }
    });

    const [countPendientes, countCobradas] = await Promise.all([
        prisma.tramoComision.count({
            where: {
                validado: true,
                OR: [
                    { factura: { is: null } },
                    { factura: { estado: { not: 'COBRADA' } } }
                ]
            }
        }),
        prisma.factura.count({ where: { estado: 'COBRADA' } })
    ]);

    return (
        <div className="space-y-8">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0 !important; cursor: default !important; }
                    main { padding: 0 !important; }
                    .p-8 { padding: 1cm !important; }
                    .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; }
                    .border { border: 1px solid #e2e8f0 !important; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                }
            `}} />
            <div className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Liquidaciones</h1>
                    <p className="text-slate-500 text-sm font-medium">Gestión de cobros y control de comisiones por tramo.</p>
                </div>
                <div className="flex space-x-3">
                    <Link href="/facturacion/series" className="px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition text-sm font-bold flex items-center space-x-2 shadow-sm">
                        <Building2 size={18} className="text-slate-400" />
                        <span>Por Promoción</span>
                    </Link>
                    <Link href="/facturacion/masivo" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition text-sm font-bold flex items-center space-x-2 shadow-sm">
                        <Printer size={18} />
                        <span>Generar Liquidación</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
                <InvoicingStat title="Pendientes Cobro" count={countPendientes} icon={<AlertTriangle className="text-orange-500" />} color="orange" />
                <InvoicingStat title="Cobros Recibidos" count={countCobradas} icon={<CheckCircle className="text-green-500" />} color="green" />
            </div>

            {/* Pestañas de Vista */}
            <div className="flex border-b border-slate-200 no-print">
                <Link
                    href="/facturacion?view=pendientes"
                    className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${currentView === 'pendientes'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Pendientes de Cobro
                </Link>
                <Link
                    href={`/facturacion?view=historial&type=${currentType}`}
                    className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${currentView === 'historial'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Historial General (Liquidados)
                </Link>
            </div>

            {/* Filtros de Tipo (EH vs Agentes) */}
            <div className="flex space-x-2 no-print">
                <Link
                    href={`/facturacion?view=${currentView}&type=all`}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${currentType === 'all'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'
                        }`}
                >
                    Todos
                </Link>
                <Link
                    href={`/facturacion?view=${currentView}&type=eurohome`}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${currentType === 'eurohome'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'
                        }`}
                >
                    Eurohome
                </Link>
                <Link
                    href={`/facturacion?view=${currentView}&type=agente`}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${currentType === 'agente'
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'
                        }`}
                >
                    Solo Agentes
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-800 flex items-center space-x-2">
                        <FileText className="text-slate-400" size={20} />
                        <span>{currentView === 'pendientes' ? 'Liquidaciones Pendientes' : 'Historial de Liquidaciones'}</span>
                    </h2>
                    <PrintButton />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Tercero / Cliente</th>
                                <th className="px-6 py-4">Concepto</th>
                                <th className="px-6 py-4">Base Imponible</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Fecha Devengo</th>
                                <th className="px-6 py-4 text-right no-print">Información</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {tramosFacturables.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500 italic font-medium bg-slate-50/50">
                                        No hay tramos pendientes de facturación en este momento.
                                    </td>
                                </tr>
                            ) : (
                                tramosFacturables
                                    .sort((a, b) => {
                                        const codA = a.operacion.vivienda?.codigo || '';
                                        const codB = b.operacion.vivienda?.codigo || '';
                                        return codA.localeCompare(codB, undefined, { numeric: true, sensitivity: 'base' });
                                    })
                                    .map((tramo) => (
                                        <tr key={tramo.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                {tramo.tipo === 'AGENTE' ? (
                                                    <div className="font-bold text-orange-700 flex items-center">
                                                        <Building2 size={14} className="mr-2" />
                                                        {tramo.operacion.agente?.nombre || 'Venta Directa'}
                                                    </div>
                                                ) : (
                                                    <div className="font-bold text-slate-900">Eurohome (Promotora)</div>
                                                )}
                                                <div className="text-[10px] text-slate-400 font-bold mt-1">Cliente: {tramo.operacion.cliente.nombre}</div>
                                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center space-x-2">
                                                    <span>{tramo.operacion.promocion.nombre}</span>
                                                    {tramo.operacion.vivienda && (
                                                        <>
                                                            <span className="text-slate-300">|</span>
                                                            <span className="text-blue-600">{tramo.operacion.vivienda.codigo}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${tramo.tipo.includes('EUROHOME') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {tramo.tipo.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700">
                                                {tramo.base_imponible.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-900">
                                                {(tramo.base_imponible + tramo.iva).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">{tramo.fecha_facturable ? new Date(tramo.fecha_facturable).toLocaleDateString() : '-'}</td>
                                            <td className="px-6 py-4 text-right font-medium italic no-print">
                                                {tramo.factura?.estado === 'COBRADA' ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-blue-600 flex items-center justify-end space-x-1 font-bold not-italic mb-2">
                                                            <CheckCircle size={14} />
                                                            <span>Cobrado</span>
                                                        </span>
                                                        <RevertirStatusButton tramoId={tramo.id} />
                                                    </div>
                                                ) : tramo.validado ? (
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className="text-green-600 flex items-center justify-end space-x-1 font-bold not-italic">
                                                            <CheckCircle size={14} />
                                                            <span>Liquidado</span>
                                                        </span>
                                                        <div className="flex space-x-2">
                                                            <RevertirStatusButton tramoId={tramo.id} />
                                                            <ConfirmarCobroButton tramoId={tramo.id} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className="text-slate-400">Pendiente Liquidación</span>
                                                        <ConfirmarCobroButton tramoId={tramo.id} />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                        {tramosFacturables.length > 0 && (
                            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black text-slate-900">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 uppercase tracking-widest text-[10px]">Totales Pendientes</td>
                                    <td className="px-6 py-4">
                                        {tramosFacturables.reduce((acc, t) => acc + t.base_imponible, 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-6 py-4 text-lg">
                                        {tramosFacturables.reduce((acc, t) => acc + (t.base_imponible + t.iva), 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}

function InvoicingStat({ title, count, icon, color }: { title: string; count: number; icon: React.ReactNode; color: string }) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        orange: "bg-orange-50 text-orange-700 border-orange-100",
        green: "bg-green-50 text-green-700 border-green-100",
    };

    return (
        <div className={`p-6 rounded-xl border flex items-center justify-between ${colorMap[color]} shadow-sm`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{title}</p>
                <p className="text-3xl font-black tracking-tight">{count}</p>
            </div>
            <div className="p-3 bg-white/60 rounded-xl shadow-sm border border-white/40">
                {icon}
            </div>
        </div>
    );
}
