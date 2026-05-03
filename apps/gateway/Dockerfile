FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/config-validator/package.json ./packages/config-validator/
COPY apps/gateway/package.json ./apps/gateway/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/types/ ./packages/types/
COPY packages/config-validator/ ./packages/config-validator/
COPY apps/gateway/ ./apps/gateway/

# Build shared packages first, then gateway
RUN pnpm --filter @gatekeeper/types build
RUN pnpm --filter @gatekeeper/config-validator build
RUN pnpm --filter @gatekeeper/gateway build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/gateway/dist ./dist
COPY --from=builder /app/apps/gateway/node_modules ./node_modules
COPY --from=builder /app/apps/gateway/package.json ./

EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
