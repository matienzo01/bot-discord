import { injectable } from 'inversify';
import client from '../bot/discordBot';

@injectable()
export class DiscordService {
  getClient() {
    return client;
  }
}