param name string
param location string = resourceGroup().location
param sku string = 'Basic'
param capacity int = 1

resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: name
  location: location
  properties: {
    sku: {
      name: sku
      family: sku == 'Premium' ? 'P' : 'C'
      capacity: capacity
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
    }
  }
}

// Azure Cache for Redis uses TLS on port 6380
output redisConnectionString string = 'rediss://:${redis.listKeys().primaryKey}@${redis.properties.hostName}:6380'
output redisHostName string = redis.properties.hostName
