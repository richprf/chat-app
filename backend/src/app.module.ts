import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
  // ChatGateway را اینجا ثبت می‌کنیم تا Nest آن را راه بیندازد
  providers: [ChatGateway],
})
export class AppModule {}
