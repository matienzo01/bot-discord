import { Controller, Post, Body, Authorized } from 'routing-controllers';
import { DiscordService } from '../services/discord.service';
import { inject } from 'inversify';

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
    return this.discordSrv.addProsRoleToMember(body.userId);
  }
}