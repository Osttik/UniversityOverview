import { Controller, Get } from '@nestjs/common';

@Controller('api/health')
export class HealthController {
  @Get()
  getHealth(): { status: string; stack: string } {
    return {
      status: 'ok',
      stack: 'angular-nest'
    };
  }
}
