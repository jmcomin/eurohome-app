"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearCliente(formData: FormData) {
    const nombre = formData.get("nombre") as string;
    const nif_pasaporte = formData.get("nif_pasaporte") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;

    if (!nombre || !nif_pasaporte) {
        return { success: false, error: "El nombre y el NIF son obligatorios." };
    }

    try {
        // Verificar si ya existe un cliente con ese NIF
        const existente = await prisma.cliente.findUnique({
            where: { nif_pasaporte }
        });

        if (existente) {
            return { success: false, error: "Ya existe un cliente con este NIF/Pasaporte." };
        }

        await prisma.cliente.create({
            data: {
                nombre,
                nif_pasaporte,
                email: email || null,
                telefono: telefono || null
            }
        });

        revalidatePath("/clientes");
        return { success: true };
    } catch (error: any) {
        console.error("Error al crear cliente:", error);
        return { success: false, error: "Error interno al crear el cliente." };
    }
}

export async function actualizarCliente(id: string, formData: FormData) {
    const nombre = formData.get("nombre") as string;
    const nif_pasaporte = formData.get("nif_pasaporte") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;

    if (!nombre || !nif_pasaporte) {
        return { success: false, error: "El nombre y el NIF son obligatorios." };
    }

    try {
        // Verificar si el NIF ya pertenece a OTRO cliente
        const existente = await prisma.cliente.findFirst({
            where: {
                nif_pasaporte,
                NOT: { id }
            }
        });

        if (existente) {
            return { success: false, error: "Ya existe otro cliente con este NIF/Pasaporte." };
        }

        await prisma.cliente.update({
            where: { id },
            data: {
                nombre,
                nif_pasaporte,
                email: email || null,
                telefono: telefono || null
            }
        });

        revalidatePath("/clientes");
        revalidatePath(`/clientes/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar cliente:", error);
        return { success: false, error: "Error interno al actualizar el cliente." };
    }
}
export async function actualizarClientesBulk(updates: { id: string, nombre: string, nif_pasaporte: string, email: string | null, telefono: string | null }[]) {
    try {
        await prisma.$transaction(
            updates.map(u =>
                prisma.cliente.update({
                    where: { id: u.id },
                    data: {
                        nombre: u.nombre,
                        nif_pasaporte: u.nif_pasaporte,
                        email: u.email || null,
                        telefono: u.telefono || null
                    }
                })
            )
        );

        revalidatePath("/clientes");
        return { success: true };
    } catch (error: any) {
        console.error("Error en actualizarClientesBulk:", error);
        return { success: false, error: "Error al actualizar los clientes en bloque. Verifica que los NIFs no estén duplicados." };
    }
}
export async function eliminarCliente(id: string) {
    try {
        // Verificar si el cliente tiene operaciones asociadas
        const clienteConOperaciones = await prisma.cliente.findUnique({
            where: { id },
            include: { _count: { select: { operaciones: true } } }
        });

        if (clienteConOperaciones && clienteConOperaciones._count.operaciones > 0) {
            return {
                success: false,
                error: "No se puede eliminar el cliente porque tiene operaciones o ventas asociadas."
            };
        }

        await prisma.cliente.delete({
            where: { id }
        });

        revalidatePath("/clientes");
        return { success: true };
    } catch (error: any) {
        console.error("Error en eliminarCliente:", error);
        return { success: false, error: "Error interno al intentar eliminar el cliente." };
    }
}
export async function bulkUpsertClientes(clientes: { nombre: string, nif_pasaporte: string, email: string | null, telefono: string | null }[]) {
    try {
        await prisma.$transaction(
            clientes.map(c =>
                prisma.cliente.upsert({
                    where: { nif_pasaporte: c.nif_pasaporte },
                    update: {
                        nombre: c.nombre,
                        email: c.email || null,
                        telefono: c.telefono || null
                    },
                    create: {
                        nombre: c.nombre,
                        nif_pasaporte: c.nif_pasaporte,
                        email: c.email || null,
                        telefono: c.telefono || null
                    }
                })
            )
        );

        revalidatePath("/clientes");
        return { success: true };
    } catch (error: any) {
        console.error("Error en bulkUpsertClientes:", error);
        return { success: false, error: "Error al procesar la carga masiva de clientes." };
    }
}
