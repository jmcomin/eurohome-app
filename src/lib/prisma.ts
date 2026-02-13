// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const getPrisma = () => {
    // Ensure DATABASE_URL is set during build-time even if next.js isolation is strict
    if (!process.env.DATABASE_URL && typeof window === 'undefined') {
        process.env.DATABASE_URL = "file:./prisma/dev.db";
    }
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
};

// Also export a lazy prisma object to avoid initialization errors during build
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        return (getPrisma() as any)[prop];
    }
});
