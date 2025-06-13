import { Container } from 'inversify';
import { RconService } from '../services/rcon.service';
import { DiscordService } from '../services/discord.service';
import { MessagesController } from '../controllers/messages.controller';
import { StatusController } from '../controllers/status.controller';
import { ErrorHandler } from '../middleweres/errors/defaultErrors';

const container = new Container();

container.bind<RconService>(RconService).toSelf().inSingletonScope();
container.bind<DiscordService>(DiscordService).toSelf().inSingletonScope();
container.bind<MessagesController>(MessagesController).toSelf().inSingletonScope();
container.bind<StatusController>(StatusController).toSelf().inSingletonScope();
container.bind<ErrorHandler>(ErrorHandler).toSelf().inSingletonScope();
export { container };