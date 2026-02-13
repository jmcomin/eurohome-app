// src/app/clientes/page.tsx

import Link from "next/link";
import { UserPlus, Mail, Phone, Edit2, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import SearchInput from "@/components/SearchInput";
import { DeleteClienteButton } from "./DeleteClienteButton";
import ClientesHeaderActions from "./ClientesHeaderActions";

export default async function ClientesPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query } = await searchParams;

    const clientes = await prisma.cliente.findMany({
        where: query ? {
            OR: [
                { nombre: { contains: query } },
                { nif_pasaporte: { contains: query } },
            ]
        } : {},
        include: {
            _count: {
                select: { operaciones: true }
            },
            operaciones: {
                select: {
                    id: true
                }
            }
        },
        orderBy: { nombre: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
                    <p className="text-slate-500 text-sm">Base de datos de compradores y sus datos de contacto.</p>
                </div>
                <ClientesHeaderActions />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center space-x-4">
                    <SearchInput placeholder="Buscar por nombre o NIF..." />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nombre / NIF</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Operaciones</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {clientes.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic font-medium">No se encontraron clientes.</td>
                                </tr>
                            ) : (
                                clientes.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{cliente.nombre}</div>
                                            <div className="text-xs text-slate-500">{cliente.nif_pasaporte}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                {/* Asumiendo que estos campos podrían existir en el futuro o se manejan de otra forma */}
                                                <div className="flex items-center text-slate-600 text-xs">
                                                    <Mail size={12} className="mr-2 opacity-50" />
                                                    N/A
                                                </div>
                                                <div className="flex items-center text-slate-600 text-xs">
                                                    <Phone size={12} className="mr-2 opacity-50" />
                                                    N/A
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                {cliente._count.operaciones.toLocaleString('es-ES')} {cliente._count.operaciones === 1 ? 'venta' : 'ventas'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                                            <Link
                                                href={`/clientes/${cliente.id}`}
                                                className="text-slate-400 hover:text-slate-900 transition-colors p-2"
                                                title="Ver Ficha"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <DeleteClienteButton id={cliente.id} nombre={cliente.nombre} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
