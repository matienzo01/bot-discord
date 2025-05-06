import { Rcon } from 'rcon-client';
import dotenv from 'dotenv';

dotenv.config();

export async function addToWhitelist(username: string): Promise<string> {
  const rcon = await Rcon.connect({
    host: process.env.RCON_HOST!,
    port: parseInt(process.env.RCON_PORT!),
    password: process.env.RCON_PASSWORD!
  });

  try {
    const response = await rcon.send(`whitelist add ${username}`);
    await rcon.end();
    return response;
  } catch (err) {
    await rcon.end();
    throw err;
  }
}
