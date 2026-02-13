// src/lib/excel-importer.ts

import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { recalculateMilestones } from './milestone-engine';

export async function importFromExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processing ${data.length} rows...`);

    for (const rawRow of data as any[]) {
        const row = rawRow as any;

        // 1. Ensure Promotion exists
        const promoName = row['Promoción'] || 'Sin Nombre';
        const promocion = await prisma.promocion.upsert({
            where: { id: promoName },
            update: { nombre: promoName },
            create: {
                id: promoName,
                nombre: promoName,
                comision_total_pct: 6.0,
                iva_porcentaje: 10.0,
            }
        });

        // 2. Ensure Cliente exists
        const clientName = row['Nombre Cliente'] || 'Cliente Desconocido';
        // Use a dummy NIF if not present to avoid skipping
        const nif = row['NIF / Pasaporte'] || `DUMMY-${clientName.substring(0, 10).toUpperCase().replace(/\s/g, '-')}`;

        const cliente = await prisma.cliente.upsert({
            where: { nif_pasaporte: nif },
            update: { nombre: clientName },
            create: {
                nif_pasaporte: nif,
                nombre: clientName,
            }
        });

        // 3. Ensure Agente exists (if any)
        const agenteName = row['Agente (nombre)'] || row['Agencia (nombre)'] || 'N/A';
        let agenteId = null;
        if (agenteName && agenteName !== 'N/A') {
            const agente = await prisma.agente.upsert({
                where: { id: agenteName },
                update: { nombre: agenteName },
                create: { id: agenteName, nombre: agenteName }
            });
            agenteId = agente.id;
        }

        // 4. Ensure Vivienda exists
        const codigo = row['Código'];
        if (!codigo) {
            console.warn("Skipping row without Código");
            continue;
        }

        const vivienda = await prisma.vivienda.upsert({
            where: {
                promocionId_codigo: {
                    promocionId: promocion.id,
                    codigo: codigo,
                }
            },
            update: {
                nombre: (row['Vivienda'] || row['Nombre Vivienda'])?.toString(),
                planta: (row['Planta'] || row['Planta2'])?.toString(),
                letra: row['Letra']?.toString(),
                precio_sin_iva: parseFloat(row['Precio']) || 0,
            },
            create: {
                promocionId: promocion.id,
                codigo: codigo,
                nombre: (row['Vivienda'] || row['Nombre Vivienda'])?.toString(),
                planta: (row['Planta'] || row['Planta2'])?.toString(),
                letra: row['Letra']?.toString(),
                precio_sin_iva: parseFloat(row['Precio']) || 0,
            }
        });

        // 5. Create or Update Operación
        let operacion = await prisma.operacion.findFirst({
            where: {
                viviendaId: vivienda.id,
                clienteId: cliente.id,
                estado: 'ACTIVA'
            }
        });

        if (!operacion) {
            operacion = await prisma.operacion.create({
                data: {
                    promocionId: promocion.id,
                    viviendaId: vivienda.id,
                    clienteId: cliente.id,
                    agenteId: agenteId,
                    pct_comision_agente: parseFloat(row['% Comisión Agencia (0-5 sobre precio sin IVA)']) || parseFloat(row['% Comisión Agente']) || 0,
                }
            });
        }

        // 6. Import Payments
        const existingPagos = await prisma.pago.findMany({ where: { operacionId: operacion.id } });

        const importPago = async (importe: any, ref: string) => {
            const val = typeof importe === 'number' ? importe : parseFloat(importe);
            if (!val || isNaN(val)) return;

            if (existingPagos.some((p: any) => Math.abs(p.importe - val) < 0.01)) return;

            await prisma.pago.create({
                data: {
                    operacionId: operacion!.id,
                    importe: val,
                    fecha: new Date(),
                    metodo: 'Importación Excel',
                    referencia: ref,
                }
            });
        };

        if (row['Pago 1']) await importPago(row['Pago 1'], 'PAGO-1-EXCEL');
        if (row['Pago 2']) await importPago(row['Pago 2'], 'PAGO-2-EXCEL');

        // 7. Trigger Milestone Recalculation
        await recalculateMilestones(operacion.id);

        // 8. Facturada status
        if (row['Facturada'] === 'Sí' || row['Facturada'] === 'SÍ') {
            await prisma.tramoComision.updateMany({
                where: { operacionId: operacion.id, tipo: 'EUROHOME_1' },
                data: { facturable: true }
            });
        }
    }
}
