import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// قیمت دلار آزاد را از JSON عمومی TGJU می‌خوانیم (بدون API key)
async function fetchDollarToman() {
  const res = await fetch('https://call5.tgju.org/ajax.json');
  const data = await res.json();
  // p به ریال است؛ تقسیم بر ۱۰ می‌شود تومان
  const rial = Number(String(data.current.price_dollar_rl.p).replace(/,/g, ''));
  return Math.round(rial / 10);
}

@WebSocketGateway({
  namespace: '/dollar',
  cors: { origin: 'http://localhost:3000' },
})
export class DollarGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  afterInit() {
    // هر ۵ ثانیه قیمت واقعی را می‌گیریم و برای همه کلاینت‌ها می‌فرستیم
    setInterval(async () => {
      try {
        const price = await fetchDollarToman();
        this.server.emit('price', price);
      } catch (err) {
        console.error('خواندن قیمت دلار ناموفق بود', err);
      }
    }, 5000);
  }

  async handleConnection(client: Socket) {
    try {
      // به محض وصل شدن، آخرین قیمت واقعی را بفرست
      const price = await fetchDollarToman();
      client.emit('price', price);
    } catch (err) {
      console.error('خواندن قیمت دلار ناموفق بود', err);
    }
  }
}
