import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
// import { SUMMARY_QUEUE } from '../constants/index.constant';
import { SummariesModule } from 'src/summaries/summaries.module';
import { CandidatesModule } from 'src/candidates/candidates.module';
import { SummarizationModule } from 'src/summarization/summarization.module';
import { AppQueEvents } from '../constants/index.constant';

@Module({
  imports: [
    forwardRef(() => SummariesModule),
    CandidatesModule,
    SummarizationModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    BullModule.registerQueue({ name: AppQueEvents.Summary.created }), // Register the queue with BullModule
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
