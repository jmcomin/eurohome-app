"use server";

import { revalidatePath } from "next/cache";
import path from "path";
const Database = require("better-sqlite3");

export async function marcarComoFacturado(tramoIds: string[]) {
    let db;
    try {
        const dbPath = path.join(process.cwd(), "prisma", "dev.db");
        db = new Database(dbPath);

        // Usar SQL directo para evitar problemas con Prisma Client en este entorno
        // Preparar la cláusula IN con el número correcto de parámetros
        const placeholders = tramoIds.map(() => '?').join(',');
        const stmt = db.prepare(`
            UPDATE TramoComision 
            SET validado = 1, fecha_validacion = ? 
            WHERE id IN (${placeholders})
        `);

        const now = new Date().toISOString();
        const info = stmt.run(now, ...tramoIds);

        console.log(`[SQL Workaround] Validados ${info.changes} registros.`);

        revalidatePath("/facturacion");
        revalidatePath("/facturacion/masivo");

        return { success: true, count: info.changes };
    } catch (error: any) {
        console.error("Error al validar tramos (Workaround SQL):", error);
        return { success: false, error: "No se pudieron validar los registros: " + error.message };
    } finally {
        if (db) db.close();
    }
}

export async function marcarComoCobrado(tramoId: string) {
    let db;
    try {
        const dbPath = path.join(process.cwd(), "prisma", "dev.db");
        db = new Database(dbPath);

        // 1. Verificar si ya existe una factura para este tramo
        const factura = db.prepare('SELECT id FROM Factura WHERE tramoId = ?').get(tramoId);

        if (factura) {
            // Actualizar estado a COBRADA
            db.prepare('UPDATE Factura SET estado = \'COBRADA\', updatedAt = ? WHERE id = ?')
                .run(new Date().toISOString(), factura.id);
        } else {
            // Crear una nueva entrada de factura marcada como COBRADA
            const id = require('crypto').randomUUID();
            const now = new Date().toISOString();
            // Generar un número de liquidación ficticio si no tiene
            const numero = `LIQ-CONF-${Math.floor(Date.now() / 1000)}`;

            db.prepare(`
                INSERT INTO Factura (id, tramoId, numero, fecha_emision, estado, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, 'COBRADA', ?, ?)
            `).run(id, tramoId, numero, now, now, now);
        }

        revalidatePath("/facturacion");
        return { success: true };
    } catch (error: any) {
        console.error("Error al marcar como cobrado:", error);
        return { success: false, error: error.message };
    } finally {
        if (db) db.close();
    }
}

export async function revertirStatus(tramoId: string) {
    let db;
    try {
        const dbPath = path.join(process.cwd(), "prisma", "dev.db");
        db = new Database(dbPath);

        // Iniciar transacción explícita
        db.prepare('BEGIN').run();

        // 1. Desvalidar el tramo
        db.prepare('UPDATE TramoComision SET validado = 0, fecha_validacion = NULL, updatedAt = ? WHERE id = ?')
            .run(new Date().toISOString(), tramoId);

        // 2. Gestionar la factura
        const factura = db.prepare('SELECT id, numero FROM Factura WHERE tramoId = ?').get(tramoId);

        if (factura) {
            if (factura.numero.startsWith('LIQ-CONF-')) {
                // Si es una liquidación confirmada automática (sin factura real), la borramos
                db.prepare('DELETE FROM Factura WHERE id = ?').run(factura.id);
                console.log(`[SQL Workaround] Borrada liquidación automática ${factura.numero} para tramo ${tramoId}`);
            } else {
                // Si tiene un número de factura real, la marcamos como ANULADA en lugar de borrarla
                db.prepare('UPDATE Factura SET estado = \'ANULADA\', updatedAt = ? WHERE id = ?')
                    .run(new Date().toISOString(), factura.id);
                console.log(`[SQL Workaround] Anulada factura ${factura.numero} para tramo ${tramoId}`);
            }
        }

        db.prepare('COMMIT').run();

        revalidatePath("/facturacion");
        revalidatePath("/facturacion/masivo");

        return { success: true };
    } catch (error: any) {
        if (db) db.prepare('ROLLBACK').run();
        console.error("Error al revertir status:", error);
        return { success: false, error: "No se pudo revertir el estado: " + error.message };
    } finally {
        if (db) db.close();
    }
}
