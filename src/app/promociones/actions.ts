'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recalculateMilestones } from "@/lib/milestone-engine";

export async function createPromocion(formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const comision_total_pct = parseFloat(formData.get('comision_total_pct') as string) || 6.0;
    const iva_porcentaje = parseFloat(formData.get('iva_porcentaje') as string) || 10.0;
    const hito_1_pct = parseFloat(formData.get('hito_1_pct') as string) || 15.0;
    const hito_2_pct = parseFloat(formData.get('hito_2_pct') as string) || 30.0;
    const reparto_hito_1 = parseFloat(formData.get('reparto_hito_1') as string) || 50.0;
    const reparto_hito_2 = parseFloat(formData.get('reparto_hito_2') as string) || 50.0;

    await prisma.promocion.create({
        data: {
            nombre,
            comision_total_pct,
            iva_porcentaje,
            hito_1_pct,
            hito_2_pct,
            reparto_hito_1,
            reparto_hito_2,
        }
    });

    revalidatePath('/promociones');
    redirect('/promociones');
}

export async function updatePromocion(id: string, formData: FormData) {
    const nombre = formData.get('nombre') as string;
    const comision_total_pct = parseFloat(formData.get('comision_total_pct') as string) || 6.0;
    const iva_porcentaje = parseFloat(formData.get('iva_porcentaje') as string) || 10.0;
    const hito_1_pct = parseFloat(formData.get('hito_1_pct') as string) || 15.0;
    const hito_2_pct = parseFloat(formData.get('hito_2_pct') as string) || 30.0;
    const reparto_hito_1 = parseFloat(formData.get('reparto_hito_1') as string) || 50.0;
    const reparto_hito_2 = parseFloat(formData.get('reparto_hito_2') as string) || 50.0;

    await prisma.promocion.update({
        where: { id },
        data: {
            nombre,
            comision_total_pct,
            iva_porcentaje,
            hito_1_pct,
            hito_2_pct,
            reparto_hito_1,
            reparto_hito_2,
        }
    });

    revalidatePath('/promociones');
    revalidatePath(`/promociones/${id}`);
    redirect('/promociones');
}

export async function deletePromocion(id: string) {
    // Nota: Esto fallará si hay dependencias (viviendas, operaciones) si no se maneja cascada o borrado manual.
    // Para simplificar, asumiremos que el usuario sabe lo que hace o prisma maneja la integridad.
    await prisma.promocion.delete({
        where: { id }
    });

    revalidatePath('/promociones');
    redirect('/promociones');
}

export async function upsertVivienda(promocionId: string, formData: FormData) {
    const id = formData.get('id') as string;
    const codigo = formData.get('codigo') as string;
    const nombre = formData.get('nombre') as string;
    const planta = formData.get('planta') as string;
    const letra = formData.get('letra') as string;
    const precio_sin_iva = parseFloat(formData.get('precio_sin_iva') as string) || 0;

    if (id) {
        const updatedVivienda = await prisma.vivienda.update({
            where: { id },
            data: { codigo, nombre, planta, letra, precio_sin_iva },
            include: { operaciones: { select: { id: true } } }
        });

        // Disparar recálculo para todas las operaciones de esta vivienda
        for (const op of updatedVivienda.operaciones) {
            await recalculateMilestones(op.id);
            revalidatePath(`/operaciones/${op.id}`);
        }
        revalidatePath("/operaciones");
    } else {
        await prisma.vivienda.create({
            data: { promocionId, codigo, nombre, planta, letra, precio_sin_iva }
        });
    }

    revalidatePath(`/promociones/${promocionId}`);
}

export async function deleteVivienda(promocionId: string, viviendaId: string) {
    try {
        const viviendaConOperaciones = await prisma.vivienda.findUnique({
            where: { id: viviendaId },
            include: { _count: { select: { operaciones: true } } }
        });

        if (viviendaConOperaciones && viviendaConOperaciones._count.operaciones > 0) {
            return {
                success: false,
                error: "No se puede eliminar la vivienda porque tiene operaciones o ventas asociadas."
            };
        }

        await prisma.vivienda.delete({
            where: { id: viviendaId }
        });

        revalidatePath(`/promociones/${promocionId}`);
        return { success: true };
    } catch (error) {
        console.error("Error en deleteVivienda:", error);
        return { success: false, error: "Error al eliminar la vivienda." };
    }
}

export async function bulkCreateViviendas(promocionId: string, viviendas: any[]) {
    try {
        await prisma.$transaction(
            viviendas.map((v) =>
                prisma.vivienda.upsert({
                    where: {
                        promocionId_codigo: {
                            promocionId,
                            codigo: v.codigo
                        }
                    },
                    update: {
                        nombre: v.nombre,
                        planta: v.planta,
                        letra: v.letra,
                        precio_sin_iva: v.precio_sin_iva
                    },
                    create: {
                        promocionId,
                        codigo: v.codigo,
                        nombre: v.nombre,
                        planta: v.planta,
                        letra: v.letra,
                        precio_sin_iva: v.precio_sin_iva
                    }
                })
            )
        );

        // Disparar recálculo para todas las operaciones de la promoción
        // (ya que no sabemos cuáles han cambiado de precio fácilmente en el bulk)
        const operaciones = await prisma.operacion.findMany({
            where: { promocionId },
            select: { id: true }
        });

        for (const op of operaciones) {
            await recalculateMilestones(op.id);
            revalidatePath(`/operaciones/${op.id}`);
        }

        revalidatePath("/operaciones");
        revalidatePath(`/promociones/${promocionId}`);
        return { success: true, count: viviendas.length };
    } catch (error: any) {
        console.error("Error en bulkCreateViviendas:", error);
        return { success: false, error: "Error al procesar la carga masiva." };
    }
}

export async function deleteAllViviendas(promocionId: string) {
    try {
        // Obtenemos solo las viviendas que NO tienen operaciones asociadas
        const viviendasSinOperaciones = await prisma.vivienda.findMany({
            where: {
                promocionId,
                operaciones: { none: {} }
            },
            select: { id: true }
        });

        const idsParaBorrar = viviendasSinOperaciones.map(v => v.id);

        if (idsParaBorrar.length === 0) {
            return {
                success: true,
                count: 0,
                message: "No hay viviendas disponibles para borrar (todas tienen operaciones asociadas)."
            };
        }

        await prisma.vivienda.deleteMany({
            where: { id: { in: idsParaBorrar } }
        });

        revalidatePath(`/promociones/${promocionId}`);
        return { success: true, count: idsParaBorrar.length };
    } catch (error: any) {
        console.error("Error en deleteAllViviendas:", error);
        return { success: false, error: "Error al vaciar el inventario." };
    }
}
