import { Container } from 'inversify';
import { TYPES } from './types';
import { RconService } from '../services/rcon.service';
import { DiscordService } from '../services/discord.service';
import { MessagesController } from '../controllers/messages.controller';
import { StatusController } from '../controllers/status.controller';

const container = new Container();

container.bind<RconService>(TYPES.RconService).to(RconService).inSingletonScope();
container.bind<DiscordService>(TYPES.DiscordService).to(DiscordService).inSingletonScope();
container.bind<MessagesController>(MessagesController).toSelf();
container.bind<StatusController>(StatusController).toSelf();
export { container };