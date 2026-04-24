# ==========================================
# 1. ESTÁGIO DE BUILD (Pesado)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Adiciona dependência do sistema exigida por algumas libs do Node
RUN apk add --no-cache libc6-compat

# Instala TODAS as dependências (incluindo devDependencies necessárias pro build)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copia o código e faz o build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build


# ==========================================
# 2. ESTÁGIO DE RUNNER (Super Leve - Produção)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Boas práticas de segurança em Cloud: rodar sem ser root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia APENAS o que é estritamente necessário da fase de build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Configurações de rede para o Health Check do AWS App Runner
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
EXPOSE 3001

# Executa o servidor otimizado gerado pelo modo standalone
CMD ["node", "server.js"]