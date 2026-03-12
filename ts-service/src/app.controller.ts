import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IsPublic } from './shared/decorators/public-request.decorator';

@Controller('Health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @IsPublic()
  getHealth() {
    return this.appService.getHealth();
  }
}
