import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

function clock() {
  const now = new Date();
  return (
    String(now.getHours()).padStart(2, '0') +
    ':' +
    String(now.getMinutes()).padStart(2, '0')
  );
}

// cors لازم است چون فرانت روی پورت 3000 است و این سرور روی 3001
@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { username: string; room: string },
  ) {
    const username = data.username?.trim();
    const room = data.room?.trim();
    if (!username || !room) {
      return;
    }

    // نام و اتاق را روی خود سوکت نگه می‌داریم (نه در دیتابیس)
    client.data.username = username;
    client.data.room = room;
    // این کلاینت فقط پیام‌های همین اتاق را می‌گیرد
    await client.join(room);

    client.to(room).emit('chat', {
      system: true,
      text: `${username} وارد چت شد`,
      time: clock(),
    });

    await this.sendUsers(room);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() text: string,
  ) {
    const room = client.data.room;
    const username = client.data.username;
    if (!room || !username || !text?.trim()) {
      return;
    }

    // فقط برای اعضای همین اتاق، نه همه‌ی کلاینت‌های سرور
    this.server.to(room).emit('chat', {
      username,
      text: text.trim(),
      time: clock(),
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() isTyping: boolean,
  ) {
    const room = client.data.room;
    const username = client.data.username;
    if (!room || !username) {
      return;
    }

    // client.to = همه در اتاق به‌جز خود فرستنده
    client.to(room).emit('typing', { username, isTyping });
  }

  async handleDisconnect(client: Socket) {
    const room = client.data.room;
    const username = client.data.username;
    if (!room || !username) {
      return;
    }

    // تب بسته یا قطع اتصال: به بقیه اتاق خبر بده
    client.to(room).emit('chat', {
      system: true,
      text: `${username} از چت خارج شد`,
      time: clock(),
    });
    client.to(room).emit('typing', { username, isTyping: false });

    await client.leave(room);
    await this.sendUsers(room);
  }

  private async sendUsers(room: string) {
    const sockets = await this.server.in(room).fetchSockets();
    const users = sockets
      .map((socket:any) => socket.data.username)
      .filter(Boolean);
    this.server.to(room).emit('users', users);
  }
}
