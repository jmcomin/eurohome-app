'use client';

import { Ban } from "lucide-react";
import { cancelarOperacion } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CancelOperacionButtonProps {
    id: string;
}

export default function CancelOperacionButton({ id }: CancelOperacionButtonProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const handleCancel = async () => {
        if (confirm('¿Estás seguro de que deseas cancelar esta operación? El registro se mantendrá pero su estado cambiará a CANCELADA.')) {
            setIsPending(true);
            try {
                const result = await cancelarOperacion(id);
                if (result.success) {
                    router.refresh();
                } else {
                    alert('Error al cancelar la operación: ' + result.error);
                }
            } catch (error) {
                alert('Ocurrió un error inesperado al cancelar la operación.');
            } finally {
                setIsPending(false);
            }
        }
    };

    return (
        <button
            onClick={handleCancel}
            disabled={isPending}
            className="text-slate-500 hover:text-white hover:bg-slate-500 p-2.5 rounded-xl border border-slate-100 transition-all flex items-center space-x-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            title="Cancelar Operación"
        >
            <Ban size={18} />
            <span>{isPending ? 'Cancelando...' : 'Cancelar'}</span>
        </button>
    );
}
