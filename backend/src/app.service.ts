import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hi you\'ve reached SentinelOps API BACKEND! Pleased to meet you here';
  }
}
