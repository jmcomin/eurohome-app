// src/app/settings/page.tsx

import { Settings as SettingsIcon, Shield, Bell, Database, Globe, CreditCard } from "lucide-react";

export default function SettingsPage() {
    const sections = [
        { title: "General", icon: <Globe size={20} />, desc: "Idioma, zona horaria y preferencias globales." },
        { title: "Seguridad", icon: <Shield size={20} />, desc: "Gestión de roles de usuario y permisos financieros." },
        { title: "Notificaciones", icon: <Bell size={20} />, desc: "Alertas de pagos recibidos y facturas pendientes." },
        { title: "Base de Datos", icon: <Database size={20} />, desc: "Estado de SQLite, copias de seguridad e importación." },
        { title: "Facturación", icon: <CreditCard size={20} />, desc: "Series de factura, IVA por defecto y plantillas PDF." },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                    <SettingsIcon size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
                    <p className="text-slate-500 text-sm">Personaliza el funcionamiento del sistema de liquidaciones.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <div key={section.title} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer group">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors text-slate-600">
                                {section.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{section.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{section.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <h3 className="font-bold text-slate-900 mb-2">¿Necesitas ayuda técnica?</h3>
                <p className="text-sm text-slate-500 mb-6">Contacta con el equipo de soporte de Eurohome para ajustes avanzados del sistema.</p>
                <button className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
                    Contactar Soporte
                </button>
            </div>
        </div>
    );
}
