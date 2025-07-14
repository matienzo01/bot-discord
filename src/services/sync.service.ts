import { injectable, inject } from 'inversify';
import { DatabaseService } from './database.service';
import { TenantService } from './tenant.service';
import { LuckPermsService } from './luckperms.service';
import { DiscordService } from './discord.service';
import { 
  RoleMapping, 
  UserMapping, 
  SyncAction, 
  SyncResult,
  CreateRoleMappingRequest,
  CreateUserMappingRequest 
} from '../models/sync.model';
import { HttpError } from 'routing-controllers';
import { Pool } from 'pg';

@injectable()
export class SyncService {
  constructor(
    @inject('DatabaseService') private databaseService: DatabaseService,
    @inject('TenantService') private tenantService: TenantService,
    @inject('LuckPermsService') private luckPermsService: LuckPermsService,
    private discordService: DiscordService
  ) {}

  async createRoleMapping(request: CreateRoleMappingRequest): Promise<RoleMapping> {
    const tenant = await this.tenantService.getTenantByGuildId(request.guildId);
    
    // Verificar que el rol existe en Discord
    const discordClient = this.discordService.getClient();
    const guild = await discordClient.guilds.fetch(request.guildId);
    const discordRole = await guild.roles.fetch(request.discordRoleId);
    
    if (!discordRole) {
      throw new HttpError(404, 'Rol de Discord no encontrado');
    }

    // Crear o verificar que el grupo existe en LuckPerms
    let luckpermsGroup = await this.luckPermsService.getGroup(request.guildId, request.luckpermsGroup);
    if (!luckpermsGroup) {
      await this.luckPermsService.createGroup(request.guildId, request.luckpermsGroup);
    }

    const adminPool = this.databaseService.getAdminPool();
    const client = await adminPool.connect();

    try {
      await client.query('BEGIN');

      // Insertar el mapeo en el esquema app
      const insertQuery = `
        INSERT INTO app.role_mappings 
        (discord_role_id, discord_role_name, luckperms_group, tenant_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        request.discordRoleId,
        discordRole.name,
        request.luckpermsGroup,
        tenant.id
      ]);

      await client.query('COMMIT');
      
      return this.mapRowToRoleMapping(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating role mapping:', error);
      throw new HttpError(500, 'Error al crear el mapeo de rol');
    } finally {
      client.release();
    }
  }

  async createUserMapping(request: CreateUserMappingRequest): Promise<UserMapping> {
    const tenant = await this.tenantService.getTenantByGuildId(request.guildId);
    
    // Verificar que el usuario existe en Discord
    const discordClient = this.discordService.getClient();
    const guild = await discordClient.guilds.fetch(request.guildId);
    const discordMember = await guild.members.fetch(request.discordUserId).catch(() => null);
    
    if (!discordMember) {
      throw new HttpError(404, 'Usuario de Discord no encontrado en el servidor');
    }

    const adminPool = this.databaseService.getAdminPool();
    const client = await adminPool.connect();

    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO app.user_mappings 
        (discord_user_id, minecraft_uuid, minecraft_username, tenant_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (tenant_id, discord_user_id) DO UPDATE SET
          minecraft_uuid = $2,
          minecraft_username = $3,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        request.discordUserId,
        request.minecraftUuid,
        request.minecraftUsername,
        tenant.id
      ]);

      await client.query('COMMIT');
      
      return this.mapRowToUserMapping(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating user mapping:', error);
      throw new HttpError(500, 'Error al crear el mapeo de usuario');
    } finally {
      client.release();
    }
  }

  async syncDiscordToLuckPerms(guildId: string, discordUserId: string): Promise<SyncResult> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    const result: SyncResult = { success: true, actionsPerformed: 0, errors: [] };

    try {
      // Obtener mapeo de usuario
      const userMapping = await this.getUserMapping(guildId, discordUserId);
      if (!userMapping) {
        throw new Error('Usuario no tiene mapeo con Minecraft');
      }

      // Obtener roles del usuario en Discord
      const discordClient = this.discordService.getClient();
      const guild = await discordClient.guilds.fetch(guildId);
      const member = await guild.members.fetch(discordUserId);

      // Obtener mapeos de roles
      const roleMappings = await this.getRoleMappings(guildId);

      for (const roleMapping of roleMappings) {
        const hasDiscordRole = member.roles.cache.has(roleMapping.discordRoleId);
        const luckpermsUser = await this.luckPermsService.getUser(guildId, userMapping.minecraftUuid);
        
        if (luckpermsUser) {
          const hasLuckPermsGroup = luckpermsUser.permissions.some(p => 
            p.permission === `group.${roleMapping.luckpermsGroup}` && p.value
          );

          if (hasDiscordRole && !hasLuckPermsGroup) {
            // Agregar grupo en LuckPerms
            await this.luckPermsService.addUserToGroup(guildId, userMapping.minecraftUuid, roleMapping.luckpermsGroup);
            result.actionsPerformed++;
          } else if (!hasDiscordRole && hasLuckPermsGroup) {
            // Remover grupo en LuckPerms
            await this.luckPermsService.removeUserFromGroup(guildId, userMapping.minecraftUuid, roleMapping.luckpermsGroup);
            result.actionsPerformed++;
          }
        }
      }

      // Actualizar timestamp de sincronización
      await this.updateUserMappingSync(guildId, discordUserId);

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Error desconocido');
    }

    return result;
  }

  async syncLuckPermsToDiscord(guildId: string, minecraftUuid: string): Promise<SyncResult> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    const result: SyncResult = { success: true, actionsPerformed: 0, errors: [] };

    try {
      // Obtener mapeo de usuario
      const userMapping = await this.getUserMappingByUuid(guildId, minecraftUuid);
      if (!userMapping) {
        throw new Error('Usuario no tiene mapeo con Discord');
      }

      // Obtener datos de LuckPerms
      const luckpermsUser = await this.luckPermsService.getUser(guildId, minecraftUuid);
      if (!luckpermsUser) {
        throw new Error('Usuario no encontrado en LuckPerms');
      }

      // Obtener usuario de Discord
      const discordClient = this.discordService.getClient();
      const guild = await discordClient.guilds.fetch(guildId);
      const member = await guild.members.fetch(userMapping.discordUserId).catch(() => null);
      
      if (!member) {
        throw new Error('Usuario no encontrado en Discord');
      }

      // Obtener mapeos de roles
      const roleMappings = await this.getRoleMappings(guildId);

      for (const roleMapping of roleMappings) {
        const hasLuckPermsGroup = luckpermsUser.permissions.some(p => 
          p.permission === `group.${roleMapping.luckpermsGroup}` && p.value
        );
        const hasDiscordRole = member.roles.cache.has(roleMapping.discordRoleId);

        if (hasLuckPermsGroup && !hasDiscordRole) {
          // Agregar rol en Discord
          const role = await guild.roles.fetch(roleMapping.discordRoleId);
          if (role) {
            await member.roles.add(role);
            result.actionsPerformed++;
          }
        } else if (!hasLuckPermsGroup && hasDiscordRole) {
          // Remover rol en Discord
          const role = await guild.roles.fetch(roleMapping.discordRoleId);
          if (role) {
            await member.roles.remove(role);
            result.actionsPerformed++;
          }
        }
      }

      // Actualizar timestamp de sincronización
      await this.updateUserMappingSync(guildId, userMapping.discordUserId);

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Error desconocido');
    }

    return result;
  }

  async getUserMapping(guildId: string, discordUserId: string): Promise<UserMapping | null> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    const adminPool = this.databaseService.getAdminPool();

    const query = `
      SELECT * FROM app.user_mappings 
      WHERE tenant_id = $1 AND discord_user_id = $2 AND is_active = true
    `;
    
    const result = await adminPool.query(query, [tenant.id, discordUserId]);
    return result.rows.length > 0 ? this.mapRowToUserMapping(result.rows[0]) : null;
  }

  async getUserMappingByUuid(guildId: string, minecraftUuid: string): Promise<UserMapping | null> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    const adminPool = this.databaseService.getAdminPool();

    const query = `
      SELECT * FROM app.user_mappings 
      WHERE tenant_id = $1 AND minecraft_uuid = $2 AND is_active = true
    `;
    
    const result = await adminPool.query(query, [tenant.id, minecraftUuid]);
    return result.rows.length > 0 ? this.mapRowToUserMapping(result.rows[0]) : null;
  }

  async getRoleMappings(guildId: string): Promise<RoleMapping[]> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    const adminPool = this.databaseService.getAdminPool();

    const query = `
      SELECT * FROM app.role_mappings 
      WHERE tenant_id = $1 AND is_active = true ORDER BY created_at DESC
    `;
    
    const result = await adminPool.query(query, [tenant.id]);
    return result.rows.map((row: any) => this.mapRowToRoleMapping(row));
  }

  private async updateUserMappingSync(guildId: string, discordUserId: string): Promise<void> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    const adminPool = this.databaseService.getAdminPool();

    const query = `
      UPDATE app.user_mappings 
      SET last_sync_at = CURRENT_TIMESTAMP 
      WHERE tenant_id = $1 AND discord_user_id = $2
    `;
    
    await adminPool.query(query, [tenant.id, discordUserId]);
  }


  private mapRowToRoleMapping(row: any): RoleMapping {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      discordRoleId: row.discord_role_id,
      discordRoleName: row.discord_role_name,
      luckpermsGroup: row.luckperms_group,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToUserMapping(row: any): UserMapping {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      discordUserId: row.discord_user_id,
      minecraftUuid: row.minecraft_uuid,
      minecraftUsername: row.minecraft_username,
      isActive: row.is_active,
      lastSyncAt: row.last_sync_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}