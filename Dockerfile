# Production Dockerfile for Next.js + SQLite
FROM node:20-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV DATABASE_URL="file:./prisma/dev.db"
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN touch prisma/dev.db

# Generate Prisma Client
RUN npx prisma generate

# Build application
COPY . .
RUN npm run build

# Production image
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=base /app/next.config.ts ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
