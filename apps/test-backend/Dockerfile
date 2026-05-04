FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/test-backend/package.json ./apps/test-backend/

RUN pnpm install --frozen-lockfile

COPY apps/test-backend/ ./apps/test-backend/

RUN pnpm --filter @gatekeeper/test-backend build

RUN pnpm --filter @gatekeeper/test-backend deploy --prod --legacy /prod/test-backend

# ── Production image ──────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/test-backend/dist ./dist
COPY --from=builder /prod/test-backend/node_modules ./node_modules
COPY --from=builder /app/apps/test-backend/package.json ./

EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/index.js"]
