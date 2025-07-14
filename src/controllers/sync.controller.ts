import { JsonController, Post, Get, Body, Param, Authorized } from 'routing-controllers';
import { inject, injectable } from 'inversify';
import { SyncService } from '../services/sync.service';
import { CreateRoleMappingRequest, CreateUserMappingRequest } from '../models/sync.model';

@JsonController('/sync')
@injectable()
export class SyncController {
  constructor(
    @inject('SyncService') private syncService: SyncService
  ) {}

  @Post('/role-mapping')
  @Authorized()
  async createRoleMapping(@Body() request: CreateRoleMappingRequest) {
    const roleMapping = await this.syncService.createRoleMapping(request);
    
    return {
      success: true,
      message: 'Mapeo de rol creado exitosamente',
      data: {
        id: roleMapping.id,
        discordRoleId: roleMapping.discordRoleId,
        discordRoleName: roleMapping.discordRoleName,
        luckpermsGroup: roleMapping.luckpermsGroup,
        createdAt: roleMapping.createdAt
      }
    };
  }

  @Post('/user-mapping')
  @Authorized()
  async createUserMapping(@Body() request: CreateUserMappingRequest) {
    const userMapping = await this.syncService.createUserMapping(request);
    
    return {
      success: true,
      message: 'Mapeo de usuario creado exitosamente',
      data: {
        id: userMapping.id,
        discordUserId: userMapping.discordUserId,
        minecraftUuid: userMapping.minecraftUuid,
        minecraftUsername: userMapping.minecraftUsername,
        createdAt: userMapping.createdAt
      }
    };
  }

  @Get('/role-mappings/:guildId')
  @Authorized()
  async getRoleMappings(@Param('guildId') guildId: string) {
    const roleMappings = await this.syncService.getRoleMappings(guildId);
    
    return {
      success: true,
      data: roleMappings.map(mapping => ({
        id: mapping.id,
        discordRoleId: mapping.discordRoleId,
        discordRoleName: mapping.discordRoleName,
        luckpermsGroup: mapping.luckpermsGroup,
        isActive: mapping.isActive,
        createdAt: mapping.createdAt
      }))
    };
  }

  @Get('/user-mapping/:guildId/:discordUserId')
  @Authorized()
  async getUserMapping(@Param('guildId') guildId: string, @Param('discordUserId') discordUserId: string) {
    const userMapping = await this.syncService.getUserMapping(guildId, discordUserId);
    
    if (!userMapping) {
      return {
        success: false,
        message: 'Usuario no tiene mapeo configurado'
      };
    }
    
    return {
      success: true,
      data: {
        id: userMapping.id,
        discordUserId: userMapping.discordUserId,
        minecraftUuid: userMapping.minecraftUuid,
        minecraftUsername: userMapping.minecraftUsername,
        lastSyncAt: userMapping.lastSyncAt,
        createdAt: userMapping.createdAt
      }
    };
  }

  @Post('/discord-to-luckperms/:guildId/:discordUserId')
  @Authorized()
  async syncDiscordToLuckPerms(@Param('guildId') guildId: string, @Param('discordUserId') discordUserId: string) {
    const result = await this.syncService.syncDiscordToLuckPerms(guildId, discordUserId);
    
    return {
      success: result.success,
      message: result.success 
        ? `Sincronización completada. ${result.actionsPerformed} acciones realizadas.`
        : 'Error en la sincronización',
      data: {
        actionsPerformed: result.actionsPerformed,
        errors: result.errors
      }
    };
  }

  @Post('/luckperms-to-discord/:guildId/:minecraftUuid')
  @Authorized()
  async syncLuckPermsToDiscord(@Param('guildId') guildId: string, @Param('minecraftUuid') minecraftUuid: string) {
    const result = await this.syncService.syncLuckPermsToDiscord(guildId, minecraftUuid);
    
    return {
      success: result.success,
      message: result.success 
        ? `Sincronización completada. ${result.actionsPerformed} acciones realizadas.`
        : 'Error en la sincronización',
      data: {
        actionsPerformed: result.actionsPerformed,
        errors: result.errors
      }
    };
  }

  @Post('/full-sync/:guildId')
  @Authorized()
  async fullSync(@Param('guildId') guildId: string) {
    // Esta funcionalidad se puede implementar más tarde para sincronizar todos los usuarios
    return {
      success: false,
      message: 'Sincronización completa no implementada aún'
    };
  }
}