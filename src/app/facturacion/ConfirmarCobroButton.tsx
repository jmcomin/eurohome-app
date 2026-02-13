'use client';

import { CheckCircle } from "lucide-react";
import { marcarComoCobrado } from "./actions";

interface ConfirmarCobroButtonProps {
    tramoId: string;
}

export default function ConfirmarCobroButton({ tramoId }: ConfirmarCobroButtonProps) {
    const handleConfirm = async () => {
        if (confirm('¿Confirmas que este tramo ha sido cobrado efectivamente?')) {
            const result = await marcarComoCobrado(tramoId);
            if (!result.success) {
                alert("Error al marcar como cobrado: " + result.error);
            }
        }
    };

    return (
        <button
            onClick={handleConfirm}
            className="flex items-center space-x-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white px-2 py-1 rounded-md border border-green-200 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
        >
            <CheckCircle size={12} />
            <span>Confirmar Cobro</span>
        </button>
    );
}
