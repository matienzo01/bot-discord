export interface RoleMapping {
  id: string;
  tenantId: string;
  discordRoleId: string;
  discordRoleName: string;
  luckpermsGroup: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMapping {
  id: string;
  tenantId: string;
  discordUserId: string;
  minecraftUuid: string;
  minecraftUsername: string;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncAction {
  id: string;
  tenantId: string;
  action: 'role_add' | 'role_remove' | 'permission_add' | 'permission_remove';
  source: 'discord' | 'luckperms';
  target: 'discord' | 'luckperms';
  userId: string;
  roleId?: string;
  permission?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateRoleMappingRequest {
  guildId: string;
  discordRoleId: string;
  luckpermsGroup: string;
}

export interface CreateUserMappingRequest {
  guildId: string;
  discordUserId: string;
  minecraftUuid: string;
  minecraftUsername: string;
}

export interface SyncResult {
  success: boolean;
  actionsPerformed: number;
  errors: string[];
}