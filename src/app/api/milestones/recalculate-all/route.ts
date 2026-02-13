import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recalculateMilestones } from "@/lib/milestone-engine";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Starting bulk milestone recalculation...");
        const operaciones = await prisma.operacion.findMany({
            select: { id: true }
        });

        let count = 0;
        let errors = 0;

        for (const op of operaciones) {
            try {
                await recalculateMilestones(op.id);
                count++;
            } catch (e) {
                console.error(`Error recalculating operation ${op.id}:`, e);
                errors++;
            }
        }

        console.log(`Finished recalculation. Success: ${count}, Errors: ${errors}`);

        return NextResponse.json({
            success: true,
            processed: count,
            errors: errors
        });
    } catch (error: any) {
        console.error("Critical error in recalculate-all:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
