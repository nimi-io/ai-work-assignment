import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CandidatesRepository } from './candidates.repository';
import { Candidate } from './entities/candidate.entity';

@Injectable()
export class CandidatesService {
  constructor(private readonly candidatesRepository: CandidatesRepository) {}

  create(dto: CreateCandidateDto): Promise<Candidate> {
    return this.candidatesRepository.create(dto);
  }

  async findOne(candidateId: string, workspaceId: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({
      id: candidateId,
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (candidate.workspaceId !== workspaceId) {
      throw new ForbiddenException(
        'Candidate does not belong to this workspace',
      );
    }
    return candidate;
  }
}
