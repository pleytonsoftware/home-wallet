# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# ─── deps: install dependencies (cached independently of source changes) ──────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
	HUSKY=0 pnpm install --frozen-lockfile

# ─── builder: generate the Prisma client and build the Next.js app ────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time only.
#
# NEXT_PUBLIC_* values (APP_NAME, BASE_URL below) get inlined into the client
# bundle, so pass the real values via `--build-arg` when they matter.
#
# DATABASE_URL is a placeholder — it's only here because `src/lib/prisma.ts`
# reads it eagerly at import time and throws if it's unset, which would break
# the build. The connection is never used at build time, and this value is not
# used at runtime — provide the real secrets via `docker run -e` /
# `--env-file` / your orchestrator's secret store instead.
ARG APP_NAME="Home Wallet"
ARG BASE_URL="http://localhost:3000"
ENV APP_NAME=${APP_NAME} \
	BASE_URL=${BASE_URL} \
	DATABASE_URL="postgresql://build:build@localhost:5432/build" \
	NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ─── runner: minimal runtime image ─────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
	NEXT_TELEMETRY_DISABLED=1 \
	PORT=3000 \
	HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# `output: 'standalone'` (next.config.ts) traces only the files each route
# needs, so the runtime image doesn't carry the full node_modules tree.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
