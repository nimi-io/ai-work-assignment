import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import {
  RedisModule as RedConn,
  RedisModuleOptions,
} from '@nestjs-modules/ioredis';
import axios from 'axios';
import { AXIOS_INSTANCE_TOKEN } from 'src/shared/constants/index.constant';
import appConfig from '../../config/index.config';

// Configuration for Redis connection
const redisConn: RedisModuleOptions = {
  url: appConfig().redis().url,
  type: 'single',
};

@Module({
  imports: [RedConn.forRoot(redisConn)],
  providers: [
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: axios,
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
