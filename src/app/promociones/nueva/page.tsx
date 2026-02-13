import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createPromocion } from "../actions";

export default function NuevaPromocionPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/promociones" className="text-slate-500 hover:text-slate-900 flex items-center space-x-2 text-sm mb-2 transition-colors">
                        <ArrowLeft size={16} />
                        <span>Volver a Promociones</span>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nueva Promoción</h1>
                    <p className="text-slate-500 font-medium">Configura un nuevo proyecto y sus condiciones comerciales.</p>
                </div>
            </div>

            <form action={createPromocion} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Información General */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Información General</h2>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre de la Promoción</label>
                        <input
                            name="nombre"
                            type="text"
                            required
                            placeholder="Ej: Residencial Los Olivos"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">% Comisión EH</label>
                            <input
                                name="comision_total_pct"
                                type="number"
                                step="0.01"
                                defaultValue="6.00"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">% IVA Aplicable</label>
                            <input
                                name="iva_porcentaje"
                                type="number"
                                step="0.01"
                                defaultValue="10.00"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Configuración de Hitos */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Hitos de Pago</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">% Hito 1 (Contrato)</label>
                            <input
                                name="hito_1_pct"
                                type="number"
                                step="0.01"
                                defaultValue="15.00"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">% Hito 2 (Escritura)</label>
                            <input
                                name="hito_2_pct"
                                type="number"
                                step="0.01"
                                defaultValue="30.00"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">% Reparto Hito 1</label>
                            <input
                                name="reparto_hito_1"
                                type="number"
                                step="0.01"
                                defaultValue="50.00"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition font-medium"
                            />
                            <p className="text-[10px] text-slate-400 font-medium italic">EH recibe el 50% al completar el Hito 1.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">% Reparto Hito 2</label>
                            <input
                                name="reparto_hito_2"
                                type="number"
                                step="0.01"
                                defaultValue="50.00"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition font-medium"
                            />
                            <p className="text-[10px] text-slate-400 font-medium italic">EH recibe el 50% al completar el Hito 2.</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-full flex justify-end">
                    <button
                        type="submit"
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 hover:bg-slate-800 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 font-black uppercase tracking-widest text-xs"
                    >
                        <Save size={18} />
                        <span>Guardar Promoción</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
