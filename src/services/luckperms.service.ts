import { injectable, inject } from 'inversify';
import { TenantService } from './tenant.service';
import { HttpError } from 'routing-controllers';

export interface UserPermission {
  permission: string;
  value: boolean;
  server?: string;
  world?: string;
  expiry?: number;
  contexts?: Record<string, string>;
}

export interface LuckPermsUser {
  uuid: string;
  username: string;
  primaryGroup: string;
  permissions: UserPermission[];
}

export interface LuckPermsGroup {
  name: string;
  permissions: UserPermission[];
}

@injectable()
export class LuckPermsService {
  private baseUrl: string;

  constructor(
    @inject('TenantService') private tenantService: TenantService
  ) {
    this.baseUrl = process.env.LUCKPERMS_API_URL || 'http://localhost:3001';
  }

  async getUser(guildId: string, uuid: string): Promise<LuckPermsUser | null> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/user/${uuid}`, {
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }

      return await response.json() as LuckPermsUser;
    } catch (error) {
      console.error('Error fetching user from LuckPerms:', error);
      throw new HttpError(500, 'Error al consultar LuckPerms');
    }
  }

  async getUserByUsername(guildId: string, username: string): Promise<LuckPermsUser | null> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/user/lookup/${username}`, {
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }

      return await response.json() as LuckPermsUser;
    } catch (error) {
      console.error('Error fetching user by username from LuckPerms:', error);
      throw new HttpError(500, 'Error al consultar LuckPerms');
    }
  }

  async addUserPermission(guildId: string, uuid: string, permission: UserPermission): Promise<void> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/user/${uuid}/permission`, {
        method: 'POST',
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permission)
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding permission to user:', error);
      throw new HttpError(500, 'Error al agregar permiso en LuckPerms');
    }
  }

  async removeUserPermission(guildId: string, uuid: string, permission: string): Promise<void> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/user/${uuid}/permission`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permission })
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing permission from user:', error);
      throw new HttpError(500, 'Error al remover permiso en LuckPerms');
    }
  }

  async addUserToGroup(guildId: string, uuid: string, groupName: string): Promise<void> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/user/${uuid}/group/${groupName}`, {
        method: 'POST',
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw new HttpError(500, 'Error al agregar usuario al grupo en LuckPerms');
    }
  }

  async removeUserFromGroup(guildId: string, uuid: string, groupName: string): Promise<void> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/user/${uuid}/group/${groupName}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing user from group:', error);
      throw new HttpError(500, 'Error al remover usuario del grupo en LuckPerms');
    }
  }

  async getGroup(guildId: string, groupName: string): Promise<LuckPermsGroup | null> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/group/${groupName}`, {
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }

      return await response.json() as LuckPermsGroup;
    } catch (error) {
      console.error('Error fetching group from LuckPerms:', error);
      throw new HttpError(500, 'Error al consultar grupo en LuckPerms');
    }
  }

  async createGroup(guildId: string, groupName: string): Promise<void> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/group/${groupName}`, {
        method: 'POST',
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating group in LuckPerms:', error);
      throw new HttpError(500, 'Error al crear grupo en LuckPerms');
    }
  }

  async addGroupPermission(guildId: string, groupName: string, permission: UserPermission): Promise<void> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/group/${groupName}/permission`, {
        method: 'POST',
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permission)
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding permission to group:', error);
      throw new HttpError(500, 'Error al agregar permiso al grupo en LuckPerms');
    }
  }

  async removeGroupPermission(guildId: string, groupName: string, permission: string): Promise<void> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/group/${groupName}/permission`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permission })
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing permission from group:', error);
      throw new HttpError(500, 'Error al remover permiso del grupo en LuckPerms');
    }
  }

  async getAllUsers(guildId: string): Promise<LuckPermsUser[]> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }

      return await response.json() as LuckPermsUser[];
    } catch (error) {
      console.error('Error fetching all users from LuckPerms:', error);
      throw new HttpError(500, 'Error al consultar usuarios en LuckPerms');
    }
  }

  async getAllGroups(guildId: string): Promise<LuckPermsGroup[]> {
    const tenant = await this.tenantService.getTenantByGuildId(guildId);
    
    try {
      const response = await fetch(`${this.baseUrl}/groups`, {
        headers: {
          'X-API-Key': tenant.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`LuckPerms API error: ${response.status}`);
      }

      return await response.json() as LuckPermsGroup[];
    } catch (error) {
      console.error('Error fetching all groups from LuckPerms:', error);
      throw new HttpError(500, 'Error al consultar grupos en LuckPerms');
    }
  }
}