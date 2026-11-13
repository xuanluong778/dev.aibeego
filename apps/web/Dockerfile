FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS builder
COPY . .
# Cần devDependencies khi install; Next.js build bắt buộc NODE_ENV=production
RUN pnpm config set network-timeout 300000 && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-maxtimeout 180000 && \
    NODE_ENV=development pnpm install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true
ENV NODE_ENV=production
ARG NEXT_PUBLIC_APP_URL=https://aibeego.com
ARG NEXT_PUBLIC_API_URL=https://aibeego.com
ARG NEXT_PUBLIC_WS_URL=wss://aibeego.com
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG API_INTERNAL_URL=http://api:4000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV API_INTERNAL_URL=$API_INTERNAL_URL
RUN pnpm --filter @marketingspa/shared build
RUN pnpm --filter @marketingspa/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
