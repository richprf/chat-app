import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

function mockPrice() {
  // قیمت ساختگی حدود ۵۸ هزار تومان؛ هر بار کمی بالا و پایین می‌شود
  return 58000 + Math.floor(Math.random() * 1000);
}

// namespace جدا تا با چت قاطی نشود
@WebSocketGateway({
  namespace: '/dollar',
  cors: { origin: 'http://localhost:3000' },
})
export class DollarGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  afterInit() {
    // هر ۳ ثانیه قیمت را برای همه کلاینت‌های وصل‌شده می‌فرستیم
    setInterval(() => {
      this.server.emit('price', mockPrice());
    }, 3000);
  }

  handleConnection(client: Socket) {
    // به محض وصل شدن، یک قیمت بفرست تا صفحه خالی نماند
    client.emit('price', mockPrice());
  }
}
