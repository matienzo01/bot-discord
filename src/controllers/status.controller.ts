import { Controller, Get } from 'routing-controllers';

@Controller('/status')
export class StatusController {
  constructor(
  ) { }

  @Get('/')
  async status() {
    return {
      status: 'ok'
    }
  }
}