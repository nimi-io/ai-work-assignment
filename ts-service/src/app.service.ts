import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'OK',
      bded: 'Yes',
      uptime: process.uptime(),
      date: new Date(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      hostname: require('os').hostname(),
      cpus: require('os').cpus().length,
    };
  }
}
