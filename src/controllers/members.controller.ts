import { Controller, Post, Body, Authorized } from 'routing-controllers';

@Authorized()
@Controller('/members')
export class MembersController {
  @Post()
  addMember(@Body() body: { username: string }) {
    console.log('[HTTP] Nuevo miembro recibido:', body);
    return { success: true };
  }
}