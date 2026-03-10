import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModuleOpts } from './shared/config/index.config';
import { CandidatesModule } from './candidates/candidates.module';
import { DocumentsModule } from './documents/documents.module';
import { SummariesModule } from './summaries/summaries.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { SummarizationModule } from './summarization/summarization.module';

@Module({
  imports: [ConfigModule.forRoot(configModuleOpts), CandidatesModule, DocumentsModule, SummariesModule, WorkspacesModule, SummarizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
