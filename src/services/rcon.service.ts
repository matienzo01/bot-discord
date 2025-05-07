import { injectable } from 'inversify';
import { Rcon } from 'rcon-client';
import dotenv from 'dotenv';

dotenv.config();

@injectable()
export class RconService {
  async addToWhitelist(username: string): Promise<string> {
    const rcon = await Rcon.connect({
      host: process.env.RCON_HOST!,
      port: +process.env.RCON_PORT!,
      password: process.env.RCON_PASSWORD!,
    });
    try {
      const res = await rcon.send(`whitelist add ${username}`);
      await rcon.end();
      return res;
    } finally {
      await rcon.end();
    }
  }
}