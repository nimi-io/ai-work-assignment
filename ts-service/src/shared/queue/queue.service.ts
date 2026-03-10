import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppQueEvents } from '../constants/index.constant';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(AppQueEvents.Summary.created) private readonly queue: Queue,
  ) {}

  async addJob<T>(jobName: string, data: T): Promise<void> {
    await this.queue.add(jobName, data);
  }
}
