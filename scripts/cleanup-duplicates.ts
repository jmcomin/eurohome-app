import { prisma } from "../src/lib/prisma";

async function cleanupDuplicates() {
    console.log("🧹 Iniciando limpieza de operaciones duplicadas...");

    const viviendas = await prisma.vivienda.findMany({
        include: {
            operaciones: {
                where: { estado: 'ACTIVA' },
                orderBy: { createdAt: 'desc' } // Mantener la más reciente
            },
            promocion: true
        }
    });

    const duplicados = viviendas.filter(v => v.operaciones.length > 1);

    if (duplicados.length === 0) {
        console.log("✅ No hay duplicados que limpiar.");
    } else {
        for (const v of duplicados) {
            console.log(`🏠 Limpiando vivienda: ${v.codigo} - ${v.promocion.nombre}`);

            // Mantenemos la primera (la más reciente por el orderby desc)
            const [mantener, ...eliminar] = v.operaciones;

            console.log(`   ✅ Manteniendo: ${mantener.id} (creada ${mantener.createdAt})`);

            for (const op of eliminar) {
                console.log(`   🗑️ Eliminando: ${op.id} (creada ${op.createdAt})`);

                // 1. Primero hay que borrar pagos asociados por integridad
                await prisma.pago.deleteMany({ where: { operacionId: op.id } });

                // 2. Borrar hitos
                await prisma.tramoComision.deleteMany({ where: { operacionId: op.id } });

                // 3. Borrar la operación
                await prisma.operacion.delete({ where: { id: op.id } });
            }
        }
        console.log("✨ Limpieza completada con éxito.");
    }

    await prisma.$disconnect();
}

cleanupDuplicates();
