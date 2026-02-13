'use client';

import { Trash2 } from "lucide-react";
import { eliminarOperacion } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteOperacionButtonProps {
    id: string;
}

export default function DeleteOperacionButton({ id }: DeleteOperacionButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta operación? Esta acción es permanente y eliminará todos los pagos y facturas asociados.')) {
            setIsDeleting(true);
            try {
                const result = await eliminarOperacion(id);
                if (result.success) {
                    router.push('/operaciones');
                    router.refresh();
                } else {
                    alert('Error al eliminar la operación: ' + result.error);
                }
            } catch (error) {
                alert('Ocurrió un error inesperado al eliminar la operación.');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-white hover:bg-red-500 p-2.5 rounded-xl border border-red-100 transition-all flex items-center space-x-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            title="Eliminar Operación"
        >
            <Trash2 size={18} />
            <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
        </button>
    );
}
