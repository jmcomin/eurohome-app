"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { eliminarCliente } from "./actions";

interface DeleteClienteButtonProps {
    id: string;
    nombre: string;
}

export function DeleteClienteButton({ id, nombre }: DeleteClienteButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (confirm(`¿Estás seguro de que quieres eliminar al cliente "${nombre}"? Esta acción no se puede deshacer.`)) {
            setLoading(true);
            try {
                const result = await eliminarCliente(id);
                if (result && !result.success) {
                    alert(result.error);
                }
            } catch (error) {
                alert("Error al intentar eliminar el cliente.");
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-slate-400 hover:text-red-600 transition-colors p-2 disabled:opacity-50"
            title="Eliminar Cliente"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    );
}
