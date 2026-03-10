import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModuleOpts } from './shared/config/index.config';

@Module({
  imports: [ConfigModule.forRoot(configModuleOpts)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
