import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummariesService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { SummariesRepository } from './summaries.repository';
import { CandidateSummary } from './entities/summary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateSummary])],
  controllers: [SummariesController],
  providers: [SummariesService, SummariesRepository],
  exports: [SummariesRepository],
})
export class SummariesModule {}
