import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

// این کلاس سرور WebSocket را روی همان پورت اپ (3001) باز می‌کند
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  // خود سرور ws؛ از روی آن به همه‌ی کلاینت‌های وصل‌شده دسترسی داریم
  @WebSocketServer()
  server: Server;

  // هر بار یک مرورگر به ws://localhost:3001 وصل شود، این متد صدا زده می‌شود
  handleConnection(client: WebSocket) {
    // وقتی این کلاینت یک پیام متنی فرستاد...
    client.on('message', (raw) => {
      // فرانت یک JSON می‌فرستد (نام + متن + ساعت)؛ سرور آن را باز نمی‌کند
      const payload = raw.toString();

      // همان رشته را برای همه‌ی کلاینت‌های متصل می‌فرستیم (broadcast)
      // پیام جایی ذخیره نمی‌شود؛ فقط همین لحظه پخش می‌شود
      this.server.clients.forEach((other) => {
        if (other.readyState === WebSocket.OPEN) {
          other.send(payload);
        }
      });
    });
  }
}
