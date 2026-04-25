FROM node:20-alpine

WORKDIR /app

# Adiciona dependência exigida por algumas bibliotecas do Node no Alpine
RUN apk add --no-cache libc6-compat

# 1. Instalação de Dependências
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 2. Build da Aplicação
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# 3. Configurações de Rede para o AWS App Runner
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
EXPOSE 3001

# Inicia a aplicação no modo padrão do Next.js liberando o IP
CMD ["yarn", "start", "-H", "0.0.0.0"]