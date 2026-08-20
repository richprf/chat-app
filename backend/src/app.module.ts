import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { DollarGateway } from './dollar.gateway';

@Module({
  providers: [ChatGateway, DollarGateway],
})
export class AppModule {}
