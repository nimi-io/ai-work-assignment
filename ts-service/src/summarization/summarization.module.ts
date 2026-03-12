import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { ProviderService } from './providers/index.provider.service';

@Module({
  imports: [ConfigModule],
  providers: [GeminiProvider, OpenAiProvider, ProviderService],
  exports: [ProviderService],
})
export class SummarizationModule {}
