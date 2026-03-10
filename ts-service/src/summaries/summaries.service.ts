import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { SummariesRepository } from './summaries.repository';
import { CandidatesRepository } from '../candidates/candidates.repository';
import { ProviderService } from '../summarization/providers/index.provider.service';
import { CandidateSummary } from './entities/summary.entity';
import {
  SummaryStatus,
  RecommendedDecision,
} from '../shared/interface/index.interface';
import { Candidate } from '../candidates/entities/candidate.entity';

@Injectable()
export class SummariesService {
  private readonly logger = new Logger(SummariesService.name);

  constructor(
    private readonly summariesRepository: SummariesRepository,
    private readonly candidatesRepository: CandidatesRepository,
    private readonly providerService: ProviderService,
  ) {}

  async generate(
    candidateId: string,
    workspaceId: string,
  ): Promise<{ message: string; summaryId: string }> {
    const candidate = await this.resolveCandidate(candidateId, workspaceId, true);

    const summary = await this.summariesRepository.create({
      candidateId,
      status: SummaryStatus.PENDING,
    });

    // setImmediate(() => {
    //   void this.processGeneration(summary.id, candidate);   //run in background without blocking response
    // });

    return { message: 'Summary generation queued', summaryId: summary.id };
  }

  async findAllForCandidate(
    candidateId: string,
    workspaceId: string,
  ): Promise<CandidateSummary[]> {
    await this.resolveCandidate(candidateId, workspaceId);
    return this.summariesRepository.find({ candidateId });
  }

  async findOne(
    summaryId: string,
    candidateId: string,
    workspaceId: string,
  ): Promise<CandidateSummary> {
    await this.resolveCandidate(candidateId, workspaceId);
    const summary = await this.summariesRepository.findOne({
      id: summaryId,
      candidateId,
    });
    if (!summary) throw new NotFoundException('Summary not found');
    return summary;
  }

  // ---------- private ----------

  private async resolveCandidate(
    candidateId: string,
    workspaceId: string,
    withDocuments = false,
  ): Promise<Candidate> {
    const candidate = withDocuments
      ? await this.candidatesRepository.findWithRelations(
          { id: candidateId },
          ['documents'],
        )
      : await this.candidatesRepository.findOne({ id: candidateId });

    if (!candidate) throw new NotFoundException('Candidate not found');
    if (candidate.workspaceId !== workspaceId) {
      throw new ForbiddenException(
        'Candidate does not belong to this workspace',
      );
    }
    return candidate;
  }

  private async processGeneration(
    summaryId: string,
    candidate: Candidate,
  ): Promise<void> {
    try {
      const documents = (candidate.documents ?? []).map((d) => ({
        type: d.documentType,
        rawText: d.rawText,
      }));

      const result = await this.providerService.generateCandidateSummary({
        candidateId: candidate.id,
        documents,
      });

      await this.summariesRepository.findOneAndUpdate(
        { id: summaryId },
        {
          status: SummaryStatus.COMPLETED,
          score: result.score,
          strengths: result.strengths,
          concerns: result.concerns,
          summary: result.summary,
          recommendedDecision: result.recommendedDecision as RecommendedDecision,
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Summary generation failed for summaryId=${summaryId}: ${message}`,
      );
      await this.summariesRepository
        .findOneAndUpdate(
          { id: summaryId },
          { status: SummaryStatus.FAILED, errorMessage: message },
        )
        .catch(() => undefined);
    }
  }
}
