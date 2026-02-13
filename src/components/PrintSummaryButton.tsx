"use client";

import { Download, Printer } from "lucide-react";

interface PrintSummaryButtonProps {
    label?: string;
}

export default function PrintSummaryButton({ label = "Imprimir Resumen" }: PrintSummaryButtonProps) {
    return (
        <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-sm font-bold flex items-center space-x-2 bg-white no-print shadow-sm"
        >
            <Printer size={16} />
            <span>{label}</span>
        </button>
    );
}
