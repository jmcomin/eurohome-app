"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recalculateMilestones } from "@/lib/milestone-engine";

export async function registrarPago(operacionId: string, formData: FormData) {
    const importeStr = formData.get("importe") as string;
    const fechaStr = formData.get("fecha") as string;
    const metodo = formData.get("metodo") as string;
    const referencia = formData.get("referencia") as string;

    const importe = parseFloat(importeStr);

    if (isNaN(importe) || importe <= 0) {
        return { success: false, error: "El importe debe ser un número válido mayor a 0." };
    }

    if (!fechaStr) {
        return { success: false, error: "La fecha del pago es obligatoria." };
    }

    try {
        console.log(`[PAGOS] Registrando pago para operacion ${operacionId}...`);
        // 1. Crear el pago
        const pago = await prisma.pago.create({
            data: {
                operacionId,
                importe,
                fecha: new Date(fechaStr),
                metodo: metodo || "Manual",
                referencia: referencia || undefined,
            }
        });
        console.log(`[PAGOS] Pago creado: ${pago.id}. Recalculando hitos...`);

        // 2. Recalcular hitos automáticamente
        await recalculateMilestones(operacionId);
        console.log(`[PAGOS] Hitos recalculados. Revalidando ruta...`);

        revalidatePath(`/operaciones/${operacionId}`);
        console.log(`[PAGOS] Proceso completado con éxito.`);
        return { success: true };
    } catch (error: any) {
        console.error("Error al registrar pago:", error);
        return { success: false, error: "Error interno al registrar el pago." };
    }
}

export async function editarPago(id: string, operacionId: string, formData: FormData) {
    const importeStr = formData.get("importe") as string;
    const fechaStr = formData.get("fecha") as string;
    const metodo = formData.get("metodo") as string;
    const referencia = formData.get("referencia") as string;

    const importe = parseFloat(importeStr);

    if (isNaN(importe) || importe <= 0) {
        return { success: false, error: "El importe debe ser un número válido mayor a 0." };
    }

    try {
        console.log(`[PAGOS] Editando pago ${id} (operacion ${operacionId})...`);
        await prisma.pago.update({
            where: { id },
            data: {
                importe,
                fecha: new Date(fechaStr),
                metodo: metodo || "Manual",
                referencia: referencia || undefined,
            }
        });
        console.log(`[PAGOS] Pago actualizado. Recalculando hitos...`);

        await recalculateMilestones(operacionId);
        console.log(`[PAGOS] Hitos recalculados. Revalidando ruta...`);

        revalidatePath(`/operaciones/${operacionId}`);
        console.log(`[PAGOS] Edición completada con éxito.`);
        return { success: true };
    } catch (error: any) {
        console.error("Error al editar pago:", error);
        return { success: false, error: "Error interno al editar el pago." };
    }
}

export async function eliminarPago(id: string, operacionId: string) {
    try {
        console.log(`[PAGOS] Eliminando pago ${id}...`);
        await prisma.pago.delete({
            where: { id }
        });
        console.log(`[PAGOS] Pago eliminado. Recalculando hitos...`);

        await recalculateMilestones(operacionId);
        console.log(`[PAGOS] Hitos recalculados. Revalidando ruta...`);

        revalidatePath(`/operaciones/${operacionId}`);
        console.log(`[PAGOS] Eliminación de pago completada.`);
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar pago:", error);
        return { success: false, error: "Error interno al eliminar el pago." };
    }
}

export async function crearOperacion(formData: FormData) {
    const nombreCliente = formData.get("nombreCliente") as string;
    const nif = formData.get("nif") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const promocionId = formData.get("promocionId") as string;
    const viviendaCodigo = formData.get("viviendaCodigo") as string;
    const agenteId = formData.get("agenteId") as string;

    if (!nombreCliente || !nif || !promocionId || !viviendaCodigo) {
        return { success: false, error: "Faltan campos obligatorios (Cliente, NIF, Promoción y Vivienda)." };
    }

    try {
        // 1. Upsert Cliente (vincular o crear)
        const cliente = await prisma.cliente.upsert({
            where: { nif_pasaporte: nif },
            update: {
                nombre: nombreCliente,
                email: email || undefined,
                telefono: telefono || undefined
            },
            create: {
                nombre: nombreCliente,
                nif_pasaporte: nif,
                email: email || null,
                telefono: telefono || null
            }
        });

        // 2. Buscar Vivienda (o crearla si no existe en esta prueba)
        // En un sistema real, la vivienda ya debería existir
        const vivienda = await prisma.vivienda.findFirst({
            where: {
                promocionId,
                codigo: viviendaCodigo
            }
        });

        if (!vivienda) {
            return { success: false, error: `No se encuentra la vivienda '${viviendaCodigo}' en la promoción seleccionada.` };
        }

        // 2b. Validar que la vivienda NO tenga ya una operación ACTIVA
        const operacionExistente = await prisma.operacion.findFirst({
            where: {
                viviendaId: vivienda.id,
                estado: "ACTIVA"
            }
        });

        if (operacionExistente) {
            return { success: false, error: "Esta vivienda ya tiene una operación activa. No se pueden registrar duplicados." };
        }

        // 3. Crear Operación
        const operacion = await prisma.operacion.create({
            data: {
                clienteId: cliente.id,
                promocionId,
                viviendaId: vivienda.id,
                agenteId: agenteId && agenteId !== "DIRECTA" ? agenteId : null,
                pct_comision_agente: agenteId && agenteId !== "DIRECTA" ? (await prisma.agente.findUnique({ where: { id: agenteId } }))?.comision_base_pct || 0 : 0,
                estado: "ACTIVA"
            }
        });

        // 4. Inicializar Hitos
        await recalculateMilestones(operacion.id);

        revalidatePath("/operaciones");
        return { success: true, operacionId: operacion.id };
    } catch (error: any) {
        console.error("Error al crear operación:", error);
        return { success: false, error: "Error interno al crear la operación." };
    }
}

