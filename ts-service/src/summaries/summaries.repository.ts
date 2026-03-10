import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../../shared/common/abstract/abstract.service';
import { CandidateSummary } from './entities/summary.entity';

@Injectable()
export class SummariesRepository extends AbstractRepository<CandidateSummary> {
  constructor(
    @InjectRepository(CandidateSummary)
    private readonly summaryRepo: Repository<CandidateSummary>,
  ) {
    super(summaryRepo);
  }
}
