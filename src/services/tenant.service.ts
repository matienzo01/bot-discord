import { injectable, inject } from 'inversify';
import { DatabaseService } from './database.service';
import { Tenant, CreateTenantRequest, TenantConfig } from '../models/tenant.model';
import { HttpError } from 'routing-controllers';

@injectable()
export class TenantService {
  constructor(
    @inject('DatabaseService') private databaseService: DatabaseService
  ) {}

  async createTenant(request: CreateTenantRequest): Promise<{ tenant: Tenant; config: TenantConfig }> {
    // Verificar si ya existe un tenant para este guild
    const existingTenant = await this.databaseService.getTenantByGuildId(request.guildId);
    if (existingTenant) {
      throw new HttpError(409, `Ya existe un tenant para el servidor Discord ${request.guildId}`);
    }

    try {
      const tenant = await this.databaseService.createTenant(request.guildId, request.guildName);
      
      const config: TenantConfig = {
        apiKey: tenant.apiKey,
        dbUser: tenant.dbUser,
        dbPassword: tenant.dbPassword,
        schemaName: tenant.schemaName
      };

      return { tenant, config };
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new HttpError(500, 'Error al crear el tenant');
    }
  }

  async getTenantByGuildId(guildId: string): Promise<Tenant> {
    const tenant = await this.databaseService.getTenantByGuildId(guildId);
    if (!tenant) {
      throw new HttpError(404, `No se encontró tenant para el servidor Discord ${guildId}`);
    }
    return tenant;
  }

  async getTenantByApiKey(apiKey: string): Promise<Tenant> {
    const tenant = await this.databaseService.getTenantByApiKey(apiKey);
    if (!tenant) {
      throw new HttpError(404, 'API Key inválida');
    }
    return tenant;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return this.databaseService.getAllTenants();
  }

  async deleteTenant(guildId: string): Promise<void> {
    const success = await this.databaseService.deleteTenant(guildId);
    if (!success) {
      throw new HttpError(404, `No se encontró tenant para el servidor Discord ${guildId}`);
    }
  }

  async getTenantConfig(guildId: string): Promise<TenantConfig> {
    const tenant = await this.getTenantByGuildId(guildId);
    
    return {
      apiKey: tenant.apiKey,
      dbUser: tenant.dbUser,
      dbPassword: tenant.dbPassword,
      schemaName: tenant.schemaName
    };
  }

  async regenerateApiKey(guildId: string): Promise<string> {
    // Esta funcionalidad se puede implementar más tarde
    throw new HttpError(501, 'Funcionalidad no implementada aún');
  }
}