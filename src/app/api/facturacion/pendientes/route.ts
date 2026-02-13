import { NextResponse } from "next/server";
import path from "path";
const Database = require("better-sqlite3");

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const promocionId = searchParams.get('promocionId');

    let db;
    try {
        const dbPath = path.join(process.cwd(), "prisma", "dev.db");
        db = new Database(dbPath);

        let sql = `
            SELECT 
                t.*,
                o.id as "operacion.id",
                c.nombre as "operacion.cliente.nombre",
                p.nombre as "operacion.promocion.nombre",
                v.codigo as "operacion.vivienda.codigo",
                v.planta as "operacion.vivienda.planta",
                v.letra as "operacion.vivienda.letra",
                ag.nombre as "operacion.agente.nombre"
            FROM TramoComision t
            JOIN Operacion o ON t.operacionId = o.id
            JOIN Cliente c ON o.clienteId = c.id
            JOIN Promocion p ON o.promocionId = p.id
            JOIN Vivienda v ON o.viviendaId = v.id
            LEFT JOIN Agente ag ON o.agenteId = ag.id
            WHERE t.facturable = 1 
              AND (t.validado = 0 OR t.validado IS NULL)
              AND t.tipo IN ('EUROHOME_1', 'EUROHOME_2', 'AGENTE')
        `;

        if (promocionId) {
            sql += ` AND p.id = ? `;
        }

        sql += ` ORDER BY t.updatedAt DESC `;

        const stmt = db.prepare(sql);
        const rows = promocionId ? stmt.all(promocionId) : stmt.all();

        // Mapear los resultados planos al formato anidado que espera el frontend
        const tramos = rows.map((row: any) => ({
            ...row,
            facturable: !!row.facturable,
            validado: !!row.validado,
            operacion: {
                id: row["operacion.id"],
                cliente: { nombre: row["operacion.cliente.nombre"] },
                promocion: { nombre: row["operacion.promocion.nombre"] },
                vivienda: {
                    codigo: row["operacion.vivienda.codigo"],
                    planta: row["operacion.vivienda.planta"],
                    letra: row["operacion.vivienda.letra"]
                },
                agente: { nombre: row["operacion.agente.nombre"] }
            }
        }));

        return NextResponse.json(tramos);
    } catch (error: any) {
        console.error("Error en workaround SQL directo:", error);
        return NextResponse.json({
            error: "Error al cargar datos (Workaround SQL)",
            details: error.message
        }, { status: 500 });
    } finally {
        if (db) db.close();
    }
}
