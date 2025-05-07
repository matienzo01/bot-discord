import { Controller, Post, Body } from 'routing-controllers';

@Controller('/members')
export class MembersController {
  @Post()
  addMember(@Body() body: { username: string }) {
    console.log('[HTTP] Nuevo miembro recibido:', body);
    return { success: true };
  }
}