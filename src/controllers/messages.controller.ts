import { Controller, Post, Body, HttpError, Req, Authorized } from 'routing-controllers';
import { inject } from 'inversify';
import { TYPES } from '../config/types';
import { DiscordService } from '../services/discord.service';
import { CHANNEL_ID } from '../constanst';
import { TextChannel } from 'discord.js';
import { Request } from 'express';

@Authorized()
@Controller('/messages')
export class MessagesController {
  constructor(
    @inject(TYPES.DiscordService) private discordSrv: DiscordService
  ) { }

  @Post()
  async postMessage(@Body() body: { content: string }, @Req() request: Request) {
    try {
      console.log('Request body:', request.body);
      console.log('Parsed body:', body);

      if (!body || typeof body !== 'object') {
        throw new HttpError(400, 'El body debe ser un objeto JSON');
      }

      if (!body.content || typeof body.content !== 'string') {
        throw new HttpError(400, 'El campo content es requerido y debe ser una cadena de texto');
      }

      const client = this.discordSrv.getClient();
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!channel?.isTextBased()) {
        throw new HttpError(400, 'Canal inválido');
      }

      await (channel as TextChannel).send(body.content);
      return { success: true, message: 'Mensaje enviado correctamente' };
    } catch (error) {
      console.error('Error en postMessage:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Error interno del servidor');
    }
  }
}