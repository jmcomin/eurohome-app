'use client';

import { Printer } from "lucide-react";

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg transition-all text-sm font-bold shadow-sm no-print"
        >
            <Printer size={18} />
            <span>Imprimir Lista</span>
        </button>
    );
}
