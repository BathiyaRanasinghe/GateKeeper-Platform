# GateKeeper Platform

Self-service API Gateway SaaS — pnpm monorepo, fully Dockerized, deploys to Azure.

## Structure

```
apps/frontend    Next.js 15 App Router — dashboard UI + Platform API (control plane)
apps/gateway     Fastify — data plane proxy (stateless, horizontally scalable)
packages/types   Shared TypeScript interfaces
packages/config-validator  Shared Zod schemas
infra/           Azure Bicep IaC (ACR + Container Apps + Redis)
nginx/           Local reverse proxy config
supabase/migrations/  Run in Supabase SQL editor in order (001→004)
```

## Local dev

```bash
cp .env.example .env    # fill in Supabase keys
docker compose up --build
# App at http://localhost  (nginx routes /gw/* → gateway, /* → frontend)

# Multi-replica gateway test:
docker compose up --scale gateway=3
```

## Install dependencies (first time)

```bash
corepack enable
pnpm install
```

## Key design decisions

- **Redis-backed config cache** (not in-memory) so all gateway replicas share state.
  Key: `config:{projectId}`, TTL 30s. Invalidated on PUT /config.
- **Rate limiting** uses Redis sorted-set sliding window — shared across replicas.
- **HMAC signing** — each project has its own secret (auto-generated on project create).
- **Supabase RLS** enforces multi-tenant ownership — users can only see their own data.

## Azure deployment

```bash
# Provision infrastructure (first time)
az group create -n rg-gatekeeper-prod -l australiaeast
az deployment group create \
  -g rg-gatekeeper-prod \
  -f infra/main.bicep \
  -p infra/parameters/prod.json \
  -p supabaseAnonKey=$ANON_KEY \
  -p supabaseServiceRoleKey=$SERVICE_KEY

# CI/CD: push to main triggers .github/workflows/deploy.yml
```

## Supabase setup

1. Create project at supabase.com
2. Run migrations 001→004 in SQL editor
3. Enable Email provider in Auth settings
4. Copy URL + anon key + service role key to .env
