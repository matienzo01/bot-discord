import { injectable } from 'inversify';
// import client from '../bot/discordBot'; // Comentado temporalmente para testing
import { HttpError } from 'routing-controllers';
import { GUILD_ID, PROS_ROLE_ID } from '../constants';

@injectable()
export class DiscordService {
  getClient() {
    // return client; // Comentado temporalmente para testing
    return null;
  }

  async addProsRoleToMember(userId: string) {
    throw new HttpError(501, 'Discord bot no disponible en modo testing');
    // const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) throw new HttpError(500, 'No se encontró el servidor de Discord');

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) throw new HttpError(404, 'Usuario no encontrado');

    let role = await guild.roles.fetch(PROS_ROLE_ID);
    if (!role) {
      try {
        role = await guild.roles.create({
          name: 'pros',
          color: 'Gold',
          reason: 'Rol especial para usuarios pros',
        });
      } catch (error) {
        console.log(error);
        throw new HttpError(500, 'No se pudo crear el rol "pros"');
      }
    }

    try {
      await member.roles.add(role);
      return { success: true, message: 'Rol "pros" asignado correctamente' };
    } catch (error) {
      throw new HttpError(500, 'No se pudo asignar el rol al usuario');
    }
  }
}
