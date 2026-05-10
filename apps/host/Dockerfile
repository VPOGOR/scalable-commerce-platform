# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder
# node:22-alpine — відповідає engines.node у package.json, alpine ~50MB vs ~1GB
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Копіюємо маніфести першими — Docker кешує цей шар.
# npm ci запускається лише якщо package*.json або turbo.json змінились.
COPY package.json package-lock.json turbo.json ./

# Копіюємо shared packages (потрібні для @repo/types під час build)
COPY packages/ ./packages/

# Копіюємо тільки цей app — інші apps не потрібні для build host
COPY apps/host/ ./apps/host/

# npm ci — детерміністична установка з lock file (не npm install)
RUN npm ci --ignore-scripts

# turbo --filter=host будує тільки host і його залежності (@repo/types тощо)
RUN npx turbo run build --filter=host

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runner
# nginx:alpine ~25MB — тільки статика, без Node.js runtime
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY apps/host/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/host/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
