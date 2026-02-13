// src/app/api/operaciones/[id]/pagos/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculateMilestones } from '@/lib/milestone-engine';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { importe, fecha, metodo, referencia } = body;

        // 1. Create the payment
        const pago = await prisma.pago.create({
            data: {
                operacionId: id,
                importe: parseFloat(importe),
                fecha: new Date(fecha),
                metodo,
                referencia,
            },
        });

        // 2. Trigger the milestone engine to check if tranches should be enabled
        await recalculateMilestones(id);

        return NextResponse.json({ success: true, pago }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
