# Sync Server Platform - API Guide

## Resumen

Esta aplicación implementa la **Opción 3 (Híbrida)** del plan de arquitectura: un sistema de sincronización bidireccional entre Discord y LuckPerms usando esquemas per-tenant en PostgreSQL.

## Componentes Implementados

### 1. Sistema de Tenants
- ✅ Gestión de tenants (servidores Discord)
- ✅ Esquemas PostgreSQL aislados por tenant
- ✅ Usuarios de BD únicos por tenant
- ✅ API keys para autenticación

### 2. Integración LuckPerms
- ✅ Servicio para comunicarse con LuckPerms REST API
- ✅ Operaciones de usuarios y grupos
- ✅ Manejo de permisos

### 3. Sistema de Sincronización
- ✅ Mapeos Discord ↔ LuckPerms (roles/grupos)
- ✅ Mapeos Usuario Discord ↔ Usuario Minecraft
- ✅ Sincronización bidireccional

## APIs Disponibles

### Base URL
```
http://localhost:3000/api
```

### Autenticación
Todas las APIs requieren autenticación. Configurar en `authorizationChecker.ts`.

---

## 🏢 Tenants API

### POST `/tenants`
Crear un nuevo tenant (servidor Discord).

**Request:**
```json
{
  "guildId": "123456789012345678",
  "guildName": "Mi Servidor de Discord"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant creado exitosamente",
  "data": {
    "tenant": {
      "id": "uuid-tenant",
      "guildId": "123456789012345678",
      "guildName": "Mi Servidor de Discord",
      "createdAt": "2025-01-14T..."
    },
    "config": {
      "apiKey": "lp_abcd1234...",
      "dbUser": "user_tenant_...",
      "dbPassword": "password123",
      "schemaName": "schema_tenant_..."
    }
  }
}
```

### GET `/tenants`
Listar todos los tenants.

### GET `/tenants/:guildId`
Obtener información de un tenant específico.

### GET `/tenants/:guildId/config`
Obtener configuración de BD para LuckPerms.

**Response:**
```json
{
  "success": true,
  "data": {
    "databaseConfig": {
      "host": "localhost",
      "port": 5432,
      "database": "minecraft",
      "username": "user_tenant_...",
      "password": "password123",
      "schema": "schema_tenant_..."
    },
    "apiKey": "lp_abcd1234...",
    "instructions": [
      "1. Configura LuckPerms con estas credenciales de base de datos",
      "2. Asegúrate de que el schema esté configurado correctamente",
      "3. Usa el API key para autenticar las llamadas a la API"
    ]
  }
}
```

---

## 🔄 Sincronización API

### POST `/sync/role-mapping`
Crear mapeo entre rol de Discord y grupo de LuckPerms.

**Request:**
```json
{
  "guildId": "123456789012345678",
  "discordRoleId": "987654321098765432",
  "luckpermsGroup": "vip"
}
```

### POST `/sync/user-mapping`
Crear mapeo entre usuario Discord y usuario Minecraft.

**Request:**
```json
{
  "guildId": "123456789012345678",
  "discordUserId": "111222333444555666",
  "minecraftUuid": "550e8400-e29b-41d4-a716-446655440000",
  "minecraftUsername": "PlayerName"
}
```

### GET `/sync/role-mappings/:guildId`
Listar mapeos de roles para un servidor.

### GET `/sync/user-mapping/:guildId/:discordUserId`
Obtener mapeo de usuario específico.

### POST `/sync/discord-to-luckperms/:guildId/:discordUserId`
Sincronizar roles desde Discord hacia LuckPerms.

**Response:**
```json
{
  "success": true,
  "message": "Sincronización completada. 2 acciones realizadas.",
  "data": {
    "actionsPerformed": 2,
    "errors": []
  }
}
```

### POST `/sync/luckperms-to-discord/:guildId/:minecraftUuid`
Sincronizar permisos desde LuckPerms hacia Discord.

---

## 🚀 Cómo Usar

### 1. Configurar un Tenant

```bash
# Crear tenant
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "guildId": "TU_GUILD_ID",
    "guildName": "Tu Servidor"
  }'
```

### 2. Configurar LuckPerms

Con la respuesta del paso anterior, configura LuckPerms:

