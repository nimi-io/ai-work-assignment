import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ISummarizationProvider,
  SummarizationInput,
  SummarizationResult,
} from 'src/shared/interface/index.interface';
import { GeminiProvider } from './gemini.provider';

export enum AiVendor {
  GEMINI = 'gemini',
  // OPENAI = 'openai',
  // ANTHROPIC = 'anthropic',
}

@Injectable()
export class ProviderService implements OnModuleInit {
  private readonly logger = new Logger(ProviderService.name);
  private readonly registry = new Map<AiVendor, ISummarizationProvider>();
  private activeVendor: AiVendor = AiVendor.GEMINI;

  constructor(
    private readonly configService: ConfigService,
    private readonly geminiProvider: GeminiProvider,
    // Inject additional providers here as they are added:
    // private readonly openAiProvider: OpenAiProvider,
  ) {}

  onModuleInit() {
    this.registry.set(AiVendor.GEMINI, this.geminiProvider);
    // this.registry.set(AiVendor.OPENAI, this.openAiProvider);

    const configured = this.configService
      .get<string>('AI_PROVIDER', AiVendor.GEMINI)
      .toLowerCase() as AiVendor;

    if (!this.registry.has(configured)) {
      this.logger.warn(
        `Unknown AI_PROVIDER "${configured}", falling back to "${AiVendor.GEMINI}"`,
      );
      this.activeVendor = AiVendor.GEMINI;
    } else {
      this.activeVendor = configured;
    }

    this.logger.log(`Active summarization provider: ${this.activeVendor}`);
  }

  getProvider(vendor?: AiVendor): ISummarizationProvider {
    const key = vendor ?? this.activeVendor;
    const provider = this.registry.get(key);
    if (!provider) {
      throw new Error(`No summarization provider registered for vendor "${key}"`);
    }
    return provider;
  }

  generateCandidateSummary(
    input: SummarizationInput,
    vendor?: AiVendor,
  ): Promise<SummarizationResult> {
    return this.getProvider(vendor).generateCandidateSummary(input);
  }
}
