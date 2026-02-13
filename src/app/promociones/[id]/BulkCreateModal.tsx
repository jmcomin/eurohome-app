'use client';

import { useState } from "react";
import { X, Save, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { bulkCreateViviendas } from "../actions";

interface BulkCreateModalProps {
    promocionId: string;
    isOpen: boolean;
    onClose: () => void;
}

interface ParsedVivienda {
    codigo: string;
    nombre: string;
    planta: string;
    letra: string;
    precio_sin_iva: number;
    isValid: boolean;
}

export default function BulkCreateModal({ promocionId, isOpen, onClose }: BulkCreateModalProps) {
    const [rawText, setRawText] = useState("");
    const [previewData, setPreviewData] = useState<ParsedVivienda[]>([]);
    const [loading, setLoading] = useState(false);

    const parseText = (text: string) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const parsed = lines.map(line => {
            // Soporta tabulador (Excel), punto y coma, o coma
            const parts = line.split(/\t|;|,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/^"|"$/g, ''));

            const codigo = parts[0] || "";
            const nombre = parts[1] || "";
            const planta = parts[2] || "";
            const letra = parts[3] || "";
            const precioStr = (parts[4] || "0").replace(/[^\d,.-]/g, '').replace(',', '.');
            const precio_sin_iva = parseFloat(precioStr) || 0;

            return {
                codigo,
                nombre,
                planta,
                letra,
                precio_sin_iva,
                isValid: codigo !== "" && (planta !== "" || letra !== "") && precio_sin_iva > 0
            };
        });
        setPreviewData(parsed);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setRawText(text);
        parseText(text);
    };

    const handleSave = async () => {
        const validData = previewData.filter(v => v.isValid);
        if (validData.length === 0) return;

        setLoading(true);
        try {
            const result = await bulkCreateViviendas(promocionId, validData);
            if (result.success) {
                onClose();
                setRawText("");
                setPreviewData([]);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Error inesperado al procesar la carga.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Alta Masiva de Viviendas</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Pega desde Excel o CSV</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-6 border-r border-slate-100 flex flex-col space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrada de Datos</label>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-100">
                            Formato sugerido: <br />
                            <code className="text-blue-700 font-bold">Código | Nombre | Planta | Letra | Precio</code>
                        </p>
                        <textarea
                            value={rawText}
                            onChange={handleTextChange}
                            placeholder="Pega aquí tus datos..."
                            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-xs resize-none"
                        />
                    </div>

                    <div className="p-6 bg-slate-50/30 flex flex-col space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                            <span>Previsualización ({previewData.length} detectadas)</span>
                            {previewData.some(v => !v.isValid) && (
                                <span className="text-red-500 flex items-center"><AlertCircle size={12} className="mr-1" /> Avisos en rojo</span>
                            )}
                        </label>
                        <div className="flex-1 overflow-auto border border-slate-100 rounded-2xl bg-white shadow-inner">
                            <table className="w-full text-left text-[10px]">
                                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-3 py-2 font-black text-slate-400 uppercase">Cód.</th>
                                        <th className="px-3 py-2 font-black text-slate-400 uppercase">Nombre</th>
                                        <th className="px-3 py-2 font-black text-slate-400 uppercase">P/L</th>
                                        <th className="px-3 py-2 font-black text-slate-400 uppercase">Precio</th>
                                        <th className="px-3 py-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {previewData.map((v, i) => (
                                        <tr key={i} className={v.isValid ? "" : "bg-red-50"}>
                                            <td className="px-3 py-2 font-black">{v.codigo || "?"}</td>
                                            <td className="px-3 py-2 text-slate-500">{v.nombre || "-"}</td>
                                            <td className="px-3 py-2 font-bold">{v.planta}{v.letra}</td>
                                            <td className="px-3 py-2 font-mono">{v.precio_sin_iva.toLocaleString('es-ES')}€</td>
                                            <td className="px-3 py-2 text-right">
                                                {v.isValid ? <CheckCircle2 size={12} className="text-green-500 inline" /> : <AlertCircle size={12} className="text-red-500 inline" />}
                                            </td>
                                        </tr>
                                    ))}
                                    {previewData.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-300 italic">Esperando datos...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || previewData.filter(v => v.isValid).length === 0}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Guardar {previewData.filter(v => v.isValid).length} Viviendas</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
