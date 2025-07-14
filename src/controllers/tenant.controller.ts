import { JsonController, Post, Get, Delete, Body, Param, Authorized } from 'routing-controllers';
import { inject, injectable } from 'inversify';
import { TenantService } from '../services/tenant.service';
import { CreateTenantRequest } from '../models/tenant.model';

@JsonController('/tenants')
@injectable()
export class TenantController {
  constructor(
    @inject('TenantService') private tenantService: TenantService
  ) {}

  @Post()
  @Authorized()
  async createTenant(@Body() request: CreateTenantRequest) {
    const result = await this.tenantService.createTenant(request);
    
    return {
      success: true,
      message: 'Tenant creado exitosamente',
      data: {
        tenant: {
          id: result.tenant.id,
          guildId: result.tenant.guildId,
          guildName: result.tenant.guildName,
          createdAt: result.tenant.createdAt,
          isActive: result.tenant.isActive
        },
        config: result.config
      }
    };
  }

  @Get('/')
  @Authorized()
  async getAllTenants() {
    const tenants = await this.tenantService.getAllTenants();
    
    return {
      success: true,
      data: tenants.map(tenant => ({
        id: tenant.id,
        guildId: tenant.guildId,
        guildName: tenant.guildName,
        schemaName: tenant.schemaName,
        createdAt: tenant.createdAt,
        isActive: tenant.isActive
      }))
    };
  }

  @Get('/:guildId')
  @Authorized()
  async getTenant(@Param('guildId') guildId: string) {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    return {
      success: true,
      data: {
        id: tenant.id,
        guildId: tenant.guildId,
        guildName: tenant.guildName,
        schemaName: tenant.schemaName,
        createdAt: tenant.createdAt,
        isActive: tenant.isActive
      }
    };
  }

  @Get('/:guildId/config')
  @Authorized()
  async getTenantConfig(@Param('guildId') guildId: string) {
    const config = await this.tenantService.getTenantConfig(guildId);
    
    return {
      success: true,
      message: 'Configuración para LuckPerms',
      data: {
        databaseConfig: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'minecraft',
          username: config.dbUser,
          password: config.dbPassword,
          schema: config.schemaName
        },
        apiKey: config.apiKey,
        instructions: [
          '1. Configura LuckPerms con estas credenciales de base de datos',
          '2. Asegúrate de que el schema esté configurado correctamente',
          '3. Usa el API key para autenticar las llamadas a la API'
        ]
      }
    };
  }

  @Delete('/:guildId')
  @Authorized()
  async deleteTenant(@Param('guildId') guildId: string) {
    await this.tenantService.deleteTenant(guildId);
    
    return {
      success: true,
      message: 'Tenant eliminado exitosamente'
    };
  }
}