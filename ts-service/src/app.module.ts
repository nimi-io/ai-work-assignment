import path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModuleOpts } from './shared/config/index.config';
import { CandidatesModule } from './candidates/candidates.module';
import { DocumentsModule } from './documents/documents.module';
import { SummariesModule } from './summaries/summaries.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { SummarizationModule } from './summarization/summarization.module';
import { AuthModule } from './auth/auth.module';
import { FakeAuthGuard } from './auth/fake-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOpts),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db =
          configService.get<
            () => {
              host: string;
              port: number;
              username: string;
              password: string;
              database: string;
              ssl: boolean;
              synchronize: boolean;
              logging: boolean;
            }
          >('database')!();
        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          ssl: db.ssl,
          synchronize: db.synchronize,
          logging: db.logging,
          entities: [path.join(__dirname, '**/*.entity.{ts,js}')],
          migrations: [path.join(__dirname, 'database/migrations/*.{ts,js}')],
          autoLoadEntities: true,
        };
      },
    }),
    AuthModule,
    CandidatesModule,
    DocumentsModule,
    SummariesModule,
    WorkspacesModule,
    SummarizationModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: FakeAuthGuard }],
})
export class AppModule {}
