# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/ ./packages/
COPY apps/cart/ ./apps/cart/

RUN npm ci --ignore-scripts
RUN npx turbo run build --filter=cart

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runner
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY apps/cart/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/cart/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
