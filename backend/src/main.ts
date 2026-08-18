import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // به‌جای socket.io از WebSocket معمولی (کتابخانه‌ی ws) استفاده می‌کنیم
  app.useWebSocketAdapter(new WsAdapter(app));

  // سرور HTTP و WebSocket هر دو روی پورت 3001 بالا می‌آیند
  await app.listen(3001);
  console.log('Backend آماده است: ws://localhost:3001');
}
bootstrap();
