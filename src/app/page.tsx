import { FileText, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [pendienteEH, pendienteAgente, hitosPendientes, completadas, ultimosPagos] = await Promise.all([
    prisma.tramoComision.aggregate({
      where: { tipo: { in: ['EUROHOME_1', 'EUROHOME_2'] }, facturable: true, factura: { is: null } },
      _sum: { base_imponible: true }
    }),
    prisma.tramoComision.aggregate({
      where: { tipo: 'AGENTE', facturable: true, factura: { is: null } },
      _sum: { base_imponible: true }
    }),
    prisma.tramoComision.count({ where: { facturable: false } }),
    prisma.operacion.count({ where: { estado: 'ACTIVA' } }),
    prisma.pago.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      include: { operacion: { include: { vivienda: true, cliente: true, promocion: true } } }
    })
  ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pendiente Facturar EH" value={`${(pendienteEH._sum.base_imponible || 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`} icon={<FileText className="text-blue-600" />} />
        <StatCard title="Pendiente Facturar Agente" value={`${(pendienteAgente._sum.base_imponible || 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`} icon={<TrendingUp className="text-orange-600" />} />
        <StatCard title="Hitos por Alcanzar" value={hitosPendientes.toString()} icon={<AlertCircle className="text-yellow-600" />} />
        <StatCard title="Completadas/Cobradas" value={completadas.toString()} icon={<CheckCircle2 className="text-green-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full"></div>

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
            <TrendingUp size={20} className="text-slate-400" />
            Últimos Pagos Recibidos
          </h2>
          <div className="space-y-4 relative z-10">
            {ultimosPagos.length === 0 ? (
              <p className="text-slate-500 text-sm italic py-4 text-center">No hay pagos registrados todavía.</p>
            ) : (
              ultimosPagos.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">{pago.operacion.promocion.nombre} - {pago.operacion.vivienda.codigo}</p>
                    <p className="text-sm text-slate-500">{pago.operacion.cliente.nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {pago.importe.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{new Date(pago.fecha).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-slate-400" />
            Operaciones con Hitos Próximos
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 italic mb-2">Aquí aparecerán las viviendas que están cerca de alcanzar un hito de facturación.</p>
            <div className="p-8 border-2 border-dashed border-slate-100 rounded-lg text-center">
              <Link href="/operaciones" className="text-blue-600 font-bold hover:underline">Ver todas las operaciones →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg">
        {icon}
      </div>
    </div>
  );
}
