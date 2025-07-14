export interface Tenant {
  id: string;
  guildId: string;
  guildName: string;
  schemaName: string;
  dbUser: string;
  dbPassword: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateTenantRequest {
  guildId: string;
  guildName: string;
}

export interface TenantConfig {
  apiKey: string;
  dbUser: string;
  dbPassword: string;
  schemaName: string;
}