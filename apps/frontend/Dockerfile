FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/config-validator/package.json ./packages/config-validator/
COPY apps/frontend/package.json ./apps/frontend/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/types/ ./packages/types/
COPY packages/config-validator/ ./packages/config-validator/
COPY apps/frontend/ ./apps/frontend/

# Build shared packages, then frontend
RUN pnpm --filter @gatekeeper/types build
RUN pnpm --filter @gatekeeper/config-validator build
RUN pnpm --filter @gatekeeper/frontend build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# next.config.ts output: 'standalone' bundles server + minimal node_modules
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "apps/frontend/server.js"]
