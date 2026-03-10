import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AppQueEvents, SUMMARY_QUEUE } from '../constants/index.constant';
import { SummariesRepository } from 'src/summaries/summaries.repository';
import { CandidatesRepository } from 'src/candidates/candidates.repository';
import { ProviderService } from 'src/summarization/providers/index.provider.service';
import {
  RecommendedDecision,
  SummaryStatus,
} from '../interface/index.interface';

interface SummaryJobData {
  summaryId: string;
  candidateId: string;
}

@Processor(SUMMARY_QUEUE)
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    private readonly summariesRepository: SummariesRepository,
    private readonly candidatesRepository: CandidatesRepository,
    private readonly providerService: ProviderService,
  ) {
    super();
  }

  async process(job: Job<SummaryJobData>): Promise<void> {
    this.logger.debug(`Processing job ${job.id} [${job.name}]`);

    switch (job.name) {
      case AppQueEvents.Summary.created:
        await this.handleGenerateSummary(job.data);
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleGenerateSummary({
    summaryId,
    candidateId,
  }: SummaryJobData): Promise<void> {
    try {
      const candidate = await this.candidatesRepository.findWithRelations(
        { id: candidateId },
        ['documents'],
      );

      if (!candidate) {
        throw new Error(`Candidate ${candidateId} not found`);
      }

      const documents = (candidate.documents ?? []).map((d) => ({
        type: d.documentType,
        rawText: d.rawText,
      }));

      const result = await this.providerService.generateCandidateSummary({
        candidateId,
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
          recommendedDecision:
            result.recommendedDecision as RecommendedDecision,
        },
      );

      this.logger.debug(`Summary ${summaryId} completed`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Summary generation failed [summaryId=${summaryId}]: ${message}`,
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
