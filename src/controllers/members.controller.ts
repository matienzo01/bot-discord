import { Controller, Post, Body, Authorized } from 'routing-controllers';
import { DiscordService } from '../services/discord.service';
import { inject } from 'inversify';
import { HttpError } from 'routing-controllers';

@Authorized()
@Controller('/members')
export class MembersController {
  constructor(
    @inject(DiscordService) private discordSrv: DiscordService
  ) {}

  @Post()
  addMember(@Body() body: { username: string }) {
    console.log('[HTTP] Nuevo miembro recibido:', body);
    return { success: true };
  }

  @Post('/pros')
  async addProsRole(@Body() body: { userId: string }) {
    const client = this.discordSrv.getClient();
    const guild = await client.guilds.fetch('1390837432169005056');
    if (!guild) throw new HttpError(500, 'No se encontró el servidor de Discord');

    const member = await guild.members.fetch(body.userId).catch(() => null);
    if (!member) throw new HttpError(404, 'Usuario no encontrado');

    let role = guild.roles.cache.find(r => r.name === 'pros');
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