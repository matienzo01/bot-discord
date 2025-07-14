import { injectable } from 'inversify';
import { Pool } from 'pg';
import { Tenant } from '../models/tenant.model';

@injectable()
export class DatabaseService {
  private adminPool: Pool;

  constructor() {
    // Pool admin con acceso completo a toda la base de datos
    this.adminPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'minecraft',
      user: process.env.DB_ADMIN_USER || 'username',
      password: process.env.DB_ADMIN_PASSWORD || 'passw0rd',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async connect() {
    try {
      // Verificar conexión y crear tabla de tenants
      await this.initializeTenantTable();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.adminPool.end();
  }

  // Getter para el pool admin - nuestro backend siempre usa esta conexión
  getAdminPool(): Pool {
    return this.adminPool;
  }

  private async initializeTenantTable() {
    const client = await this.adminPool.connect();
    try {
      // Crear esquema app para datos de nuestra plataforma
      await client.query('CREATE SCHEMA IF NOT EXISTS app');

      // Crear tabla de tenants en el esquema app
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS app.tenants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          guild_id VARCHAR(255) UNIQUE NOT NULL,
          guild_name VARCHAR(255) NOT NULL,
          schema_name VARCHAR(255) UNIQUE NOT NULL,
          db_user VARCHAR(255) UNIQUE NOT NULL,
          db_password VARCHAR(255) NOT NULL,
          api_key VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        );
      `;

      await client.query(createTableQuery);

      // Crear tablas para mapeos en el esquema app
      await this.createAppTables(client);
    } finally {
      client.release();
    }
  }

  private async createAppTables(client: any) {
    const appTables = [
      `CREATE TABLE IF NOT EXISTS app.role_mappings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        discord_role_id VARCHAR(255) NOT NULL,
        discord_role_name VARCHAR(255) NOT NULL,
        luckperms_group VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, discord_role_id, luckperms_group)
      )`,
      `CREATE TABLE IF NOT EXISTS app.user_mappings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        discord_user_id VARCHAR(255) NOT NULL,
        minecraft_uuid VARCHAR(36) NOT NULL,
        minecraft_username VARCHAR(16) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, discord_user_id)
      )`,
      `CREATE TABLE IF NOT EXISTS app.sync_actions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        source VARCHAR(20) NOT NULL,
        target VARCHAR(20) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        role_id VARCHAR(255),
        permission VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )`
    ];

    for (const query of appTables) {
      await client.query(query);
    }
  }

  async createTenant(guildId: string, guildName: string): Promise<Tenant> {
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const schemaName = `schema_${tenantId}`;
    const dbUser = `user_${tenantId}`;
    const dbPassword = this.generatePassword();
    const apiKey = this.generateApiKey();

    const client = await this.adminPool.connect();
    
    try {
      await client.query('BEGIN');

      // Crear el schema
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

      // Crear el usuario de base de datos
      await client.query(`CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}'`);
      
      // Dar permisos solo al schema específico
      await client.query(`GRANT USAGE ON SCHEMA "${schemaName}" TO "${dbUser}"`);
      await client.query(`GRANT ALL PRIVILEGES ON SCHEMA "${schemaName}" TO "${dbUser}"`);
      await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "${schemaName}" TO "${dbUser}"`);
      await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "${schemaName}" TO "${dbUser}"`);
      await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${schemaName}" GRANT ALL ON TABLES TO "${dbUser}"`);
      await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${schemaName}" GRANT ALL ON SEQUENCES TO "${dbUser}"`);

      // Crear las tablas de LuckPerms en el schema del tenant
      await this.createLuckPermsSchema(client, schemaName);

      // Insertar el tenant en la tabla de control (esquema app)
      const insertQuery = `
        INSERT INTO app.tenants (guild_id, guild_name, schema_name, db_user, db_password, api_key)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        guildId, guildName, schemaName, dbUser, dbPassword, apiKey
      ]);

      await client.query('COMMIT');
      
      return this.mapRowToTenant(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async createLuckPermsSchema(client: any, schemaName: string) {
    const luckPermsQueries = [
      `CREATE TABLE IF NOT EXISTS "${schemaName}".luckperms_players (
        uuid VARCHAR(36) PRIMARY KEY,
        username VARCHAR(16) NOT NULL,
        primary_group VARCHAR(36) NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS "${schemaName}".luckperms_user_permissions (
        id SERIAL PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL,
        permission VARCHAR(200) NOT NULL,
        value BOOLEAN NOT NULL,
        server VARCHAR(36) NOT NULL,
        world VARCHAR(64) NOT NULL,
        expiry BIGINT NOT NULL,
        contexts VARCHAR(200) NOT NULL,
        FOREIGN KEY (uuid) REFERENCES "${schemaName}".luckperms_players(uuid) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS "${schemaName}".luckperms_groups (
        name VARCHAR(36) PRIMARY KEY
      )`,
      `CREATE TABLE IF NOT EXISTS "${schemaName}".luckperms_group_permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(36) NOT NULL,
        permission VARCHAR(200) NOT NULL,
        value BOOLEAN NOT NULL,
        server VARCHAR(36) NOT NULL,
        world VARCHAR(64) NOT NULL,
        expiry BIGINT NOT NULL,
        contexts VARCHAR(200) NOT NULL,
        FOREIGN KEY (name) REFERENCES "${schemaName}".luckperms_groups(name) ON DELETE CASCADE
      )`
    ];

    for (const query of luckPermsQueries) {
      await client.query(query);
    }

    // Crear grupo por defecto
    await client.query(`INSERT INTO "${schemaName}".luckperms_groups (name) VALUES ('default') ON CONFLICT DO NOTHING`);
  }

  async getTenantByGuildId(guildId: string): Promise<Tenant | null> {
    const query = 'SELECT * FROM app.tenants WHERE guild_id = $1 AND is_active = true';
    const result = await this.adminPool.query(query, [guildId]);
    
    return result.rows.length > 0 ? this.mapRowToTenant(result.rows[0]) : null;
  }

  async getTenantByApiKey(apiKey: string): Promise<Tenant | null> {
    const query = 'SELECT * FROM app.tenants WHERE api_key = $1 AND is_active = true';
    const result = await this.adminPool.query(query, [apiKey]);
    
    return result.rows.length > 0 ? this.mapRowToTenant(result.rows[0]) : null;
  }

  async getAllTenants(): Promise<Tenant[]> {
    const query = 'SELECT * FROM app.tenants WHERE is_active = true ORDER BY created_at DESC';
    const result = await this.adminPool.query(query);
    
    return result.rows.map(row => this.mapRowToTenant(row));
  }

  async deleteTenant(guildId: string): Promise<boolean> {
    const tenant = await this.getTenantByGuildId(guildId);
    if (!tenant) return false;

    const client = await this.adminPool.connect();
    
    try {
      await client.query('BEGIN');

      // Marcar como inactivo
      await client.query('UPDATE app.tenants SET is_active = false WHERE guild_id = $1', [guildId]);

      // Opcional: Eliminar el schema y usuario (comentado para seguridad)
      // await client.query(`DROP SCHEMA IF EXISTS "${tenant.schemaName}" CASCADE`);
      // await client.query(`DROP USER IF EXISTS "${tenant.dbUser}"`);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapRowToTenant(row: any): Tenant {
    return {
      id: row.id,
      guildId: row.guild_id,
      guildName: row.guild_name,
      schemaName: row.schema_name,
      dbUser: row.db_user,
      dbPassword: row.db_password,
      apiKey: row.api_key,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active
    };
  }

  private generatePassword(): string {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
  }

  private generateApiKey(): string {
    return 'lp_' + Math.random().toString(36).substr(2, 32);
  }

  // Método para ejecutar queries en el schema de un tenant específico
  async queryInTenantSchema(tenant: Tenant, query: string, params: any[] = []): Promise<any> {
    const client = await this.adminPool.connect();
    try {
      // Cambiar al schema del tenant para esta consulta
      await client.query(`SET search_path TO "${tenant.schemaName}"`);
      const result = await client.query(query, params);
      return result;
    } finally {
      // Restaurar search_path por defecto
      await client.query('SET search_path TO public');
      client.release();
    }
  }
}