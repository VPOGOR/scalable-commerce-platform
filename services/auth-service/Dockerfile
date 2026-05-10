FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/ ./packages/
COPY services/auth-service/ ./services/auth-service/

RUN npm ci --ignore-scripts
RUN npx turbo run build --filter=auth-service

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/package.json ./

RUN npm install --omit=dev --ignore-scripts

EXPOSE 4002
CMD ["node", "dist/index.js"]
