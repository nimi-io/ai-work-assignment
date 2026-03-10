import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummariesService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { SummariesRepository } from './summaries.repository';
import { CandidateSummary } from './entities/summary.entity';
import { CandidatesModule } from '../candidates/candidates.module';
import { SummarizationModule } from '../summarization/summarization.module';
import { QueueModule } from 'src/shared/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateSummary]),
    CandidatesModule,
    SummarizationModule,
    forwardRef(() => QueueModule),
  ],
  controllers: [SummariesController],
  providers: [SummariesService, SummariesRepository],
  exports: [SummariesRepository],
})
export class SummariesModule {}
