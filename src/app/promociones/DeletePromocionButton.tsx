'use client';

import { Trash2 } from "lucide-react";
import { deletePromocion } from "./actions";

interface DeletePromocionButtonProps {
    id: string;
}

export default function DeletePromocionButton({ id }: DeletePromocionButtonProps) {
    const deleteWithConfirm = async (formData: FormData) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta promoción? Esta acción no se puede deshacer.')) {
            await deletePromocion(id);
        }
    };

    return (
        <form action={deleteWithConfirm}>
            <button
                type="submit"
                className="text-red-500 hover:text-white hover:bg-red-500 p-3 rounded-xl border border-red-100 transition-all flex items-center space-x-2 font-bold text-xs uppercase tracking-widest"
            >
                <Trash2 size={18} />
                <span>Eliminar</span>
            </button>
        </form>
    );
}
