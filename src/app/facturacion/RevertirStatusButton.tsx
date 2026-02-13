'use client';

import { RotateCcw } from "lucide-react";
import { revertirStatus } from "./actions";
import { useState } from "react";

interface RevertirStatusButtonProps {
    tramoId: string;
}

export default function RevertirStatusButton({ tramoId }: RevertirStatusButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleRevert = async () => {
        if (confirm('¿Estás seguro de que deseas REVERTIR el estado de esta liquidación? Volverá a aparecer como PENDIENTE.')) {
            setLoading(true);
            try {
                const result = await revertirStatus(tramoId);
                if (!result.success) {
                    alert("Error al revertir: " + result.error);
                }
            } catch (error) {
                alert("Ocurrió un error inesperado.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <button
            onClick={handleRevert}
            disabled={loading}
            className="flex items-center space-x-1 bg-white text-slate-400 hover:text-red-600 px-2 py-1 rounded-md border border-slate-200 hover:border-red-200 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm disabled:opacity-50"
            title="Revertir estado"
        >
            <RotateCcw size={12} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Revirtiendo..." : "Revertir"}</span>
        </button>
    );
}
