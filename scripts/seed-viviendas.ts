import { prisma } from "../src/lib/prisma";

async function seedViviendas() {
    console.log("🌱 Cargando viviendas de prueba...");

    const promo = await prisma.promocion.findFirst({
        where: { nombre: "Slim Tower" }
    });

    if (!promo) {
        console.error("❌ No se encontró la promoción 'Slim Tower'. Por favor, crea una primero.");
        return;
    }

    const testViviendas = [
        {
            codigo: "101",
            nombre: "Portal A, 1º Izq",
            planta: "1",
            letra: "A",
            precio_sin_iva: 250000
        },
        {
            codigo: "102",
            nombre: "Portal A, 1º Der",
            planta: "1",
            letra: "B",
            precio_sin_iva: 260000
        },
        {
            codigo: "201",
            nombre: "Portal B, Bajo A",
            planta: "0",
            letra: "A",
            precio_sin_iva: 210000
        },
        {
            codigo: "TEST-INV",
            nombre: "Atico Premium",
            planta: "5",
            letra: "Unica",
            precio_sin_iva: 550000
        }
    ];

    try {
        for (const v of testViviendas) {
            await prisma.vivienda.upsert({
                where: {
                    promocionId_codigo: {
                        promocionId: promo.id,
                        codigo: v.codigo
                    }
                },
                update: {
                    nombre: v.nombre,
                    planta: v.planta,
                    letra: v.letra,
                    precio_sin_iva: v.precio_sin_iva
                },
                create: {
                    promocionId: promo.id,
                    codigo: v.codigo,
                    nombre: v.nombre,
                    planta: v.planta,
                    letra: v.letra,
                    precio_sin_iva: v.precio_sin_iva
                }
            });
            console.log(`✅ Vivienda cargada: ${v.codigo} - ${v.nombre}`);
        }
        console.log("✨ ¡Inventario precargado con éxito!");
    } catch (e) {
        console.error("❌ Error al cargar viviendas:", e);
    } finally {
        await prisma.$disconnect();
    }
}

seedViviendas();
