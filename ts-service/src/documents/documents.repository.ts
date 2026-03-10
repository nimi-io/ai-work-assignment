import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../../shared/common/abstract/abstract.service';
import { CandidateDocument } from './entities/document.entity';

@Injectable()
export class DocumentsRepository extends AbstractRepository<CandidateDocument> {
  constructor(
    @InjectRepository(CandidateDocument)
    private readonly documentRepo: Repository<CandidateDocument>,
  ) {
    super(documentRepo);
  }
}
