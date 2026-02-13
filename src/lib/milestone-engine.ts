import { prisma } from "./prisma";
import { TipoTramo } from "@prisma/client";

/**
 * Motor de cálculo de hitos de comisión.
 * Se encarga de evaluar si una operación ha alcanzado los umbrales de pago
 * necesarios para liberar los tramos de comisión (Hito 1, Hito 2, etc.)
 */
export async function recalculateMilestones(operacionId: string) {
  console.log(`[ENGINE] Iniciando recalculo para operacion ${operacionId}...`);
  try {
    const op = await prisma.operacion.findUnique({
      where: { id: operacionId },
      include: {
        pagos: true,
        tramos: true,
        promocion: true,
        vivienda: true
      }
    });

    if (!op || !op.vivienda || !op.promocion) return;

    const totalPagado = op.pagos.reduce((sum, p) => sum + p.importe, 0);
    const precioViviendaIva = op.vivienda.precio_sin_iva * (1 + op.promocion.iva_porcentaje / 100);
    console.log(`[ENGINE] Total pagado: ${totalPagado}. Precio con IVA: ${precioViviendaIva}`);

    // Helper para redondeo de moneda
    const round = (n: number) => Math.round(n * 100) / 100;

    // Umbrales de hito (ej. 15% y 30% del precio total con IVA)
    const hito1_val = round(precioViviendaIva * (op.promocion.hito_1_pct / 100));
    const hito2_val = round(precioViviendaIva * (op.promocion.hito_2_pct / 100));

    const totalPagadoRedondeado = round(totalPagado);

    // REGLA HITO 1: EUROHOME 1 (Generalmente el 50% de la comisión total de EH)
    if (totalPagadoRedondeado >= hito1_val) {
      console.log(`[ENGINE] Hito 1 alcanzado (${hito1_val}).`);
      const baseEH1 = (op.vivienda.precio_sin_iva * (op.promocion.comision_total_pct / 100)) * (op.promocion.reparto_hito_1 / 100);
      const ivaEH1 = baseEH1 * 0.21; // IVA servicios
      await ensureTramo(op.id, 'EUROHOME_1', baseEH1, ivaEH1, true);
    }

    // REGLA HITO 2: EUROHOME 2 y AGENCIA
    if (totalPagadoRedondeado >= hito2_val) {
      console.log(`[ENGINE] Hito 2 alcanzado (${hito2_val}).`);

      // 1. Segundo tramo de Eurohome
      const baseEH2 = (op.vivienda.precio_sin_iva * (op.promocion.comision_total_pct / 100)) * (op.promocion.reparto_hito_2 / 100);
      const ivaEH2 = baseEH2 * 0.21;
      await ensureTramo(op.id, 'EUROHOME_2', baseEH2, ivaEH2, true);

      // 2. Tramo de Agente (si aplica)
      if (op.agenteId && op.pct_comision_agente > 0) {
        const baseAG = op.vivienda.precio_sin_iva * (op.pct_comision_agente / 100);
        const ivaAG = baseAG * 0.21;
        await ensureTramo(op.id, 'AGENTE', baseAG, ivaAG, true);
      }
    }
    console.log(`[ENGINE] Recalculo finalizado para ${operacionId}.`);
  } catch (err) {
    console.error(`[ENGINE] ERROR en recalculateMilestones para operacion ${operacionId}:`, err);
    throw err;
  }
}

async function ensureTramo(operacionId: string, tipo: TipoTramo, base: number, iva: number, facturable: boolean) {
  const existing = await prisma.tramoComision.findFirst({
    where: { operacionId, tipo },
    include: { factura: true }
  });

  if (!existing) {
    console.log(`[ENGINE] Creando nuevo tramo ${tipo}...`);
    await prisma.tramoComision.create({
      data: {
        operacionId,
        tipo,
        base_imponible: base,
        iva,
        facturable,
        fecha_facturable: new Date()
      }
    });
  } else {
    // Si el tramo ya existe, actualizamos los importes SOLO si no tiene factura asociada
    // para asegurar que los cambios de precio de vivienda se reflejen.
    if (!existing.factura) {
      await prisma.tramoComision.update({
        where: { id: existing.id },
        data: {
          base_imponible: base,
          iva,
          // Si antes no era facturable y ahora sí, actualizamos la fecha
          ...((!existing.facturable && facturable) ? { facturable: true, fecha_facturable: new Date() } : {})
        }
      });
    }
  }
}
