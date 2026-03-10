import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { CandidatesRepository } from './candidates.repository';
import { Candidate } from './entities/candidate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  controllers: [CandidatesController],
  providers: [CandidatesService, CandidatesRepository],
  exports: [CandidatesRepository],
})
export class CandidatesModule {}
