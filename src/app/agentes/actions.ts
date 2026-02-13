"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAgentes() {
    try {
        return await prisma.agente.findMany({
            orderBy: { nombre: 'asc' }
        });
    } catch (error) {
        console.error("Error al obtener agentes:", error);
        return [];
    }
}

export async function crearAgente(formData: FormData) {
    const nombre = formData.get("nombre") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const comisionStr = formData.get("comision_base_pct") as string;

    const comision_base_pct = parseFloat(comisionStr) || 0;

    if (!nombre) {
        return { success: false, error: "El nombre es obligatorio." };
    }

    try {
        await prisma.agente.create({
            data: {
                nombre,
                email: email || null,
                telefono: telefono || null,
                comision_base_pct
            }
        });

        revalidatePath("/agentes");
        return { success: true };
    } catch (error) {
        console.error("Error al crear agente:", error);
        return { success: false, error: "Error al crear el agente." };
    }
}

export async function actualizarAgente(id: string, formData: FormData) {
    const nombre = formData.get("nombre") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const comisionStr = formData.get("comision_base_pct") as string;

    const comision_base_pct = parseFloat(comisionStr) || 0;

    try {
        await prisma.agente.update({
            where: { id },
            data: {
                nombre,
                email: email || null,
                telefono: telefono || null,
                comision_base_pct
            }
        });

        revalidatePath("/agentes");
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar agente:", error);
        return { success: false, error: "Error al actualizar el agente." };
    }
}

export async function eliminarAgente(id: string) {
    try {
        // Verificar si tiene operaciones vinculadas
        const count = await prisma.operacion.count({
            where: { agenteId: id }
        });

        if (count > 0) {
            return { success: false, error: "No se puede eliminar un agente con operaciones vinculadas." };
        }

        await prisma.agente.delete({
            where: { id }
        });

        revalidatePath("/agentes");
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar agente:", error);
        return { success: false, error: "Error al eliminar el agente." };
    }
}
