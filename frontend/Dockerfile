# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --fetch-retries=5

COPY . .

# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
# For local: http://localhost:4000/api/v1
# For server: http://YOUR_SERVER_IP:4000/api/v1  ← change this when deploying
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

# ---- Stage 2: Production Runner ----
# Standalone mode: Next.js creates a minimal server.js with only required deps
# No node_modules needed — brings image from ~1GB down to ~200MB
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
