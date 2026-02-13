"use client";

import { useEffect, useState } from "react";
import { Printer, ArrowLeft, Check, Layers, User, Building, Euro, Trash2, CheckSquare, Square, FileCheck } from "lucide-react";
import Link from "next/link";
import { marcarComoFacturado } from "../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Definición de tipos para los datos (se cargan vía props o fetch)
interface Tramo {
    id: string;
    tipo: string;
    base_imponible: number;
    iva: number;
    operacion: {
        cliente: { nombre: string };
        promocion: { nombre: string };
        vivienda: { codigo: string, planta: string, letra: string };
        agente?: { nombre: string | null };
    };
}

// Componente interno que usa useSearchParams
function FacturacionMasivaContent() {
    const [tramos, setTramos] = useState<Tramo[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const promocionId = searchParams.get('promocionId');

    // Cargar datos (en un entorno real esto vendría de un Server Component o API)
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const url = promocionId ? `/api/facturacion/pendientes?promocionId=${promocionId}` : '/api/facturacion/pendientes';
                const response = await fetch(url);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setTramos(data);
                } else {
                    console.error("API returned non-array data:", data);
                    setTramos([]);
                }
            } catch (error) {
                console.error("Error cargando tramos:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [promocionId]);

    const naturalSort = (a: Tramo, b: Tramo) =>
        (a.operacion.vivienda?.codigo || '').localeCompare(b.operacion.vivienda?.codigo || '', undefined, { numeric: true, sensitivity: 'base' });

    const safeTramos = Array.isArray(tramos) ? tramos : [];
    const tramos15 = safeTramos.filter(t => t && t.tipo === 'EUROHOME_1').sort(naturalSort);
    const tramos30 = safeTramos.filter(t => t && t.tipo === 'EUROHOME_2').sort(naturalSort);
    const tramosAgente = safeTramos.filter(t => t && t.tipo === 'AGENTE').sort(naturalSort);

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSection = (sectionTramos: Tramo[]) => {
        const sectionIds = sectionTramos.map(t => t.id);
        const allSelected = sectionIds.every(id => selectedIds.has(id));

        const next = new Set(selectedIds);
        if (allSelected) {
            sectionIds.forEach(id => next.delete(id));
        } else {
            sectionIds.forEach(id => next.add(id));
        }
        setSelectedIds(next);
    };

    const handleFacturar = async () => {
        if (selectedIds.size === 0) return;

        setIsProcessing(true);
        const ids = Array.from(selectedIds);
        const result = await marcarComoFacturado(ids);

        if (result.success) {
            alert(`¡Éxito! Se han marcado ${result.count} tramos como validados.`);
            // Recargar datos
            setTramos(tramos.filter(t => !selectedIds.has(t.id)));
            setSelectedIds(new Set());
            router.refresh();
        } else {
            alert("Error: " + result.error);
        }
        setIsProcessing(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const promotionName = promocionId && tramos.length > 0 ? tramos[0].operacion.promocion.nombre : null;

    if (loading) return <div className="p-10 text-center font-black animate-pulse">CARGANDO TRAMOS...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Estilos de Impresión */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { 
                        background: white !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                        font-size: 10px !important;
                    }
                    /* Forzar que el contenedor principal ocupe todo el ancho */
                    main, .flex-1, .p-8 {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .space-y-12 { margin: 0 !important; gap: 0 !important; }
                    section { 
                        padding: 10px 15px !important; 
                        page-break-inside: avoid;
                    }
                    .page-break { page-break-before: always; }
                    table { 
                        width: 100% !important; 
                        border-collapse: collapse !important;
                        table-layout: fixed !important; /* Volvemos a fixed pero con anchos garantizados */
                    }
                    th, td { 
                        border: 1px solid #000 !important; /* Borde negro para máxima visibilidad */
                        padding: 8px !important;
                        overflow: visible !important; /* Cambiado de hidden a visible para evitar recortes */
                        white-space: normal !important;
                        word-wrap: break-word !important; 
                        color: black !important;
                        vertical-align: top !important;
                        box-sizing: border-box !important;
                    }
                    
                    /* Gestión de columnas para 4 iguales */
                    /* Ocultamos la primera columna (checkbox) de forma que no ocupe espacio pero que el conteo nth-child sea consistente */
                    th:nth-child(1), td:nth-child(1) { 
                        display: none !important;
                    }
                    
                    /* Asignamos 25% real a cada una de las 4 restantes */
                    th:nth-child(2), td:nth-child(2),
                    th:nth-child(3), td:nth-child(3),
                    th:nth-child(4), td:nth-child(4),
                    th:nth-child(5), td:nth-child(5) { 
                        width: 25% !important;
                        min-width: 25% !important;
                        max-width: 25% !important;
                    }
                    
                    th { 
                        background-color: #eee !important;
                        font-weight: 800 !important;
                        text-align: center !important;
                    }
                    
                    /* Reset de colores para impresión */
                    .text-slate-400, .text-slate-500, .text-slate-900, .font-bold { 
                        color: black !important; 
                        opacity: 1 !important; 
                    }
                    .no-print { display: none !important; }
                    .shadow-xl, .shadow-lg, .shadow-sm, .rounded-2xl, .rounded-3xl { 
                        box-shadow: none !important; 
                        border-radius: 0 !important; 
                    }
                }
            `}</style>

            {/* Header - No print */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <Link href={promocionId ? "/facturacion/series" : "/facturacion"} className="group flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-2">
                        <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {promocionId ? 'Volver a Selección' : 'Volver a Liquidaciones'}
                        </span>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {promotionName ? `Liquidación: ${promotionName}` : 'Listado de Liquidación'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {promotionName ? `Panel de control de pagos para ${promotionName}` : 'Gestión de hitos por volumen de pago.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="border border-slate-200 bg-white px-6 py-3 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                    >
                        <Printer size={18} />
                        <span>Imprimir Lista</span>
                    </button>
                    <button
                        onClick={handleFacturar}
                        disabled={selectedIds.size === 0 || isProcessing}
                        className={`bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm transition shadow-lg flex items-center gap-2 ${(selectedIds.size === 0 || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 shadow-blue-200'
                            }`}
                    >
                        {isProcessing ? <Layers className="animate-spin" size={18} /> : <FileCheck size={18} />}
                        <span>Validar Comisión ({selectedIds.size})</span>
                    </button>
                </div>
            </div>

            {/* SECCIÓN HITO 15% */}
            <section className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">HITO 1</div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Liquidación al 15% Pagado</h2>
                    </div>
                    <button
                        onClick={() => toggleSection(tramos15)}
                        className="no-print text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2"
                    >
                        {tramos15.every(t => selectedIds.has(t.id)) ? <CheckSquare size={14} /> : <Square size={14} />}
                        Seleccionar Sección
                    </button>
                </div>

                <InvoicingTable
                    tramos={tramos15}
                    selectedIds={selectedIds}
                    onToggle={toggleSelect}
                />
            </section>

            {/* SECCIÓN HITO 30% */}
            <section className="space-y-4 page-break">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">HITO 2</div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Liquidación al 30% Pagado (o más)</h2>
                    </div>
                    <button
                        onClick={() => toggleSection(tramos30)}
                        className="no-print text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2"
                    >
                        {tramos30.every(t => selectedIds.has(t.id)) ? <CheckSquare size={14} /> : <Square size={14} />}
                        Seleccionar Sección
                    </button>
                </div>

                <InvoicingTable
                    tramos={tramos30}
                    selectedIds={selectedIds}
                    onToggle={toggleSelect}
                />
            </section>

            {/* SECCIÓN AGENTES */}
            <section className="space-y-4 page-break">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">AGENTES</div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Liquidación de Comisiones Agentes</h2>
                    </div>
                    <button
                        onClick={() => toggleSection(tramosAgente)}
                        className="no-print text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2"
                    >
                        {tramosAgente.every(t => selectedIds.has(t.id)) ? <CheckSquare size={14} /> : <Square size={14} />}
                        Seleccionar Sección
                    </button>
                </div>

                <InvoicingTable
                    tramos={tramosAgente}
                    selectedIds={selectedIds}
                    onToggle={toggleSelect}
                />
            </section>
        </div>
    );
}

function InvoicingTable({ tramos, selectedIds, onToggle }: { tramos: Tramo[], selectedIds: Set<string>, onToggle: (id: string) => void }) {
    if (tramos.length === 0) {
        return (
            <div className="py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-medium italic">
                No hay tramos pendientes en este hito.
            </div>
        );
    }

    // Cálculo de totales
    const totalBase = tramos.reduce((acc, t) => acc + t.base_imponible, 0);
    const totalIva = tramos.reduce((acc, t) => acc + t.iva, 0);
    const totalFinal = totalBase + totalIva;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        <th className="px-6 py-4 w-10 no-print"></th>
                        <th className="px-6 py-4">Cliente / Promoción</th>
                        <th className="px-6 py-4 text-right">Base Imponible</th>
                        <th className="px-6 py-4 text-right">IVA</th>
                        <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {tramos.map((tramo) => (
                        <tr
                            key={tramo.id}
                            onClick={() => onToggle(tramo.id)}
                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedIds.has(tramo.id) ? 'bg-blue-50/50' : ''}`}
                        >
                            <td className="px-6 py-4 no-print" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onToggle(tramo.id)}
                                    className={`transition-colors ${selectedIds.has(tramo.id) ? 'text-blue-600' : 'text-slate-300'}`}
                                >
                                    {selectedIds.has(tramo.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-900 leading-tight">
                                    {tramo.tipo === 'AGENTE' ? (tramo.operacion.agente?.nombre || 'Agente Desconocido') : tramo.operacion.cliente.nombre}
                                </div>
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">
                                    {tramo.tipo === 'AGENTE' ? `Comisión Agente - Cliente: ${tramo.operacion.cliente.nombre}` : tramo.operacion.promocion.nombre} | Viv: {tramo.operacion.vivienda.planta}{tramo.operacion.vivienda.letra} ({tramo.operacion.vivienda.codigo})
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-600">
                                {tramo.base_imponible.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-500 text-xs">
                                {tramo.iva.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-900">
                                {(tramo.base_imponible + tramo.iva).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-black">
                    <tr>
                        <td className="px-6 py-4 no-print"></td>
                        <td className="px-6 py-4 uppercase tracking-widest text-xs">TOTALES HITO</td>
                        <td className="px-6 py-4 text-right text-base">
                            {totalBase.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-right text-base">
                            {totalIva.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-right text-xl">
                            {totalFinal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

// Exportación principal envuelta en Suspense para evitar errores de hidratación/build con useSearchParams
export default function FacturacionMasivaPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-black animate-pulse">CARGANDO...</div>}>
            <FacturacionMasivaContent />
        </Suspense>
    );
}
