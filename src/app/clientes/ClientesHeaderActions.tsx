'use client';

import { useState } from "react";
import Link from "next/link";
import { UserPlus, FileUp } from "lucide-react";
import BulkCreateClientesModal from "./BulkCreateClientesModal";

export default function ClientesHeaderActions() {
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    return (
        <>
            <div className="flex space-x-2">
                <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-50 transition shadow-sm font-black text-xs uppercase tracking-widest"
                >
                    <FileUp size={16} />
                    <span>Alta Masiva</span>
                </button>
                <Link
                    href="/clientes/edicion-rapida"
                    className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-50 transition shadow-sm font-black text-xs uppercase tracking-widest"
                >
                    <span>Edición Rápida</span>
                </Link>
                <Link
                    href="/clientes/nuevo"
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-800 transition shadow-lg font-black text-xs uppercase tracking-widest"
                >
                    <UserPlus size={16} />
                    <span>Registrar Cliente</span>
                </Link>
            </div>

            <BulkCreateClientesModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
            />
        </>
    );
}
