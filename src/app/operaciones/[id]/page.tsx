import { ArrowLeft, Plus, Download, Calendar, Wallet, FileCheck, Building2 } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RegistrarPagoModal from "./RegistrarPagoModal";
import PrintSummaryButton from "@/components/PrintSummaryButton";
import EditarPagoModal from "./EditarPagoModal";
import DeleteOperacionButton from "./DeleteOperacionButton";
import CancelOperacionButton from "./CancelOperacionButton";
import EditarOperacionModal from "./EditarOperacionModal";

export const dynamic = 'force-dynamic';

export default async function OperacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const operacion = await prisma.operacion.findUnique({
        where: { id },
        include: {
            cliente: true,
            promocion: true,
            vivienda: true,
            pagos: { orderBy: { fecha: 'desc' } },
            tramos: {
                include: { factura: true },
                orderBy: { tipo: 'asc' }
            },
            agente: true
        }
    });

    if (!operacion) {
        notFound();
    }

    const totalPaid = operacion.pagos.reduce((sum, p) => sum + p.importe, 0);
    const priceWithIva = operacion.vivienda.precio_sin_iva * (1 + operacion.promocion.iva_porcentaje / 100);
    const pctPaid = Math.round((totalPaid / priceWithIva) * 100) || 0;

    return (
        <div className="space-y-8 pb-20">
            {/* Cabecera de Impresión (Solo visible al imprimir) */}
            <div className="print-header">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-900 text-white rounded-xl">
                        <Building2 size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase">Eurohome</h2>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase">Generado el</p>
                    <p className="font-bold text-slate-900">{new Date().toLocaleDateString('es-ES')}</p>
                </div>
            </div>

            <div className="flex items-center justify-between no-print">
                <Link href="/operaciones" className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition font-bold group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Volver a operaciones</span>
                </Link>
                <div className="flex space-x-3">
                    {operacion.estado === 'ACTIVA' && <CancelOperacionButton id={id} />}
                    <DeleteOperacionButton id={id} />
                    <EditarOperacionModal
                        operacion={operacion}
                        agentes={await prisma.agente.findMany({ orderBy: { nombre: 'asc' } })}
                        viviendas={await prisma.vivienda.findMany({
                            where: { promocionId: operacion.promocionId },
                            orderBy: { codigo: 'asc' }
                        })}
                    />
                    <PrintSummaryButton label="Imprimir Resumen" />
                    <RegistrarPagoModal operacionId={id} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 -mr-24 -mt-24 rounded-full"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{operacion.cliente.nombre}</h1>
                                <p className="text-slate-500 font-bold mt-1 text-lg">{operacion.promocion.nombre} • {operacion.vivienda.codigo}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${operacion.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {operacion.estado}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-8 border-t border-slate-100 relative z-10">
                            <StatBlock label="Base Imponible" value={`${operacion.vivienda.precio_sin_iva.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`} />
                            <StatBlock label="Precio con IVA" value={`${priceWithIva.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`} />
                            <StatBlock label="Total Pagado" value={`${totalPaid.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`} bold />
                            <StatBlock label="% Pagado" value={`${pctPaid}%`} />
                            <StatBlock label="Comisión EH" value={`${operacion.promocion.comision_total_pct.toLocaleString('es-ES', { minimumFractionDigits: 1 })}%`} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center space-x-2">
                            <FileCheck className="text-slate-400" size={24} />
                            <span>Estado de Liquidación</span>
                        </h2>
                        <div className="relative space-y-12 pb-4">
                            <div className="absolute left-[19px] top-2 bottom-2 w-1 bg-slate-100"></div>

                            {operacion.tramos.map((tramo, idx) => {
                                const estadoFactura = tramo.factura?.estado;
                                const isCobrada = estadoFactura === 'COBRADA';
                                const isLiquidado = estadoFactura === 'EMITIDA' || isCobrada;
                                const isListo = tramo.facturable && !tramo.factura;

                                return (
                                    <div key={tramo.id} className="relative flex items-start space-x-6">
                                        <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-colors ${isCobrada ? 'bg-green-600 text-white' :
                                            isLiquidado ? 'bg-teal-500 text-white' :
                                                isListo ? 'bg-blue-600 text-white animate-pulse shadow-blue-200' :
                                                    'bg-slate-200 text-slate-400'
                                            }`}>
                                            <span className="text-xs font-black">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1 pt-1 bg-slate-50 p-6 rounded-xl border border-slate-100 group hover:border-slate-300 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm">{tramo.tipo.replace('_', ' ')}</h3>
                                                    <p className="text-sm text-slate-500 font-bold mt-1">Total: {(tramo.base_imponible + tramo.iva).toLocaleString('es-ES', { maximumFractionDigits: 0 })} (+IVA)</p>
                                                </div>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-sm ${isCobrada ? 'bg-green-50 text-green-600 border-green-100' :
                                                    isLiquidado ? 'bg-teal-50 text-teal-600 border-teal-100' :
                                                        isListo ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-white text-slate-400 border-slate-200'
                                                    }`}>
                                                    {isCobrada ? 'COBRADA' : isLiquidado ? 'LIQUIDADO' : isListo ? 'LISTO PARA LIQUIDAR' : 'PENDIENTE'}
                                                </span>
                                            </div>

                                            {idx === 0 && !tramo.facturable && (
                                                <div className="mt-4 p-4 bg-white rounded-lg text-xs text-slate-600 border border-slate-200 shadow-inner">
                                                    <p className="font-bold">Progreso del tramo:</p>
                                                    <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                                                        <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min((totalPaid / (priceWithIva * operacion.promocion.hito_1_pct / 100)) * 100, 100)}%` }}></div>
                                                    </div>
                                                    <p className="mt-2">Faltan <strong>{Math.max(0, (priceWithIva * operacion.promocion.hito_1_pct / 100 - totalPaid)).toLocaleString('es-ES', { maximumFractionDigits: 0 })}</strong> de pagos para habilitar este tramo ({operacion.promocion.hito_1_pct}%).</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {operacion.tramos.length === 0 && (
                                <div className="pt-2 italic text-slate-400 text-sm py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="font-bold">No se han generado tramos todavía.</p>
                                    <p className="text-xs mt-1 leading-relaxed">Registra un pago que alcance el primer hito ({operacion.promocion.hito_1_pct}%) <br /> o pulsa el botón de recálculo global en Ajustes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center space-x-2 relative z-10">
                            <Wallet className="text-slate-400" size={18} />
                            <span>Historial de Pagos</span>
                        </h2>
                        <div className="space-y-4 relative z-10">
                            {operacion.pagos.map((pago) => (
                                <div key={pago.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 group transition hover:border-slate-300 hover:bg-white shadow-sm flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-black text-slate-900">{pago.importe.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
                                            <span className="text-[10px] text-slate-400 font-black flex items-center uppercase tracking-tighter">
                                                <Calendar size={10} className="mr-1" />
                                                {new Date(pago.fecha).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold mb-2">{pago.metodo}</p>
                                        <p className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded inline-block border border-slate-100">
                                            {pago.referencia}
                                        </p>
                                    </div>
                                    <EditarPagoModal pago={pago} operacionId={id} />
                                </div>
                            ))}
                            {operacion.pagos.length === 0 && (
                                <p className="text-center py-12 text-slate-400 text-sm italic bg-slate-50 rounded-lg border border-dashed border-slate-200">Sin pagos registrados</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBlock({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">{label}</p>
            <p className={`text-xl font-black ${bold ? 'text-blue-600' : 'text-slate-900'} tracking-tight`}>{value}</p>
        </div>
    );
}
