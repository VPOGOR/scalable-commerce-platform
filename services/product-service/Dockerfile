FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/ ./packages/
COPY services/product-service/ ./services/product-service/

RUN npm ci --ignore-scripts
RUN npx turbo run build --filter=product-service

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/services/product-service/dist ./dist
COPY --from=builder /app/services/product-service/package.json ./

RUN npm install --omit=dev --ignore-scripts

EXPOSE 4001
CMD ["node", "dist/index.js"]
