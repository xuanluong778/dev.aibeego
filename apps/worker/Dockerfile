FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
ENV NODE_ENV=development

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate --schema=packages/database/prisma/schema.prisma
RUN pnpm --filter @marketingspa/shared build
RUN pnpm --filter @marketingspa/database build
RUN pnpm --filter @marketingspa/worker build
RUN pnpm deploy --filter @marketingspa/worker --prod /prod/worker
# pnpm deploy reinstalls @prisma/client and drops the generated engine.
RUN set -e; \
    src="$(find node_modules/.pnpm -path '*/node_modules/.prisma/client/index.js' | head -1)"; \
    dest="$(find /prod/worker/node_modules/.pnpm -type d -path '*/node_modules/.prisma/client' | head -1)"; \
    test -n "$src"; test -n "$dest"; \
    rm -rf "$dest"; \
    cp -a "$(dirname "$src")" "$dest"

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /prod/worker/ ./
CMD ["node", "dist/index.js"]
