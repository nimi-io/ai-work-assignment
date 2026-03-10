import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ISummarizationProvider,
  SummarizationInput,
  SummarizationResult,
} from 'src/shared/interface/index.interface';
import { GeminiProvider } from './gemini.provider';
import { OpenAiProvider } from './openai.provider';

export enum AiVendor {
  GEMINI = 'gemini',
  OPENAI = 'openai',
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
    private readonly openAiProvider: OpenAiProvider,
    // Inject additional providers here as they are added:
    // private readonly anthropicProvider: AnthropicProvider,
  ) {}

  onModuleInit() {
    this.registry.set(AiVendor.GEMINI, this.geminiProvider);
    this.registry.set(AiVendor.OPENAI, this.openAiProvider);
    // this.registry.set(AiVendor.ANTHROPIC, this.anthropicProvider);

    const configured = this.configService
      .get<string>('aiProvider', AiVendor.GEMINI) as AiVendor;

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
