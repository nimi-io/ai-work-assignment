/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setValue(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async getValue(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  generateKey(key: string): string {
    return `key: ${key}`;
  }

  async setArray<T>(key: string, array: T[]): Promise<void> {
    await this.redis.del(key);
    for (const element of array) {
      await this.redis.rpush(key, JSON.stringify(element));
    }
  }

  async getArray<T>(key: string): Promise<T[]> {
    const length = await this.redis.llen(key);
    const result: T[] = [];
    for (let i = 0; i < length; i++) {
      const element = await this.redis.lindex(key, i);
      if (element !== null) {
        result.push(JSON.parse(element) as T);
      }
    }
    return result;
  }

  async acquireLock(key: string, ttl: number): Promise<boolean> {
    // Use a transaction to set the lock with NX and PX options
    const result = await this.redis.set(key, 'locked', 'PX', ttl, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
