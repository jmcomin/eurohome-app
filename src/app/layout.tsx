// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import { LayoutDashboard, Home, FileText, Users, Building2, Settings } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eurohome - Gestión de Comisiones",
  description: "Sistema profesional de control de pagos y facturación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-50">
          {/* Sidebar */}
          <aside className="w-64 bg-brand-primary text-white flex flex-col no-print">
            <div className="bg-white p-6 mb-8 border-4 border-brand-primary">
              <Image
                src="/Logo Eurohome.png"
                alt="Eurohome Logo"
                width={200}
                height={60}
                className="w-full h-auto"
                priority
              />
            </div>

            <div className="flex-1 flex flex-col px-6 pb-6 space-y-8">
              <nav className="flex-1 space-y-2">
                <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link href="/operaciones" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <Home size={20} />
                  <span>Operaciones</span>
                </Link>
                <Link href="/promociones" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <Building2 size={20} />
                  <span>Promociones</span>
                </Link>
                <Link href="/facturacion" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <FileText size={20} />
                  <span>Liquidaciones</span>
                </Link>
                <Link href="/clientes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <Users size={20} />
                  <span>Clientes</span>
                </Link>
                <Link href="/agentes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <Building2 size={20} />
                  <span>Agentes</span>
                </Link>
              </nav>
              <div className="border-t border-slate-800 pt-6">
                <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <Settings size={20} />
                  <span>Configuración</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <header className="h-16 bg-brand-secondary border-b border-brand-primary flex items-center justify-between px-8 sticky top-0 z-10 no-print">
              <h1 className="text-lg font-black text-brand-primary uppercase tracking-widest italic">Sistema de Liquidaciones</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-brand-primary">Admin Eurohome</span>
                <div className="w-8 h-8 rounded-full bg-white border border-brand-primary" />
              </div>
            </header>
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
