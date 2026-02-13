// src/app/api/import/route.ts
import { NextResponse } from 'next/server';
import { importFromExcel } from '@/lib/excel-importer';
import path from 'path';

export async function GET() {
    const excelPath = path.resolve(process.cwd(), 'Liquidacion Comisiones para APP.xlsx');
    console.log(`🚀 Iniciando importación desde: ${excelPath}`);

    try {
        await importFromExcel(excelPath);
        return NextResponse.json({ success: true, message: 'Importación completada' });
    } catch (error: any) {
        console.error('❌ Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
