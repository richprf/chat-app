import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // آداپتر پیش‌فرض NestJS همان socket.io است؛ با آن می‌توان از join/to(room) استفاده کرد
  await app.listen(3001);
  console.log('Backend آماده است: http://localhost:3001');
}
bootstrap();
