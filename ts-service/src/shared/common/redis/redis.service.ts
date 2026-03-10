import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}
  async setValue(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }
  async getValue(key: string): Promise<string> {
    return await this.redis.get(key);
  }
  async generateKey(key: string): Promise<string> {
    return `key: ${key}`;
  }
  async setArray(key: string, array: any[]): Promise<void> {
    await this.redis.del(key); // Ensure the key is empty before setting the array
    for (const element of array) {
      await this.redis.rpush(key, JSON.stringify(element));
    }
  }

  async getArray(key: string): Promise<any[]> {
    const length = await this.redis.llen(key);
    const array = [];
    for (let i = 0; i < length; i++) {
      const element = await this.redis.lindex(key, i);
      array.push(JSON.parse(element));
    }
    return array;
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
