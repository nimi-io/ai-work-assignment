import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SUMMARY_QUEUE } from '../constants/index.constant';

@Injectable()
export class QueueService {
  constructor(@InjectQueue(SUMMARY_QUEUE) private readonly queue: Queue) {}

  async addJob<T>(jobName: string, data: T): Promise<void> {
    await this.queue.add(jobName, data);
  }
}
