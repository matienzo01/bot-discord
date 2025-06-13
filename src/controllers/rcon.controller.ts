import { Post, Body, Controller, Authorized } from 'routing-controllers';
import { inject } from 'inversify';
import { RconService } from '../services/rcon.service';

@Authorized()
@Controller('/rcon')
export class RconController {
  constructor(
    @inject(RconService) private rconService: RconService
  ) { }

  @Post('/command')
  async executeCommand(@Body() body: { command: string }) {
    try {
      console.log('Comando a ejecutar controlador:', body.command);

      const response = 'hola' // await this.rconService.executeCommand(body.command);
      return { success: true, response };
    } catch (error: any) {
      console.error('Error en controlador RCON:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al ejecutar comando'
      };
    }
  }
}