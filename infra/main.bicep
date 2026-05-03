targetScope = 'resourceGroup'

@description('Environment name (dev or prod)')
param environment string = 'dev'

@description('Azure region')
param location string = resourceGroup().location

@description('Frontend image tag to deploy')
param frontendImageTag string = 'latest'

@description('Gateway image tag to deploy')
param gatewayImageTag string = 'latest'

@description('Supabase project URL')
param supabaseUrl string

@description('Supabase anon key (public)')
@secure()
param supabaseAnonKey string

@description('Supabase service role key (secret)')
@secure()
param supabaseServiceRoleKey string

var prefix = 'gatekeeper'
var acrName = '${prefix}acr${environment}'

// ── Container Registry ────────────────────────────────────────────────────────
module acr 'modules/containerRegistry.bicep' = {
  name: 'acr'
  params: {
    name: acrName
    location: location
  }
}

// ── Redis ─────────────────────────────────────────────────────────────────────
module redis 'modules/redis.bicep' = {
  name: 'redis'
  params: {
    name: '${prefix}-redis-${environment}'
    location: location
    sku: environment == 'prod' ? 'Standard' : 'Basic'
    capacity: 1
  }
}

// ── Container Apps Environment ────────────────────────────────────────────────
module containerEnv 'modules/containerAppsEnv.bicep' = {
  name: 'containerAppsEnv'
  params: {
    name: 'cae-${prefix}-${environment}'
    location: location
  }
}

// ── Gateway Container App ─────────────────────────────────────────────────────
module gatewayApp 'modules/containerApp.bicep' = {
  name: 'gatewayApp'
  params: {
    name: 'ca-${prefix}-gateway-${environment}'
    location: location
    containerAppsEnvironmentId: containerEnv.outputs.environmentId
    acrLoginServer: acr.outputs.loginServer
    acrName: acrName
    imageName: 'gatekeeper/gateway'
    imageTag: gatewayImageTag
    containerPort: 3001
    minReplicas: 1
    maxReplicas: environment == 'prod' ? 20 : 3
    env: [
      { name: 'PORT', value: '3001' }
      { name: 'REDIS_URL', secretRef: 'redis-url' }
      { name: 'SUPABASE_URL', value: supabaseUrl }
      { name: 'SUPABASE_SERVICE_ROLE_KEY', secretRef: 'supabase-service-role-key' }
      { name: 'CONFIG_CACHE_TTL_SECONDS', value: '30' }
      { name: 'LOG_LEVEL', value: 'info' }
      { name: 'NODE_ENV', value: 'production' }
    ]
    secrets: [
      { name: 'redis-url', value: redis.outputs.redisConnectionString }
      { name: 'supabase-service-role-key', value: supabaseServiceRoleKey }
    ]
  }
}

// ── Frontend Container App ────────────────────────────────────────────────────
module frontendApp 'modules/containerApp.bicep' = {
  name: 'frontendApp'
  params: {
    name: 'ca-${prefix}-frontend-${environment}'
    location: location
    containerAppsEnvironmentId: containerEnv.outputs.environmentId
    acrLoginServer: acr.outputs.loginServer
    acrName: acrName
    imageName: 'gatekeeper/frontend'
    imageTag: frontendImageTag
    containerPort: 3000
    minReplicas: 1
    maxReplicas: environment == 'prod' ? 10 : 2
    env: [
      { name: 'NEXT_PUBLIC_SUPABASE_URL', value: supabaseUrl }
      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: supabaseAnonKey }
      { name: 'SUPABASE_SERVICE_ROLE_KEY', secretRef: 'supabase-service-role-key' }
      { name: 'REDIS_URL', secretRef: 'redis-url' }
      { name: 'NEXT_PUBLIC_GATEWAY_BASE_URL', value: 'https://${gatewayApp.outputs.fqdn}' }
      { name: 'NODE_ENV', value: 'production' }
    ]
    secrets: [
      { name: 'supabase-service-role-key', value: supabaseServiceRoleKey }
      { name: 'redis-url', value: redis.outputs.redisConnectionString }
    ]
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output acrLoginServer string = acr.outputs.loginServer
output frontendUrl string = 'https://${frontendApp.outputs.fqdn}'
output gatewayUrl string = 'https://${gatewayApp.outputs.fqdn}'
