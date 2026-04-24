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
COPY --from=deps /app .

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

# Copia a pasta public (necessário para imagens estáticas)
COPY --from=builder /app .

# 1. Injeta a variável que o server.js vai ler para liberar o acesso de rede
ENV HOSTNAME="0.0.0.0"

ENV PORT=3001
EXPOSE 3001

# A flag -H obriga o Next a usar o 0.0.0.0
CMD ["yarn", "start", "-H", "0.0.0.0"]