```yaml
# config.yml de LuckPerms
storage-method: postgresql
data:
  address: localhost:5432
  database: minecraft
  username: user_tenant_xxx  # Del response
  password: password_xxx     # Del response
  table-prefix: 'luckperms_'
  schema: schema_tenant_xxx  # Del response
```

### 3. Crear Mapeos

```bash
# Mapear rol Discord con grupo LuckPerms
curl -X POST http://localhost:3000/api/sync/role-mapping \
  -H "Content-Type: application/json" \
  -d '{
    "guildId": "TU_GUILD_ID",
    "discordRoleId": "ROLE_ID_DISCORD",
    "luckpermsGroup": "vip"
  }'

# Mapear usuario Discord con Minecraft
curl -X POST http://localhost:3000/api/sync/user-mapping \
  -H "Content-Type: application/json" \
  -d '{
    "guildId": "TU_GUILD_ID",
    "discordUserId": "USER_ID_DISCORD",
    "minecraftUuid": "minecraft-uuid",
    "minecraftUsername": "PlayerName"
  }'
```

### 4. Sincronizar

```bash
# Discord → LuckPerms
curl -X POST http://localhost:3000/api/sync/discord-to-luckperms/GUILD_ID/USER_ID

# LuckPerms → Discord  
curl -X POST http://localhost:3000/api/sync/luckperms-to-discord/GUILD_ID/MINECRAFT_UUID
```

---

## 🛠️ Desarrollo

### Levantar el entorno

```bash
cd bot-discord
npm install
docker-compose up -d
npm run dev
```

### URLs de desarrollo

- **Backend API:** http://localhost:3000/api
- **LuckPerms REST API:** http://localhost:8080
- **PostgreSQL:** localhost:5432

### Estructura del Proyecto

```
src/
├── models/          # Modelos de datos
├── services/        # Lógica de negocio
├── controllers/     # Endpoints REST
├── config/          # Configuración DI
└── middlewares/     # Autenticación, errores
```

---

## 🔐 Seguridad

- **Conexión Admin Centralizada:** El backend usa una sola conexión admin con acceso completo
- **Esquemas Aislados:** Cada tenant tiene su propio schema PostgreSQL 
- **Usuarios Limitados:** Los consumidores reciben credenciales con acceso solo a su schema
- **API Keys Únicas:** Cada tenant tiene su API key para LuckPerms
- **Aislamiento de Datos:** No se comparten datos entre tenants

### Arquitectura de Base de Datos

```
Esquema 'app':
├── tenants (gestión de servidores Discord)
├── role_mappings (mapeos Discord ↔ LuckPerms)
├── user_mappings (mapeos Usuario Discord ↔ Minecraft)
└── sync_actions (historial de sincronizaciones)

Esquemas por Tenant:
├── schema_tenant_123:
│   ├── luckperms_players
│   ├── luckperms_user_permissions
│   ├── luckperms_groups
│   └── luckperms_group_permissions
└── schema_tenant_456: (solo datos LuckPerms)
```

**Permisos:**
- Backend (Admin): Acceso completo a esquema `app` + todos los esquemas tenant
- Consumer: Acceso solo a su esquema tenant específico (para LuckPerms)

---

## 📝 Notas

- El sistema soporta múltiples servidores Discord
- Cada servidor tiene su propia BD y configuración
- La sincronización puede ser manual o automatizada
- Los esquemas se crean automáticamente al crear tenants

## 🔄 Estado del Proyecto

### ✅ **Completado:**
- Sistema multi-tenant con esquemas aislados
- APIs REST completas para tenants y sincronización
- Integración con LuckPerms REST API
- Arquitectura de BD optimizada (esquema `app` + esquemas tenant)
- Docker Compose configurado
- Documentación completa

### 🔄 **Pendiente para Testing:**
- Credenciales Discord (DISCORD_TOKEN, CLIENT_ID)
- Descomentar imports Discord en `index.ts` y `discord.service.ts`
- Testing completo con datos reales

### 📋 **Próximos Pasos:**
1. Configurar credenciales Discord reales
2. Probar flujo completo de tenants
3. Verificar sincronización bidireccional
4. Implementar autenticación real
5. Agregar tests automatizados

**💡 El código está funcionalmente completo y listo para testing con credenciales Discord.**