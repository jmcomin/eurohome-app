import { prisma } from "@/lib/prisma";
import QuickEditTable from "../QuickEditTable";

export default async function QuickEditPage() {
    const clientes = await prisma.cliente.findMany({
        orderBy: { nombre: 'asc' }
    });

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <QuickEditTable initialClientes={clientes} />
        </div>
    );
}
