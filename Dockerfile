# syntax=docker/dockerfile:1

# Imagens base fixadas por digest (cadeia de suprimentos): a tag pode mudar, o digest não.
# O Dependabot propõe as atualizações (ecossistema "docker" no .github/dependabot.yml).

# ---------- Estágio 1: build ----------
FROM node:25-alpine@sha256:bdf2cca6fe3dabd014ea60163eca3f0f7015fbd5c7ee1b0e9ccb4ced6eb02ef4 AS build
WORKDIR /app

# Dependências primeiro: a camada só é refeita quando o lockfile muda.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund

COPY . .
# GITHUB_SHA vai para o version.json, deixando a imagem rastreável até o commit.
ARG GITHUB_SHA=local
ENV GITHUB_SHA=${GITHUB_SHA} BASE_PATH=/
RUN npm run build

# ---------- Estágio 2: runtime ----------
# Só o dist/ e o nginx: sem Node, sem código-fonte, sem node_modules.
# A variante "unprivileged" roda como usuário não-root (UID 101) na porta 8080.
FROM nginxinc/nginx-unprivileged:alpine@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e

LABEL org.opencontainers.image.title="SimulaFinanças" \
      org.opencontainers.image.description="SPA de simuladores financeiros" \
      org.opencontainers.image.source="https://github.com/PedroKuhn1/simula-financas" \
      org.opencontainers.image.licenses="MIT"

# Aplica as correções de segurança publicadas depois da imagem base e remove o curl,
# que não é usado (o healthcheck usa o wget do busybox): menos pacotes, menos superfície de ataque.
USER root
RUN apk upgrade --no-cache && apk del --no-cache curl

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
USER 101

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/version.json || exit 1
