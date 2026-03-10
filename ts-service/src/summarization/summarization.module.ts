import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiProvider } from './providers/gemini.provider';
import { ProviderService } from './providers/index.provider.service';

@Module({
  imports: [ConfigModule],
  providers: [GeminiProvider, ProviderService],
  exports: [ProviderService],
})
export class SummarizationModule {}