export async function getViviendasPorPromocion(promocionId: string) {
    try {
        const viviendas = await prisma.vivienda.findMany({
            where: { promocionId },
            orderBy: { codigo: 'asc' }
        });
        return { success: true, viviendas };
    } catch (error: any) {
        console.error("Error al obtener viviendas:", error);
        return { success: false, error: "Error al cargar viviendas." };
    }
}

export async function eliminarOperacion(id: string) {
    try {
        // En SQLite sin cascade delete configurado en el esquema, 
        // eliminamos manualmente las relaciones.

        // 1. Obtener tramos para poder eliminar facturas
        const tramos = await prisma.tramoComision.findMany({
            where: { operacionId: id },
            select: { id: true }
        });
        const tramoIds = tramos.map(t => t.id);

        await prisma.$transaction([
            // 2. Eliminar facturas asociadas a los tramos
            prisma.factura.deleteMany({
                where: { tramoId: { in: tramoIds } }
            }),
            // 3. Eliminar tramos
            prisma.tramoComision.deleteMany({
                where: { operacionId: id }
            }),
            // 4. Eliminar pagos
            prisma.pago.deleteMany({
                where: { operacionId: id }
            }),
            // 5. Finalmente eliminar la operación
            prisma.operacion.delete({
                where: { id }
            })
        ]);

        revalidatePath("/operaciones");
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar operación:", error);
        return { success: false, error: "Error interno al eliminar la operación." };
    }
}

export async function cancelarOperacion(id: string) {
    try {
        await prisma.operacion.update({
            where: { id },
            data: { estado: "CANCELADA" }
        });

        revalidatePath(`/operaciones/${id}`);
        revalidatePath("/operaciones");
        return { success: true };
    } catch (error: any) {
        console.error("Error al cancelar operación:", error);
        return { success: false, error: "Error interno al cancelar la operación." };
    }
}
export async function actualizarOperacion(id: string, formData: FormData) {
    const viviendaId = formData.get("viviendaId") as string;
    const agenteId = formData.get("agenteId") as string;
    const pctComisionAgenteStr = formData.get("pct_comision_agente") as string;
    const fechaInicioStr = formData.get("fecha_inicio") as string;

    const pct_comision_agente = parseFloat(pctComisionAgenteStr) || 0;

    try {
        console.log(`[OPERACIONES] Actualizando operacion ${id}...`);
        // 1. Obtener la operación actual para ver si ha cambiado la vivienda
        const operacionActual = await prisma.operacion.findUnique({
            where: { id },
            select: { viviendaId: true }
        });

        if (!operacionActual) {
            return { success: false, error: "Operación no encontrada." };
        }

        // 2. Si cambia la vivienda, validar que la nueva no esté ocupada
        if (viviendaId !== operacionActual.viviendaId) {
            const viviendaOcupada = await prisma.operacion.findFirst({
                where: {
                    viviendaId,
                    estado: "ACTIVA",
                    NOT: { id }
                }
            });

            if (viviendaOcupada) {
                return { success: false, error: "La nueva vivienda seleccionada ya tiene una operación activa." };
            }
        }

        // 3. Actualizar la operación
        await prisma.operacion.update({
            where: { id },
            data: {
                viviendaId,
                agenteId: agenteId === "DIRECTA" ? null : agenteId,
                pct_comision_agente,
                fecha_inicio: fechaInicioStr ? new Date(fechaInicioStr) : undefined
            }
        });
        console.log(`[OPERACIONES] Operacion actualizada. Recalculando hitos...`);

        // 4. Recalcular hitos (por si cambió el precio de la vivienda o la fecha)
        await recalculateMilestones(id);
        console.log(`[OPERACIONES] Hitos recalculados. Revalidando rutas...`);

        revalidatePath(`/operaciones/${id}`);
        revalidatePath("/operaciones");
        console.log(`[OPERACIONES] Operación actualizada con éxito.`);
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar operación:", error);
        return { success: false, error: "Error interno al actualizar la operación." };
    }
}
