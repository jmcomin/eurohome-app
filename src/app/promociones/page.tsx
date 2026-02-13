import { Home, Plus, MapPin, Building2, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PromocionesPage() {
    const promociones = await prisma.promocion.findMany({
        include: {
            _count: {
                select: { viviendas: true }
            }
        },
        orderBy: { nombre: 'asc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Promociones</h1>
                    <p className="text-slate-500 text-sm font-medium">Gestión de proyectos y configuración de comisiones.</p>
                </div>
                <Link href="/promociones/nueva" className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition shadow-sm font-bold">
                    <Plus size={18} />
                    <span>Nueva Promoción</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promociones.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="text-slate-400" size={32} />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">No hay promociones registradas.</p>
                        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Importa los datos de Excel o añade una promoción manualmente para comenzar.</p>
                        <button className="mt-6 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Importar datos ahora</button>
                    </div>
                ) : (
                    promociones.map((promo) => (
                        <Link key={promo.id} href={`/promociones/${promo.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden block">
                            {/* Accent background */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full group-hover:bg-blue-50 transition-colors"></div>

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                                    <Home size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-1 text-blue-600 font-black text-xs uppercase tracking-tighter">
                                        <TrendingUp size={12} />
                                        <span>
                                            {promo.comision_total_pct.toLocaleString('es-ES', { maximumFractionDigits: 2 })}% EH
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{promo.nombre}</h3>
                                <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <MapPin size={10} className="mr-1" />
                                    <span>Configuración Estándar</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Viviendas</p>
                                        <p className="text-lg font-black text-slate-900">{promo._count.viviendas.toLocaleString('es-ES')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">IVA</p>
                                        <p className="text-lg font-black text-slate-900">
                                            {promo.iva_porcentaje.toLocaleString('es-ES', { maximumFractionDigits: 2 })}%
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Hitos Pago</p>
                                        <p className="text-xs font-bold text-slate-600">
                                            {promo.hito_1_pct.toLocaleString('es-ES', { maximumFractionDigits: 2 })}% / {promo.hito_2_pct.toLocaleString('es-ES', { maximumFractionDigits: 2 })}%
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
                                        <Building2 size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ver Detalles</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
