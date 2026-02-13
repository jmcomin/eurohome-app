-- CreateTable
CREATE TABLE "Promocion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "comision_total_pct" REAL NOT NULL DEFAULT 6.0,
    "iva_porcentaje" REAL NOT NULL DEFAULT 10.0,
    "hito_1_pct" REAL NOT NULL DEFAULT 15.0,
    "hito_2_pct" REAL NOT NULL DEFAULT 30.0,
    "reparto_hito_1" REAL NOT NULL DEFAULT 50.0,
    "reparto_hito_2" REAL NOT NULL DEFAULT 50.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vivienda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promocionId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "planta" TEXT NOT NULL,
    "letra" TEXT NOT NULL,
    "precio_sin_iva" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vivienda_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "Promocion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nif_pasaporte" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Agencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Operacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "viviendaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "promocionId" TEXT NOT NULL,
    "agenciaId" TEXT,
    "pct_comision_agencia" REAL NOT NULL DEFAULT 0.0,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "fecha_inicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Operacion_viviendaId_fkey" FOREIGN KEY ("viviendaId") REFERENCES "Vivienda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Operacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Operacion_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "Promocion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Operacion_agenciaId_fkey" FOREIGN KEY ("agenciaId") REFERENCES "Agencia" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operacionId" TEXT NOT NULL,
    "importe" REAL NOT NULL,
    "fecha" DATETIME NOT NULL,
    "metodo" TEXT,
    "referencia" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pago_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TramoComision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operacionId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "base_imponible" REAL NOT NULL,
    "iva" REAL NOT NULL,
    "facturable" BOOLEAN NOT NULL DEFAULT false,
    "fecha_facturable" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TramoComision_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tramoId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha_emision" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "pdf_path" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Factura_tramoId_fkey" FOREIGN KEY ("tramoId") REFERENCES "TramoComision" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vivienda_promocionId_codigo_key" ON "Vivienda"("promocionId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_nif_pasaporte_key" ON "Cliente"("nif_pasaporte");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_tramoId_key" ON "Factura"("tramoId");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_numero_key" ON "Factura"("numero");
