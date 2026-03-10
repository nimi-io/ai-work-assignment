import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummariesService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { SummariesRepository } from './summaries.repository';
import { CandidateSummary } from './entities/summary.entity';
import { CandidatesModule } from '../candidates/candidates.module';
import { SummarizationModule } from '../summarization/summarization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateSummary]),
    CandidatesModule,
    SummarizationModule,
  ],
  controllers: [SummariesController],
  providers: [SummariesService, SummariesRepository],
  exports: [SummariesRepository],
})
export class SummariesModule {}
