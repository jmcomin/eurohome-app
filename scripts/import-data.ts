import { importFromExcel } from '../src/lib/excel-importer';
import path from 'path';

async function run() {
    const excelPath = path.join(process.cwd(), 'Liquidacion Comisiones para APP.xlsx');
    console.log(`Starting import from: ${excelPath}`);

    try {
        await importFromExcel(excelPath);
        console.log('Import completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
}

run();
