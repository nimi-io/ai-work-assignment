import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../../shared/common/abstract/abstract.service';
import { Candidate } from './entities/candidate.entity';

@Injectable()
export class CandidatesRepository extends AbstractRepository<Candidate> {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
  ) {
    super(candidateRepo);
  }
}
