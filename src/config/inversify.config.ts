import { Container } from 'inversify';
import { DiscordService } from '../services/discord.service';
import { DatabaseService } from '../services/database.service';
import { TenantService } from '../services/tenant.service';
import { LuckPermsService } from '../services/luckperms.service';
import { SyncService } from '../services/sync.service';
import { MessagesController } from '../controllers/messages.controller';
import { StatusController } from '../controllers/status.controller';
import { TenantController } from '../controllers/tenant.controller';
import { SyncController } from '../controllers/sync.controller';
import { ErrorHandler } from '../middleweres/errors/defaultErrors';
import { MembersController } from '../controllers/members.controller';

const container = new Container();

// Services
container.bind<DiscordService>(DiscordService).toSelf().inSingletonScope();
container.bind<DatabaseService>('DatabaseService').to(DatabaseService).inSingletonScope();
container.bind<TenantService>('TenantService').to(TenantService).inSingletonScope();
container.bind<LuckPermsService>('LuckPermsService').to(LuckPermsService).inSingletonScope();
container.bind<SyncService>('SyncService').to(SyncService).inSingletonScope();

// Controllers
container.bind<MessagesController>(MessagesController).toSelf().inSingletonScope();
container.bind<StatusController>(StatusController).toSelf().inSingletonScope();
container.bind<TenantController>(TenantController).toSelf().inSingletonScope();
container.bind<SyncController>(SyncController).toSelf().inSingletonScope();
container.bind<MembersController>(MembersController).toSelf().inSingletonScope();

// Middleware
container.bind<ErrorHandler>(ErrorHandler).toSelf().inSingletonScope();
export { container };