import { ArrowLeft, Building2, ChevronRight, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import path from "path";
const Database = require("better-sqlite3");

export default async function SeriesFacturacionPage() {
    let promotions: any[] = [];

    try {
        const dbPath = path.join(process.cwd(), "prisma", "dev.db");
        const db = new Database(dbPath);

        // Consulta para obtener promociones que tienen tramos facturables pendientes
        const sql = `
            SELECT DISTINCT p.id, p.nombre, COUNT(t.id) as pendientes
            FROM Promocion p
            JOIN Operacion o ON o.promocionId = p.id
            JOIN TramoComision t ON t.operacionId = o.id
            WHERE t.facturable = 1 AND (t.validado = 0 OR t.validado IS NULL)
            GROUP BY p.id
            ORDER BY p.nombre ASC
        `;

        promotions = db.prepare(sql).all();
        db.close();
    } catch (error) {
        console.error("Error fetching promotions for liquidation:", error);
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/facturacion" className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition font-bold group mb-2">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs uppercase tracking-widest font-black">Volver a Liquidaciones</span>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">Liquidación por Promoción</h1>
                </div>
            </div>

            {promotions.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 size={32} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">No hay liquidaciones pendientes</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                        Todas las promociones están al día o no tienen tramos que hayan cumplido los hitos de pago.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotions.map((promo) => (
                        <Link
                            key={promo.id}
                            href={`/facturacion/masivo?promocionId=${promo.id}`}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <Building2 className="text-blue-500 mb-4" size={24} />
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                    {promo.nombre}
                                </h3>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {promo.pendientes} Tramos pendientes
                                    </span>
                                    <ChevronRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </div>
            )}

            <div className="flex items-center space-x-3 text-slate-400 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                <Info size={20} />
                <p className="text-xs font-medium italic">
                    Selecciona una promoción para acceder a su panel de liquidación masiva. Allí podrás validar los hitos y confirmar los cobros de forma individual para ese proyecto.
                </p>
            </div>
        </div>
    );
}
