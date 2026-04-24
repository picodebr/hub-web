# ==========================================
# Estágio 1: Base
# ==========================================
FROM node:20-alpine AS base

# ==========================================
# Estágio 2: Dependências
# ==========================================
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia apenas os arquivos necessários para instalar as dependências
COPY package.json yarn.lock ./
# Como confirmamos o yarn.lock, usamos o comando nativo congelado
RUN yarn install --frozen-lockfile

# ==========================================
# Estágio 3: Build
# ==========================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copia o resto do projeto (respeitando o .dockerignore)
COPY . .

# Variáveis de ambiente de build (adicione aqui se alguma lib exigir no momento da compilação)
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# ==========================================
# Estágio 4: Runner (Produção)
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia a pasta public (necessário para imagens estáticas)
COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copia os artefatos gerados pelo output: 'standalone' do next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV HOSTNAME="0.0.0.0"
ENV PORT=3001
EXPOSE 3001
# A flag -H obriga o Next a usar o 0.0.0.0
CMD ["yarn", "start", "-H", "0.0.0.0"]