import { Container } from 'inversify';
import { DiscordService } from '../services/discord.service';
import { MessagesController } from '../controllers/messages.controller';
import { StatusController } from '../controllers/status.controller';
import { ErrorHandler } from '../middleweres/errors/defaultErrors';
import { MembersController } from '../controllers/members.controller';

const container = new Container();

container.bind<DiscordService>(DiscordService).toSelf().inSingletonScope();
container.bind<MessagesController>(MessagesController).toSelf().inSingletonScope();
container.bind<StatusController>(StatusController).toSelf().inSingletonScope();
container.bind<ErrorHandler>(ErrorHandler).toSelf().inSingletonScope();
container.bind<MembersController>(MembersController).toSelf().inSingletonScope();
export { container };